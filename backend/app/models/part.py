import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Numeric, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class Part(Base):
    __tablename__ = "parts"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    brand: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    part_number: Mapped[str] = mapped_column(String, nullable=False)
    specification: Mapped[str | None] = mapped_column(String)
    capacity: Mapped[float | None] = mapped_column(Numeric(10, 2))
    cost: Mapped[float | None] = mapped_column(Numeric(10, 2))
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    supplier: Mapped[str | None] = mapped_column(String)
    notes: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    logs = relationship(
        "LogPart", back_populates="part", cascade="all, delete-orphan"
    )