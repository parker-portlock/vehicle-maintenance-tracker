import uuid

from fastapi.testclient import TestClient

from app.main import app
from app.schemas.maintenance_log import LogUpdate

client = TestClient(app)

RUN_ID = uuid.uuid4().hex[:8]


def test_update_log_schema_null_semantics():
    """Pin the update contract the frontend edit form relies on.

    An explicit ``cost``/``labor_cost`` of null must survive
    ``model_dump(exclude_unset=True)`` so the backend clears the value, while
    an omitted key must stay out of the dump so the backend leaves the
    existing value unchanged.
    """
    cleared = LogUpdate(cost=None, labor_cost=None)
    dumped = cleared.model_dump(exclude_unset=True)
    assert "cost" in dumped and dumped["cost"] is None
    assert "labor_cost" in dumped and dumped["labor_cost"] is None

    untouched = LogUpdate(mileage=12345)
    dumped = untouched.model_dump(exclude_unset=True)
    assert "cost" not in dumped
    assert "labor_cost" not in dumped


def test_update_log_clears_costs_when_null():
    """Editing a log can null out cost and labor_cost; omitted keys keep their value."""
    vehicle = client.post(
        "/api/v1/vehicles",
        json={"make": "Test", "model": "Fleet", "type": "truck", "year": 2020,
              "vin": f"TESTVIN{RUN_ID}"},
    ).json()
    task = client.post(
        "/api/v1/tasks", json={"name": f"Cost Edit Test {RUN_ID}"}
    ).json()

    log = client.post(
        f"/api/v1/vehicles/{vehicle['id']}/logs",
        json={"task_id": task["id"], "mileage": 10000,
              "performed_on": "2026-10-20",
              "cost": 42.5, "labor_cost": 10.0},
    )
    assert log.status_code == 201, log.text
    log_id = log.json()["id"]

    try:
        # 1. Omitting cost/labor_cost must not change the stored values
        resp = client.put(
            f"/api/v1/logs/{log_id}",
            json={"mileage": 10200},
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        # Decimals serialize as strings (e.g. "42.50") — compare numerically
        assert float(body["cost"]) == 42.5
        assert float(body["labor_cost"]) == 10.0
        assert body["mileage"] == 10200

        # 2. An explicit null clears the values
        resp = client.put(
            f"/api/v1/logs/{log_id}",
            json={"cost": None, "labor_cost": None},
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["cost"] is None
        assert body["labor_cost"] is None
    finally:
        # Clean up: log first, then task and vehicle
        client.delete(f"/api/v1/logs/{log_id}")
        client.delete(f"/api/v1/tasks/{task['id']}")
        client.delete(f"/api/v1/vehicles/{vehicle['id']}")
