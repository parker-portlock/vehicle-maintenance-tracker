from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MaintenanceLog, Attachment
from app.schemas.attachment import (
    PresignRequest, PresignResponse, AttachmentConfirm,
    AttachmentOut, AttachmentUrlOut,
)
from app.services import s3

router = APIRouter(tags=["attachments"])


@router.get(
    "/logs/{log_id}/attachments", response_model=list[AttachmentOut]
)
def list_attachments(log_id: UUID, db: Session = Depends(get_db)):
    log = db.get(MaintenanceLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    stmt = select(Attachment).where(Attachment.log_id == log_id)
    return db.scalars(stmt).all()


@router.post(
    "/logs/{log_id}/attachments/presign", response_model=PresignResponse
)
def presign_upload(
    log_id: UUID, payload: PresignRequest, db: Session = Depends(get_db)
):
    log = db.get(MaintenanceLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    allowed_types = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
    if payload.content_type not in allowed_types:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported content type: {payload.content_type}",
        )

    upload_url, s3_key, expires = s3.generate_presigned_upload(
        log_id=log_id, file_name=payload.file_name,
        content_type=payload.content_type,
    )
    return PresignResponse(upload_url=upload_url, s3_key=s3_key, expires_in=expires)


@router.post(
    "/logs/{log_id}/attachments", response_model=AttachmentOut,
    status_code=status.HTTP_201_CREATED,
)
def confirm_attachment(
    log_id: UUID, payload: AttachmentConfirm, db: Session = Depends(get_db)
):
    log = db.get(MaintenanceLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    if not s3.object_exists(payload.s3_key):
        raise HTTPException(
            status_code=409, detail="Upload not found or not completed"
        )

    attachment = Attachment(log_id=log_id, **payload.model_dump())
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment


@router.get("/attachments/{attachment_id}/url", response_model=AttachmentUrlOut)
def get_download_url(attachment_id: UUID, db: Session = Depends(get_db)):
    attachment = db.get(Attachment, attachment_id)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    url, expires = s3.generate_presigned_download(attachment.s3_key)
    return AttachmentUrlOut(download_url=url, expires_in=expires)


@router.delete("/attachments/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attachment(attachment_id: UUID, db: Session = Depends(get_db)):
    attachment = db.get(Attachment, attachment_id)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    s3.delete_object(attachment.s3_key)
    db.delete(attachment)
    db.commit()