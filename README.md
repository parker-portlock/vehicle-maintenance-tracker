# Vehicle Maintenance Tracker

[![License: Apache 2.0 with Commons Clause](https://img.shields.io/badge/license-Apache%202.0%20with%20Commons%20Clause-red.svg)](./LICENSE)

Self-hosted vehicle maintenance tracking for individuals, small shops, and businesses.

---

## License

Vehicle Maintenance Tracker (VMT) is **free to use, modify, and redistribute — including for commercial purposes** — under
[Apache License 2.0 with Commons Clause](./LICENSE). You may not sell this software or any
derivative of its source code. See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for
third-party license attributions.

If VMT is useful to you or your business, use it freely — that's the point.

## *A note from the creator:*
Hello! This is a side project of mine I have been wanting to build for a while. This maintenance tracking app allows you to create maintenance logs, track your maintenance across multiple vehicles, track parts and consumable inventory, and more!

I felt like there was a gap I needed fill with keeping track of maintenance and parts inventory across my vehicles and garage. My goal with this is to build a straight-forward and useful tool that can give you insights into how often you have to maintain your vehicle and how much you are spending on it.

***Necessary Disclaimers:***

I built this with the aid of AI tools. I used Proton's Lumo to assist with planning the architecture, and I am using Qwen models locally on my machine to assist with code-related tasks. This is being used as a side project to assist with "career development" more than anything, but at the same time, I wanted to see how far I can push these tools to help me build something that involves technology I don't have experience with.

**This is not my full time job.**

With that being said, I hope you enjoy this application and find some use out of it.

## Prerequisites

- **Docker** with Docker Compose - `docker --version`

## Quick start

```bash
docker compose up --build -d
```

Open http://localhost:8080. The database schema is applied automatically on
startup, so no separate migration step is needed.

Create a vehicle, add a task, and log maintenance. Add parts to the inventory
and link them to a log (stock decreases by the amount used). Open a vehicle to
see its maintenance logs and the spending-trends graph.

## Options

| Variable      | Purpose               | Default    |
| ------------- | --------------------- | ---------- |
| `DB_PASSWORD` | PostgreSQL password   | `postgres` |
| `APP_PORT`    | Host port for the app | `8080`     |

```bash
# Example: custom password and port
DB_PASSWORD=secret APP_PORT=9000 docker compose up --build -d
```

## Your data

- **Back up / restore** - the Settings page downloads a JSON backup of the
  whole database and can restore one (restore replaces all current data).
- **Stop the app** - `docker compose down`
- **Start over** - `docker compose down -v` deletes the database. Take a
  backup first if you want to keep anything.

## For developers

Run the stack outside Docker (three terminal windows):

```bash
docker compose up db -d   # database

cd backend                # API on http://localhost:8000
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
cp .env.example .env      # one-time
alembic upgrade head
uvicorn app.main:app --reload

cd frontend               # app on http://localhost:5173
npm ci
npm run dev
```

Backend tests:

```bash
cd backend
pip install pytest httpx
pytest
```

Backend configuration lives in `backend/.env` (see `backend/.env.example`):
`DATABASE_URL`, `S3_BUCKET`, `S3_REGION`, `CORS_ORIGINS`.

