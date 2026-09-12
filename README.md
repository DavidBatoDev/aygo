# Aygo

Monorepo with a Python FastAPI backend and a React + TypeScript frontend using TanStack Router, TanStack Query, Tailwind CSS v4, Vite, and Vitest.

The frontend opens to the **Aygo Operations Console**, an interactive, in-memory demo of the merchandise and events business. See [web/MVP.md](web/MVP.md) for the demo walkthrough and implementation notes. The brand-kit preview lives at `/brand-kit`; [web/BRANDKIT.md](web/BRANDKIT.md) documents its Tailwind tokens and logo guidelines.

## Present the demo

```sh
npm install
npm run dev:web
```

Open **http://localhost:3000**. The console works independently of the server and includes all eight screens, working forms, stock holds, equipment bookings, and a shared calendar. Use **Demo guide** in the sidebar for a presentation walkthrough. **Reset demo** or a page refresh restores the seed data.

## Requirements

- Node.js 22.12+ (or a newer supported LTS release), npm 10+
- Python 3.12+

## Setup

From the repository root:

```sh
npm install
python -m venv server/.venv
```

Install the server dependencies on Windows:

```powershell
server/.venv/Scripts/python.exe -m pip install -e "./server[dev]"
```

On macOS/Linux:

```sh
server/.venv/bin/python -m pip install -e './server[dev]'
```

Local `.env` files are included in this initial setup but ignored by Git. On a fresh clone, copy `server/.env.example` to `server/.env` and `web/.env.example` to `web/.env`.

## Development

```sh
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:8080/api/health
- API docs: http://localhost:8080/docs

Run either app individually with `npm run dev:server` or `npm run dev:web`.

`server/.env` sets `HOST`, `PORT=8080`, and `RELOAD`. `web/.env` sets `PORT=3000` and `VITE_API_BASE_URL=/api`. Vite reads the server's configured port to proxy `/api` requests; restart development processes after changing environment files. The frontend fails if its configured port is occupied rather than silently choosing another port. Only `VITE_` variables are exposed to browser code.

## Structure

```text
server/
  app/
    actions/       # HTTP routes, request handling, service delegation
    services/      # Application and business logic
    repositories/  # Data access
    schemas/       # Pydantic request/response models
    config.py      # .env-backed settings
    main.py        # FastAPI application
  tests/
web/
  src/
    lib/           # API client
    routes/        # Pages and their tests
    test/          # Vitest setup
    router.tsx     # Typed TanStack route tree
scripts/           # Cross-platform server launcher
```

The example `GET /api/health` flows through **action → service → repository**, wired with FastAPI dependency injection. The starter repository returns static service metadata; there is no database yet.

## Checks and build

```sh
npm test               # Pytest + Vitest
npm run test:web       # Vitest only
npm run test:server    # Pytest only
npm run typecheck
npm run build          # Type-check and build web/dist
npm run test:e2e       # Browser walkthroughs (install a Playwright browser first)
```

Use `npm run test:watch --workspace web` for Vitest watch mode and `npm run preview --workspace web` to preview the web build on its configured port. In production, serve the frontend build and route `/api` to FastAPI through your hosting platform or reverse proxy. Set `RELOAD=false` for the production server.
