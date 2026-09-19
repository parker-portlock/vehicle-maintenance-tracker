from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class PartBase(BaseModel):
    brand: str
    name: str
    category: str
    part_number: str
    specification: Optional[str] = None
    capacity: Optional[float] = None
    cost: Optional[float] = None
    quantity: int
    supplier: Optional[str] = None
    notes: Optional[str] = None

class PartCreate(PartBase):
    pass

class PartUpdate(PartBase):
    pass

class PartOut(PartBase):
    id: UUID
    
    class Config:
        from_attributes = True