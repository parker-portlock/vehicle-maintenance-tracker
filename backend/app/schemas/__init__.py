from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleOut
from app.schemas.maintenance_task import TaskCreate, TaskUpdate, TaskOut
from app.schemas.maintenance_log import LogCreate, LogUpdate, LogOut
from app.schemas.attachment import (
    PresignRequest,
    PresignResponse,
    AttachmentConfirm,
    AttachmentOut,
    AttachmentUrlOut,
)

__all__ = [
    "VehicleCreate", "VehicleUpdate", "VehicleOut",
    "TaskCreate", "TaskUpdate", "TaskOut",
    "LogCreate", "LogUpdate", "LogOut",
    "PresignRequest", "PresignResponse",
    "AttachmentConfirm", "AttachmentOut", "AttachmentUrlOut",
]