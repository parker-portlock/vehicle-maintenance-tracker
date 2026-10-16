# Changelog

All notable changes to this project are documented here.
Format based on Keep a Changelog, adheres to Semantic Versioning.

## [0.6.1] - 2026-10-16

### Changed
- Log Maintenance form: "Performed On" field uses a calendar picker widget (Mantine `DatePickerInput`, value format `YYYY-MM-DD`) instead of a text field; required-date validation added; `@mantine/dates` and `dayjs` were already in the dependency set

## [0.6.0] - 2026-10-16

### Added
- Dark/light mode toggle: icon button at the top right of the header (moon/sun); preference persists across reloads via the browser's localStorage
- Version watermark next to the app title on every page; version injected at build time from the repo-root `VERSION` file

### Fixed
- `npm run build` (tsc step) emitted stray compiled `.js` files beside every source file; added `noEmit: true` to `frontend/tsconfig.json` so tsc type-checks only

## [0.5.0] - 2026-10-15

### Added
- Maintenance log editing (edit icon opens the modal pre-filled) and deletion with confirmation; parts from a deleted log return to inventory
- Parts list refreshes after a log is updated or deleted
- Labor cost tracking on maintenance logs via a new `labor_cost` column (alembic migration `0486810bc647`)
- Log form: separate "Parts Cost" and "Labor Cost" fields
- Vehicle detail: separate "Parts Cost" and "Labor Cost" columns; spend badges for Total, Parts, and Labor (Total = Parts + Labor)
- Spending Trends graph below the maintenance log: cumulative cost over time for total, parts, and labor; null cost values not plotted
- Graph: toggleable series (Total, Parts, Labor); time scale presets (last 30/90/180 days, last year, all time) or a custom start/end date range; line colors match the spend badges (total=teal, parts=blue, labor=violet)

### Changed
- Log maintenance modal handles both create and edit
- Delete buttons for vehicles, logs, and tasks render as trash icons
- Log form: "Cost" field relabeled "Parts Cost"

### Fixed
- Creating a log via `task_name` dropped the resolved task id (NOT NULL violation); the task id is now set on the payload before insert
- Calendar picker: month navigation arrows point correctly and out-of-month days are grayed out (imported the missing `@mantine/dates` stylesheet)

## [0.4.1] - 2026-10-15

### Added
- Parts Used column in the vehicle log table, separate from the Notes column (parts previously displayed inline under Notes)

## [0.4.0] - 2026-10-11

### Added
- Maintenance logs can now reference inventory parts. Each log holds a `parts_used` list of parts with an exact quantity per part.
- `log_parts` table (log_id + part_id composite key) with a `quantity` column.
- `parts_used` field on the log API: create (POST), read (GET), update (PUT /logs/{id}).
- "Inventory Used" section in the Log Maintenance form: select one or more parts from the inventory and set a quantity for each.
- Task edit form (reuses the add form) and the task update endpoint.
- Cascade delete: removing a log or a part removes its `log_parts` links.

### Changed
- Log responses now include the linked parts as `{id, brand, name, category, quantity}`.
- Free-text "Parts Used" field removed from the Log Maintenance form.
- Log maintenance form: parts with zero stock are grayed out in the part dropdown, labeled "(Not Available)", and cannot be selected

### Removed
- `parts_used` JSONB column on the `maintenance_logs` table (legacy free-text parts).

### Fixed
- Log maintenance form: using an inventory part now decrements the part's stock by the quantity used
- Stock restore on log update (old usage returned before new usage applied) and on log delete (usage returned)
- Stock never drops below zero
- Frontend refreshes the parts list after a log is created so updated counts display

## [0.3.1] - 2026-09-20

### Fixed
- Handle empty capacity values in inventory forms by converting them to null
- Improved currency formatting for cost display (always shows 2 decimal places)
- Enhanced capacity formatting with units (shows "units" after the value)
- Updated form labels to be required instead of optional (part_number, capacity, cost, supplier, notes)

## [0.3.0] - 2026-09-19

### Added
- Parts inventory management functionality with CRUD operations
- Parts table with comprehensive fields (brand, category, part_number, specification, capacity)
- Frontend pages for Tasks and Inventory management
- Parts router to main application
- Database migrations for parts table schema updates
- Tabler Icons React library for UI icons

### Changed
- Enhanced parts table schema with new fields instead of quantity and supplier
- Updated frontend navigation to include Tasks and Inventory links
- Integrated parts router into main application

### Fixed
- Various frontend build configuration issues
- CORS issues for some API endpoints

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