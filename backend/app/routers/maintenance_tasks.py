from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MaintenanceTask, MaintenanceLog
from app.schemas.maintenance_task import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskOut])
def list_tasks(db: Session = Depends(get_db)):
    return db.scalars(select(MaintenanceTask).order_by(MaintenanceTask.name)).all()


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = MaintenanceTask(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: UUID, db: Session = Depends(get_db)):
    task = db.get(MaintenanceTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: UUID, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.get(MaintenanceTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: UUID, db: Session = Depends(get_db)):
    task = db.get(MaintenanceTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    referenced = db.scalar(
        select(MaintenanceLog.id).where(MaintenanceLog.task_id == task_id).limit(1)
    )
    if referenced:
        raise HTTPException(
            status_code=409,
            detail="Task is referenced by maintenance logs and cannot be deleted",
        )
    db.delete(task)
    db.commit()