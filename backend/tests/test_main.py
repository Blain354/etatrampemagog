import os
import sys

from fastapi.testclient import TestClient

# Ensure the parent directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["service"] == "python-backend"
    assert "project" in data


def test_ramp_status_endpoint(monkeypatch):
    from datetime import datetime, timezone

    from services.ramp_status import MAGOG_AVIS_URL, RampStatusResponse, RampStatusValue

    async def mock_fetch() -> RampStatusResponse:
        return RampStatusResponse(
            status=RampStatusValue.OPEN,
            label="Ouverte",
            source_url=MAGOG_AVIS_URL,
            fetched_at=datetime.now(timezone.utc),
        )

    import main as main_module

    monkeypatch.setattr(main_module, "fetch_ramp_status", mock_fetch)

    response = client.get("/api/ramp-status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "open"
    assert data["label"] == "Ouverte"
