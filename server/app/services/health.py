from typing import Annotated

from fastapi import Depends

from app.repositories.health import HealthRepository, get_health_repository
from app.schemas.health import HealthResponse


class HealthService:
    def __init__(self, repository: HealthRepository) -> None:
        self.repository = repository

    def get_health(self) -> HealthResponse:
        return HealthResponse(status="ok", service=self.repository.get_service_name())


def get_health_service(
    repository: Annotated[HealthRepository, Depends(get_health_repository)],
) -> HealthService:
    return HealthService(repository)
