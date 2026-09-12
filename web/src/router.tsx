import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { HomePage } from './routes/home'
import { OpsConsole } from './features/ops/console'
import { OpsProvider } from './features/ops/store'

const rootRoute = createRootRoute({ component: () => <OpsProvider><Outlet /></OpsProvider> })
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <OpsConsole />,
})

const brandRoute = createRoute({ getParentRoute: () => rootRoute, path: '/brand-kit', component: HomePage })
const consoleRoutes = (['catalogue', 'inventory', 'orders', 'events', 'equipment', 'suppliers', 'calendar'] as const).map(view => createRoute({ getParentRoute: () => rootRoute, path: `/${view}`, component: () => <OpsConsole view={view} /> }))

export const router = createRouter({ routeTree: rootRoute.addChildren([indexRoute, brandRoute, ...consoleRoutes]) })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
