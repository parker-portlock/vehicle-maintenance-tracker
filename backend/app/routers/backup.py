import json
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.backup import build_backup_payload, restore_from_payload

router = APIRouter(prefix="/backup", tags=["backup"])


@router.get("/export")
def export_backup(db: Session = Depends(get_db)):
    """Return the entire database as a downloadable JSON file."""
    payload = build_backup_payload(db)
    filename = f"vehicle-maintenance-backup-{datetime.now(UTC).strftime('%Y-%m-%d')}.json"
    return Response(
        content=json.dumps(payload, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/restore")
async def restore_backup(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Replace the entire database with the uploaded backup file."""
    raw = await file.read()
    try:
        payload = json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise HTTPException(
            status_code=400, detail="The uploaded file is not valid JSON."
        )
    try:
        restored = restore_from_payload(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Restore failed. The current database was not modified.",
        )
    return {"status": "restored", "tables": restored}
