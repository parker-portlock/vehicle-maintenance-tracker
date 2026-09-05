from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None
    interval_miles: int | None = Field(default=None, ge=0)
    interval_months: int | None = Field(default=None, ge=0)


class TaskUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    interval_miles: int | None = Field(default=None, ge=0)
    interval_months: int | None = Field(default=None, ge=0)


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None
    interval_miles: int | None
    interval_months: int | None