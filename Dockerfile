# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: build the frontend (React + Vite) on Alpine
# ---------------------------------------------------------------------------
FROM node:20-alpine AS web
WORKDIR /src
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# vite.config.ts reads ../VERSION, so the VERSION file sits one level up
COPY VERSION /VERSION
# Empty base URL => the browser calls the API on the same origin.
# nginx proxies /api to the FastAPI process inside this same image.
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: install Python dependencies (Alpine build toolchain required only
# here so psycopg2 can be compiled against libpq)
# ---------------------------------------------------------------------------
FROM python:3.12-alpine AS pybuilder
RUN apk add --no-cache gcc musl-dev postgresql-dev
WORKDIR /app
COPY backend/pyproject.toml ./
COPY backend/app ./app
RUN pip install --no-cache-dir --prefix=/install .

# ---------------------------------------------------------------------------
# Stage 3: runtime image - nginx serves the frontend and proxies /api to
# FastAPI (uvicorn). Single lightweight Alpine image for the whole app.
# ---------------------------------------------------------------------------
FROM python:3.12-alpine
RUN apk add --no-cache nginx libpq libgcc
ENV PATH=/install/bin:$PATH \
    PYTHONPATH=/install/lib/python3.12/site-packages \
    PYTHONUNBUFFERED=1
WORKDIR /app
COPY --from=pybuilder /install /install
COPY backend/app ./app
COPY backend/alembic ./alembic
COPY backend/alembic.ini ./
COPY --from=web /src/dist /app/static
COPY docker/nginx.conf /etc/nginx/http.d/app.conf
# Alpine's stock default_server returns 404 for all requests and would
# shadow our app server block
RUN rm -f /etc/nginx/http.d/default.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=6 \
    CMD wget -q --spider http://127.0.0.1/ || exit 1
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
