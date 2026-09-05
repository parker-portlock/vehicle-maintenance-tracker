from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Vehicle, MaintenanceTask, MaintenanceLog
from app.schemas.maintenance_log import LogCreate, LogUpdate, LogOut

router = APIRouter(tags=["logs"])


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
    task = db.get(MaintenanceTask, payload.task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    data = payload.model_dump()
    parts = data.pop("parts_used", None)
    if parts is not None:
        data["parts_used"] = {"items": parts}  # wrap list for JSONB

    log = MaintenanceLog(vehicle_id=vehicle_id, **data)
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

    data = payload.model_dump(exclude_unset=True)
    parts = data.pop("parts_used", None)
    if parts is not None:
        data["parts_used"] = {"items": parts}

    for field, value in data.items():
        setattr(log, field, value)
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