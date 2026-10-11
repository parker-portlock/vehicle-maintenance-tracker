from uuid import UUID
import hashlib
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Vehicle, MaintenanceTask, MaintenanceLog, Part, LogPart
from app.schemas.maintenance_log import (
    LogCreate,
    LogUpdate,
    LogOut,
    LogPartRef,
)

router = APIRouter(tags=["logs"])


def _build_log_parts(db: Session, items: list[LogPartRef] | None) -> list[LogPart]:
    """Validate a list of part references and build LogPart rows.

    Duplicates are collapsed (last quantity wins) to respect the composite
    primary key, and each part id must reference an existing inventory part.
    """
    if not items:
        return []
    seen: dict[UUID, LogPart] = {}
    for item in items:
        if db.get(Part, item.id) is None:
            raise HTTPException(status_code=400, detail=f"Part not found: {item.id}")
        seen[item.id] = LogPart(part_id=item.id, quantity=item.quantity)
    return list(seen.values())


@router.get(
    "/vehicles/{vehicle_id}/logs", response_model=list[LogOut], tags=["logs"]
)
def list_logs_for_vehicle(vehicle_id: UUID, db: Session = Depends(get_db)):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    stmt = (
        select(MaintenanceLog)
        .where(MaintenanceLog.vehicle_id == vehicle_id)
        .order_by(MaintenanceLog.performed_on.desc(), MaintenanceLog.mileage.desc())
    )
    return db.scalars(stmt).all()


@router.post(
    "/vehicles/{vehicle_id}/logs", response_model=LogOut,
    status_code=status.HTTP_201_CREATED,
)
def create_log(
    vehicle_id: UUID, payload: LogCreate, db: Session = Depends(get_db)
):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # If task_name is provided but no task_id, create a temporary task
    task_id = payload.task_id
    if payload.task_name and not payload.task_id:
        # Create a hash-based UUID from the vehicle_id and task name to ensure uniqueness
        task_hash = hashlib.md5(f"{vehicle_id}{payload.task_name}".encode()).hexdigest()
        # Convert hash to UUID format (version 3 or 5)
        task_id = uuid.uuid5(uuid.NAMESPACE_DNS, task_hash)
        
        # Check if this task already exists, if not create it
        existing_task = db.scalar(select(MaintenanceTask).where(MaintenanceTask.id == task_id))
        if not existing_task:
            task = MaintenanceTask(
                id=task_id,
                name=payload.task_name,
                description=None,
                interval_miles=None,
                interval_months=None
            )
            db.add(task)
            db.flush()  # Make sure we have the task ID in DB before continuing
    
    # Check that either task_id or task_name is provided (but not both empty)
    if not task_id and not payload.task_name:
        raise HTTPException(status_code=422, detail="Either task_id or task_name must be provided")
    
    task = db.get(MaintenanceTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    data = payload.model_dump()
    # Remove task_name and parts_used from data: parts live in the log_parts table
    data.pop("task_name", None)
    data.pop("parts_used", None)

    log = MaintenanceLog(vehicle_id=vehicle_id, **data)
    log.parts_used.extend(_build_log_parts(db, payload.parts_used))
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/logs/{log_id}", response_model=LogOut)
def get_log(log_id: UUID, db: Session = Depends(get_db)):
    log = db.get(MaintenanceLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log


@router.put("/logs/{log_id}", response_model=LogOut)
def update_log(log_id: UUID, payload: LogUpdate, db: Session = Depends(get_db)):
    log = db.get(MaintenanceLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    # Handle task name update
    if payload.task_name and not payload.task_id:
        # Create a hash-based UUID from the vehicle_id and task name to ensure uniqueness
        task_hash = hashlib.md5(f"{log.vehicle_id}{payload.task_name}".encode()).hexdigest()
        # Convert hash to UUID format (version 3 or 5)
        task_id = uuid.uuid5(uuid.NAMESPACE_DNS, task_hash)
        
        # Check if this task already exists, if not create it
        existing_task = db.scalar(select(MaintenanceTask).where(MaintenanceTask.id == task_id))
        if not existing_task:
            task = MaintenanceTask(
                id=task_id,
                name=payload.task_name,
                description=None,
                interval_miles=None,
                interval_months=None
            )
            db.add(task)
            db.flush()  # Make sure we have the task ID in DB before continuing
        
        payload.task_id = task_id

    data = payload.model_dump(exclude_unset=True)
    data.pop("parts_used", None)

    for field, value in data.items():
        setattr(log, field, value)
    # Only touch parts_used when the client explicitly provided it. Use the
    # typed pydantic objects (payload.parts_used), not the dumped dicts.
    if "parts_used" in payload.model_fields_set:
        log.parts_used.clear()
        log.parts_used.extend(_build_log_parts(db, payload.parts_used))
    db.commit()
    db.refresh(log)
    return log


@router.delete("/logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_log(log_id: UUID, db: Session = Depends(get_db)):
    log = db.get(MaintenanceLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)  # cascades attachments
    db.commit()