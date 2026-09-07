# Changelog

All notable changes to this project are documented here.
Format based on Keep a Changelog, adheres to Semantic Versioning.

## [0.1.1] - 2026-09-07

### Added
- Initial database migration (all four tables)
- Health endpoint smoke test
- Alembic mako template

### Fixed
- Alembic config: DATABASE_URL injection + logging guard
- CI failures: pyproject parse error, vite v7 pin, pytest exit code

### Verified
- End-to-end API: vehicle, task, log creation (201s)

## [0.1.0] - 2026-09-05

### Added
- Initial scaffold: FastAPI backend, React frontend, Postgres schema
- Pydantic schemas and routers for vehicles, tasks, logs, attachments
- S3 service stub for attachment handling

### Changed
- Fixed pyproject build backend to setuptools.build_meta
- Switched container runtime to Podman (rootless)

### Fixed
- Import chain issues in models/schemas/routers packages