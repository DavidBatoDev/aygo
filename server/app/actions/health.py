from typing import Annotated

from fastapi import APIRouter, Depends

from app.schemas.health import HealthResponse
from app.services.health import HealthService, get_health_service

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def get_health(
    service: Annotated[HealthService, Depends(get_health_service)],
) -> HealthResponse:
    return service.get_health()
