from uuid import UUID

from sqlalchemy import Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class LogPart(Base):
    """Association row linking a MaintenanceLog to a Part, with a quantity.

    A log's ``parts_used`` collection is a list of these objects. The
    ``id``, ``brand``, ``name`` and ``category`` properties read from the
    related part so the API can serialize each entry as
    ``{id, brand, name, category, quantity}`` (where ``id`` is the part id).
    """

    __tablename__ = "log_parts"

    log_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("maintenance_logs.id", ondelete="CASCADE"),
        primary_key=True,
    )
    part_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("parts.id", ondelete="CASCADE"),
        primary_key=True,
    )
    quantity: Mapped[int | None] = mapped_column(Integer)

    log = relationship("MaintenanceLog", back_populates="parts_used")
    part = relationship("Part", back_populates="logs", lazy="joined")

    @property
    def id(self) -> UUID:
        """The referenced part's id (matches the id the API accepts on write)."""
        return self.part.id

    @property
    def brand(self) -> str:
        return self.part.brand

    @property
    def name(self) -> str:
        return self.part.name

    @property
    def category(self) -> str:
        return self.part.category