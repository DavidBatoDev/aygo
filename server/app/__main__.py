import uvicorn

from app.config import SERVER_DIR, Settings


def main() -> None:
    settings = Settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        reload_dirs=[str(SERVER_DIR / "app")] if settings.reload else None,
    )


if __name__ == "__main__":
    main()
