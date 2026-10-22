import json
import uuid

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

RUN_ID = uuid.uuid4().hex[:8]


def _export() -> bytes:
    resp = client.get("/api/v1/backup/export")
    assert resp.status_code == 200
    return resp.content


def _restore(raw: bytes) -> tuple[int, dict]:
    resp = client.post(
        "/api/v1/backup/restore",
        files={"file": ("backup.json", raw, "application/json")},
    )
    return resp.status_code, resp.json()


def test_restore_replaces_database_with_file_contents():
    """Restore overwrites current data and restores the exported state.

    A pre-test snapshot is restored in the finally block, so the test
    cleans up after itself (removes its own rows, keeps user data).
    """
    snapshot = _export()
    try:
        vehicle = client.post(
            "/api/v1/vehicles",
            json={"make": "Restore", "model": "Test", "type": "van", "year": 1999,
                  "vin": f"RESTVIN{RUN_ID}"},
        ).json()
        task = client.post(
            "/api/v1/tasks", json={"name": f"Restore Task {RUN_ID}"}
        ).json()
        backup = _export()

        # Mutate the DB so the restore proves it overwrites, not merges
        resp = client.put(f"/api/v1/vehicles/{vehicle['id']}", json={"make": "Mutated"})
        assert resp.status_code == 200, resp.text

        status_code, body = _restore(backup)
        assert status_code == 200, body
        assert body["status"] == "restored"

        # Vehicle is back to its exported state (not "Mutated")
        vehicles = client.get("/api/v1/vehicles").json()
        restored = next(v for v in vehicles if v["id"] == vehicle["id"])
        assert restored["make"] == "Restore"
        assert restored["vin"] == f"RESTVIN{RUN_ID}"
        assert f"Restore Task {RUN_ID}" in [t["name"] for t in client.get("/api/v1/tasks").json()]

        # Reported row counts match the backup file exactly
        for name, rows in json.loads(backup)["tables"].items():
            assert body["tables"][name] == len(rows)
    finally:
        status_code, _ = _restore(snapshot)
        assert status_code == 200


def test_restore_rejects_invalid_files_without_touching_data():
    vehicles_before = {v["id"] for v in client.get("/api/v1/vehicles").json()}

    # Not JSON at all
    status_code, body = _restore(b"this is not json")
    assert status_code == 400
    assert "not valid JSON" in body["detail"]

    # Valid JSON but wrong format marker
    status_code, body = _restore(
        json.dumps({"format": "other", "tables": {}}).encode()
    )
    assert status_code == 400
    assert "Unrecognized backup format" in body["detail"]

    # Missing a required table
    payload = json.loads(_export())
    del payload["tables"]["log_parts"]
    status_code, body = _restore(json.dumps(payload).encode())
    assert status_code == 400
    assert "log_parts" in body["detail"]

    # All rejections happen before any delete: current data is untouched
    vehicles_after = {v["id"] for v in client.get("/api/v1/vehicles").json()}
    assert vehicles_after == vehicles_before
