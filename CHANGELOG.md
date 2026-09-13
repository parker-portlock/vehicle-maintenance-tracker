# Changelog

All notable changes to this project are documented here.
Format based on Keep a Changelog, adheres to Semantic Versioning.

## [0.2.0] - 2026-09-13

### Added
- Initial frontend implementation with React and Mantine UI
- Full CRUD operations for vehicles and maintenance logs
- Task name support in logs (auto-creates tasks if needed)
- CORS improvements with wildcard origin support
- API client with error handling
- React Query integration for data fetching
- TypeScript type definitions

### Changed
- Enhanced CORS configuration to support multiple origins including common dev ports
- Improved task handling in maintenance logs to allow task name references
- Updated frontend dependencies (React 18, Mantine 7, TanStack Query 5)

### Fixed
- CORS issues for some of the task posts
- Multiple errors for API calls
- Frontend build configuration

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