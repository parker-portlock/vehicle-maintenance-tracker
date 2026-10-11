from app.models.vehicle import Vehicle
from app.models.maintenance_task import MaintenanceTask
from app.models.maintenance_log import MaintenanceLog
from app.models.attachment import Attachment
from app.models.part import Part
from app.models.log_part import LogPart

__all__ = [
    "Vehicle", "MaintenanceTask", "MaintenanceLog", "Attachment", "Part",
    "LogPart",
]