import json
import uuid

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

RUN_ID = uuid.uuid4().hex[:8]


def test_backup_export_returns_full_database_file():
    resp = client.get("/api/v1/backup/export")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("application/json")
    assert "attachment" in resp.headers["content-disposition"]
    assert "vehicle-maintenance-backup-" in resp.headers["content-disposition"]

    payload = json.loads(resp.text)
    assert payload["app"] == "vehicle-maintenance-tracker"
    assert payload["format"] == "vmt-backup"
    assert payload["format_version"] == 1
    assert "exported_at" in payload

    expected_tables = {
        "vehicles",
        "maintenance_tasks",
        "maintenance_logs",
        "attachments",
        "parts",
        "log_parts",
    }
    assert set(payload["tables"].keys()) == expected_tables

    # Every row must contain only JSON-safe primitive values
    for rows in payload["tables"].values():
        assert isinstance(rows, list)
        for row in rows:
            for value in row.values():
                assert value is None or isinstance(value, (str, int, float, bool))


def test_backup_export_contains_created_rows():
    """A vehicle created through the API appears verbatim in the backup."""
    vehicle = client.post(
        "/api/v1/vehicles",
        json={"make": "Backup", "model": "Test", "type": "car", "year": 2021,
              "vin": f"BAKVIN{RUN_ID}"},
    ).json()
    try:
        resp = client.get("/api/v1/backup/export")
        assert resp.status_code == 200
        vehicles = resp.json()["tables"]["vehicles"]
        exported = next(v for v in vehicles if v["id"] == vehicle["id"])
        assert exported["make"] == "Backup"
        assert exported["model"] == "Test"
        assert exported["type"] == "car"
        assert exported["year"] == 2021
        assert exported["vin"] == f"BAKVIN{RUN_ID}"
        # Dates are serialized as ISO strings
        assert exported["created_at"].startswith("20")
    finally:
        client.delete(f"/api/v1/vehicles/{vehicle['id']}")
