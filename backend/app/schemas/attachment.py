from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PresignRequest(BaseModel):
    file_name: str = Field(min_length=1, max_length=255)
    content_type: str = Field(max_length=100)
    file_size_bytes: int = Field(gt=0, le=25 * 1024 * 1024)  # 25 MB cap


class PresignResponse(BaseModel):
    upload_url: str
    s3_key: str
    expires_in: int


class AttachmentConfirm(BaseModel):
    file_name: str = Field(min_length=1, max_length=255)
    s3_key: str = Field(min_length=1)
    content_type: str = Field(max_length=100)
    file_size_bytes: int | None = None


class AttachmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    log_id: UUID
    file_name: str
    s3_key: str
    content_type: str
    file_size_bytes: int | None
    uploaded_at: datetime


class AttachmentUrlOut(BaseModel):
    download_url: str
    expires_in: int