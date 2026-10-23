"""Database backup helpers.

Serialize every table to a single JSON-safe payload so the whole database
can be downloaded (and later restored) as one file.
"""

import uuid
from datetime import UTC, date, datetime
from decimal import Decimal

from sqlalchemy.orm import Session

import app.models  # noqa: F401  # ensure all tables are registered on Base.metadata
from app.database import Base

FORMAT_NAME = "vmt-backup"
FORMAT_VERSION = 1


def _serialize(value):
    """Convert a single database value to a JSON-safe primitive."""
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, Decimal):
        return str(value)
    return value


def build_backup_payload(db: Session) -> dict:
    """Export every table to a JSON-safe dict.

    ``Base.metadata.sorted_tables`` yields tables in topological order of
    foreign-key dependencies, which keeps the file restorable row-by-row.
    """
    tables: dict[str, list[dict]] = {}
    for table in Base.metadata.sorted_tables:
        rows = db.execute(table.select()).mappings().all()
        tables[table.name] = [
            {column: _serialize(value) for column, value in row.items()}
            for row in rows
        ]
    return {
        "app": "vehicle-maintenance-tracker",
        "format": FORMAT_NAME,
        "format_version": FORMAT_VERSION,
        "exported_at": datetime.now(UTC).isoformat(),
        "tables": tables,
    }


def validate_backup_payload(payload: dict) -> dict[str, list[dict]]:
    """Check a backup payload is complete and return its tables mapping.

    Raises ``ValueError`` with a human-readable reason otherwise.
    """
    if not isinstance(payload, dict):
        raise ValueError("Backup file must contain a single JSON object.")
    if payload.get("format") != FORMAT_NAME:
        raise ValueError(
            f"Unrecognized backup format: {payload.get('format')!r}. "
            f"Expected {FORMAT_NAME!r}."
        )
    version = payload.get("format_version")
    if version != FORMAT_VERSION:
        raise ValueError(
            f"Unsupported backup format version: {version!r}. "
            f"Expected {FORMAT_VERSION}."
        )
    tables = payload.get("tables")
    if not isinstance(tables, dict):
        raise ValueError("Backup file is missing the 'tables' section.")
    known = {table.name for table in Base.metadata.sorted_tables}
    missing = sorted(known - set(tables.keys()))
    if missing:
        raise ValueError(f"Backup file is missing tables: {', '.join(missing)}.")
    for name, rows in tables.items():
        if not isinstance(rows, list) or not all(isinstance(r, dict) for r in rows):
            raise ValueError(f"Table '{name}' must be a list of row objects.")
    return tables


def restore_from_payload(db: Session, payload: dict) -> dict[str, int]:
    """Replace all table contents with the backup payload, atomically.

    Deletes run in reverse foreign-key order and inserts in foreign-key
    order, all inside one transaction. Any failure rolls the whole restore
    back, leaving the current data untouched. Returns the number of rows
    restored per table.
    """
    tables = validate_backup_payload(payload)
    ordered = list(Base.metadata.sorted_tables)
    for table in reversed(ordered):
        db.execute(table.delete())
    for table in ordered:
        rows = tables[table.name]
        valid_columns = {column.name for column in table.columns}
        for row in rows:
            unknown = sorted(set(row.keys()) - valid_columns)
            if unknown:
                raise ValueError(
                    f"Unknown column(s) in table '{table.name}': {', '.join(unknown)}."
                )
        if rows:
            db.execute(table.insert().values(rows))
    db.commit()
    return {table.name: len(tables[table.name]) for table in ordered}
