from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.maintenance_task import TaskOut


class LogCreate(BaseModel):
    task_id: UUID | None = None
    task_name: str | None = None
    mileage: int = Field(ge=0)
    performed_on: date
    cost: Decimal | None = Field(default=None, ge=0)
    notes: str | None = None
    parts_used: list[Any] | None = None


class LogUpdate(BaseModel):
    task_id: UUID | None = None
    task_name: str | None = None
    mileage: int | None = Field(default=None, ge=0)
    performed_on: date | None = None
    cost: Decimal | None = Field(default=None, ge=0)
    notes: str | None = None
    parts_used: list[Any] | None = None


class LogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    vehicle_id: UUID
    task: TaskOut
    mileage: int
    performed_on: date
    cost: Decimal | None
    notes: str | None
    parts_used: dict | None
    created_at: datetime