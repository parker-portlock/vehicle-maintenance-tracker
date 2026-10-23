from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import vehicles, maintenance_tasks, maintenance_logs, attachments, parts, backup

app = FastAPI(title="Vehicle Maintenance Tracker", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(vehicles.router, prefix="/api/v1")
app.include_router(maintenance_tasks.router, prefix="/api/v1")
app.include_router(maintenance_logs.router, prefix="/api/v1")
app.include_router(attachments.router, prefix="/api/v1")
app.include_router(parts.router, prefix="/api/v1")
app.include_router(backup.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}