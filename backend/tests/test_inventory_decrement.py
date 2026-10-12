import uuid

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

RUN_ID = uuid.uuid4().hex[:8]


def _part_qty(part_id: str) -> int:
    resp = client.get(f"/api/v1/parts/{part_id}")
    assert resp.status_code == 200
    return resp.json()["quantity"]


def test_log_parts_decrement_inventory():
    """Using a part in a maintenance log decrements its inventory count.

    Create -> consume; update -> restore old + consume new; delete -> restore.
    Stock never goes below zero.
    """
    vehicle = client.post(
        "/api/v1/vehicles",
        json={"make": "Test", "model": "Fleet", "type": "truck", "year": 2020,
              "vin": f"TESTVIN{RUN_ID}"},
    ).json()
    part = client.post(
        "/api/v1/parts",
        json={"brand": "TestBrand", "name": f"Brake Fluid {RUN_ID}",
              "category": "fluid", "part_number": f"BF-{RUN_ID}", "quantity": 5},
    ).json()
    task = client.post(
        "/api/v1/tasks", json={"name": f"Brake Service {RUN_ID}"}
    ).json()

    created_log_ids: list[str] = []

    try:
        # 1. Create a log using 2 units -> stock 5 - 2 = 3
        log = client.post(
            f"/api/v1/vehicles/{vehicle['id']}/logs",
            json={"task_id": task["id"], "mileage": 10000,
                  "performed_on": "2026-10-11",
                  "parts_used": [{"id": part["id"], "quantity": 2}]},
        )
        assert log.status_code == 201, log.text
        created_log_ids.append(log.json()["id"])
        assert _part_qty(part["id"]) == 3

        # 2. Update the log to use only 1 unit -> restore 2, consume 1 = 4
        resp = client.put(
            f"/api/v1/logs/{log.json()['id']}",
            json={"parts_used": [{"id": part["id"], "quantity": 1}]},
        )
        assert resp.status_code == 200, resp.text
        assert _part_qty(part["id"]) == 4

        # 3. Delete the log -> restore 1 = 5
        resp = client.delete(f"/api/v1/logs/{log.json()['id']}")
        assert resp.status_code == 204, resp.text
        assert _part_qty(part["id"]) == 5
        created_log_ids.remove(log.json()["id"])

        # 4. Oversized usage clamps at zero (stock 5, use 100 -> 0)
        log2 = client.post(
            f"/api/v1/vehicles/{vehicle['id']}/logs",
            json={"task_id": task["id"], "mileage": 10100,
                  "performed_on": "2026-10-12",
                  "parts_used": [{"id": part["id"], "quantity": 100}]},
        )
        assert log2.status_code == 201, log2.text
        created_log_ids.append(log2.json()["id"])
        assert _part_qty(part["id"]) == 0
    finally:
        # Clean up: logs first (delete_vehicle does not cascade them), then
        # part and task, then the vehicle
        for log_id in created_log_ids:
            client.delete(f"/api/v1/logs/{log_id}")
        client.delete(f"/api/v1/parts/{part['id']}")
        client.delete(f"/api/v1/tasks/{task['id']}")
        client.delete(f"/api/v1/vehicles/{vehicle['id']}")