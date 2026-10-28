# Changelog

All notable changes to this project are documented here.
Format based on Keep a Changelog, adheres to Semantic Versioning.

Releases that alter the database schema include a `### Database` section —
check it before upgrading (see "Upgrading" in the README).

## [0.8.0] - 2026-10-27

### Added
- Vehicle detail and Inventory tables: sortable column headers — click to sort ascending, click again to sort descending
- Mobile-friendly view: header toggle (next to the theme switch) constrains the app to a phone-like column and renders data tables as labeled cards; the setting persists in localStorage

### Changed
- Log Maintenance form: "Parts Cost" field renamed to "Additional Parts Cost"; inventory parts cost is now calculated from the inventory parts used (inventory part cost × quantity; a part with no cost set counts as $0; null quantity counts as 1) and shown live in the form
- Vehicle detail: "Parts Spent" badge, log table parts cost column, and the spending chart's Parts series now include both the inventory parts cost and the additional parts cost
- Vehicle detail log table: "Parts Used" column now shows each part's brand before the name, one part per line
- Editing a log: the Additional Parts Cost (or Labor Cost) value can be cleared; an empty field saves as no value

## [0.7.2] - 2026-10-25

### Changed
- README: version upgrade instructions; this changelog now flags schema changes in a `Database` section

### Fixed
- Log Maintenance form: Task select displayed the first task as selected while the form value stayed empty, so submitting with that "default" task failed validation ("Please select a valid task"). The form now starts blank with a "Select a task" placeholder option

## [0.7.1] - 2026-10-22

### Added
- Docker deploy: one Alpine app image (nginx + FastAPI) plus `postgres:16-alpine`
- Automatic migrations at container startup
- First-run hint on the dashboard pointing to the Vehicles page (shown once)

### Changed
- API base URL build-time configurable (`VITE_API_BASE_URL`)
- README rewritten for single-user, Docker-first use

### Removed
- Per-app Dockerfiles (replaced by the single app image)

### Fixed
- `DATABASE_URL`: explicit `+psycopg2` dialect (SQLAlchemy 2.0 maps plain `postgresql://` to the uninstalled psycopg v3 driver)
- Remove Alpine's stock nginx `default.conf` (a `default_server` that returned 404 for every request)

## [0.7.0] - 2026-10-22

### Added
- Settings page (`/settings`) with header navigation link; Data section for database operations
- Database backup: `GET /api/v1/backup/export` downloads the full database as one JSON file (`vmt-backup` format v1); all tables in foreign-key order; UUIDs, dates and decimals serialized as JSON primitives; "Download Backup" button in Settings
- Database restore: `POST /api/v1/backup/restore` accepts a backup file upload and replaces all data; deletes in reverse foreign-key order and inserts in foreign-key order inside one transaction; any failure rolls back; invalid, unrecognized or incomplete files reject before any data change; Settings file picker with confirmation and per-table restored counts

## [0.6.2] - 2026-10-16

### Fixed
- Vehicle detail log table: removed a duplicated "Notes" cell that rendered after the edit/delete icons in each row

## [0.6.1] - 2026-10-16

### Added
- Edit vehicle: pencil icon on the Vehicles page opens the vehicle form pre-filled (same form as add); calls existing `PUT /api/v1/vehicles/{id}`

### Changed
- Vehicles page: "View" text button replaced with a green eye icon to match the icon-based row actions
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

### Database
- New `labor_cost` column on `maintenance_logs` (alembic migration `0486810bc647`)

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

### Database
- New `log_parts` table (log_id + part_id composite key, quantity)
- `parts_used` JSONB column dropped from `maintenance_logs`

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

### Database
- Parts inventory table created with brand, category, part_number, specification, and capacity fields

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

### Database
- Initial migration created all four tables

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