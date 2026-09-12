class HealthRepository:
    """Static starter data source; replace with a database adapter as needed."""

    def get_service_name(self) -> str:
        return "aygo-server"


def get_health_repository() -> HealthRepository:
    return HealthRepository()
