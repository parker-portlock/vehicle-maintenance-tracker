from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Part
from app.schemas.part import PartCreate, PartUpdate, PartOut

router = APIRouter(prefix="/parts", tags=["parts"])

@router.get("", response_model=list[PartOut])
def list_parts(db: Session = Depends(get_db)):
    return db.scalars(select(Part).order_by(Part.name)).all()

@router.post("", response_model=PartOut, status_code=status.HTTP_201_CREATED)
def create_part(payload: PartCreate, db: Session = Depends(get_db)):
    part = Part(**payload.model_dump())
    db.add(part)
    db.commit()
    db.refresh(part)
    return part

@router.get("/{part_id}", response_model=PartOut)
def get_part(part_id: UUID, db: Session = Depends(get_db)):
    part = db.get(Part, part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    return part

@router.put("/{part_id}", response_model=PartOut)
def update_part(part_id: UUID, payload: PartUpdate, db: Session = Depends(get_db)):
    part = db.get(Part, part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(part, field, value)
    db.commit()
    db.refresh(part)
    return part

@router.delete("/{part_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_part(part_id: UUID, db: Session = Depends(get_db)):
    part = db.get(Part, part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    db.delete(part)
    db.commit()