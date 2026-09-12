import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

const webDir = fileURLToPath(new URL('.', import.meta.url))
const serverDir = fileURLToPath(new URL('../server', import.meta.url))

function parsePort(value: string | undefined, fallback: number): number {
  const port = Number(value?.trim() || fallback)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${value}`)
  }
  return port
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, webDir, '')
  const backend = loadEnv(mode, serverDir, '')
  const port = parsePort(env.PORT, 3000)
  const proxy = {
    '/api': {
      target: `http://127.0.0.1:${parsePort(backend.PORT, 8080)}`,
      changeOrigin: true,
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    server: { host: '127.0.0.1', port, strictPort: true, proxy },
    preview: { host: '127.0.0.1', port, strictPort: true, proxy },
    test: {
      include: ['src/**/*.test.{ts,tsx}'],
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      clearMocks: true,
      restoreMocks: true,
    },
  }
})
