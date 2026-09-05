from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class VehicleCreate(BaseModel):
    make: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=100)
    type: str = Field(min_length=1, max_length=50)
    year: int = Field(ge=1886, le=2100)
    vin: str | None = Field(default=None, max_length=32)
    purchase_date: date | None = None


class VehicleUpdate(BaseModel):
    make: str | None = Field(default=None, min_length=1, max_length=100)
    model: str | None = Field(default=None, min_length=1, max_length=100)
    type: str | None = Field(default=None, min_length=1, max_length=50)
    year: int | None = Field(default=None, ge=1886, le=2100)
    vin: str | None = Field(default=None, max_length=32)
    purchase_date: date | None = None


class VehicleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    make: str
    model: str
    type: str
    year: int
    vin: str | None
    purchase_date: date | None
    created_at: datetime
    updated_at: datetime