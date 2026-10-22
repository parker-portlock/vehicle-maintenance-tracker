#!/bin/sh
set -e

# Wait for PostgreSQL, then apply migrations (retry while the db starts up)
attempt=1
until alembic upgrade head; do
    attempt=$((attempt + 1))
    if [ "$attempt" -gt 30 ]; then
        echo "ERROR: database migrations failed after 30 attempts" >&2
        exit 1
    fi
    echo "Database not ready yet (attempt ${attempt}), retrying in 2s..."
    sleep 2
done

uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
trap 'kill $BACKEND_PID' EXIT INT TERM

nginx -g "daemon off;"
