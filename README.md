# Vehicle Maintenance Tracker

Track maintenance across multiple vehicles: maintenance logs, recurring tasks, a parts
inventory with stock tracking, and a spending-trends graph.

Built with FastAPI (Python), React + Vite + Mantine, and PostgreSQL.

## Prerequisites

- **Python 3.11 or newer** - `python --version`
- **Node.js 20 or newer** - `node --version`
- **Docker** with Docker Compose - `docker --version`

## Quick start

This gets a running app you can click through. Use three terminal windows: one for the
database, one for the backend, and one for the frontend.

### 1. Start the database

Start the existing container (it is created if it does not exist yet):

```bash
docker compose up db -d
```

### 2. Start the backend

```bash
cd backend

# One-time setup (skip after the first run)
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
cp .env.example .env

# Apply the database schema (a no-op if it is already applied)
alembic upgrade head

# Run the API
uvicorn app.main:app --reload
```

The API is now live:
- Swagger docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health returns `{"status":"ok"}`

### 3. Start the frontend

In a second terminal:

```bash
cd frontend

# One-time setup (skip after the first run)
npm ci

# Run the dev server
npm run dev
```

Open http://localhost:5173.

> The frontend calls the backend directly at `http://localhost:8000`, so keep the backend running.

### 4. Use the app

Create a vehicle, add a task, and log maintenance. Add parts to the inventory and link
them to a log (stock decreases by the amount used). Open a vehicle to see its maintenance
logs and the spending-trends graph.

## Stopping

```bash
docker compose down
```

Stop the backend and frontend with `Ctrl+C` in their terminals.

## Start over from scratch (optional)

**Warning: this deletes all data in the database.** Use only when you want a clean slate.

```bash
docker compose down -v
docker compose up db -d
cd backend
alembic upgrade head
```

## For developers (optional)

Run the backend test suite:

```bash
cd backend
pip install pytest httpx
pytest
```

If you use `uv`, run `uv sync --group dev` inside `backend/` instead to install the
package and its dev tools together.

## Configuration

Copy `backend/.env.example` to `backend/.env` and edit as needed:

| Variable       | Purpose                                                  |
| -------------- | -------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string                             |
| `S3_BUCKET`    | Bucket for attachments - leave empty to skip S3          |
| `S3_REGION`    | Region for the S3 bucket                                 |
| `CORS_ORIGINS` | Allowed origins (defaults already include the frontend)  |

## Troubleshooting

- **Database errors / "connection refused"** - the database is not running. Start it with
  `docker compose up db -d`.
- **"relation "vehicles" does not exist"** - the schema was not applied. Run
  `alembic upgrade head` inside `backend/`.
- **Backend will not start** - confirm the virtual environment is active and `backend/.env`
  exists.
- **Frontend shows nothing / API errors** - confirm the backend is running on port 8000.
