from fastapi.testclient import TestClient

from app.main import app
from app.repositories.health import HealthRepository, get_health_repository


def test_health_endpoint() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "aygo-server"}


def test_repository_can_be_injected_through_all_layers() -> None:
    class TestRepository(HealthRepository):
        def get_service_name(self) -> str:
            return "test-service"

    app.dependency_overrides[get_health_repository] = TestRepository
    try:
        with TestClient(app) as client:
            response = client.get("/api/health")
        assert response.json() == {"status": "ok", "service": "test-service"}
    finally:
        app.dependency_overrides.clear()
