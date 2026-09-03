# Vehicle Maintenance Tracker

Track maintenance for multiple vehicles — cars, motorcycles, trucks.

## Stack
- Backend: Python + FastAPI + SQLAlchemy
- Frontend: React + Vite + Mantine + TanStack Query
- Database: PostgreSQL
- Storage: AWS S3 (presigned URLs for attachments)

## Local Development

Start database:
  docker compose up db -d

Backend:
  cd backend
  cp .env.example .env
  pip install -e .
  uvicorn app.main:app --reload

Frontend:
  cd frontend
  npm install
  npm run dev

Backend API docs: http://localhost:8000/docs
Frontend: http://localhost:5173
