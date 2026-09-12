import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HomePage } from './home'

function renderHome() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><HomePage /></QueryClientProvider>)
}

describe('API connection', () => {
  it('shows the service returned by the backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ status: 'ok', service: 'aygo-server' }),
      { headers: { 'Content-Type': 'application/json' } },
    ))
    vi.stubGlobal('fetch', fetchMock)
    renderHome()
    expect(await screen.findByText('API online · aygo-server')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/health')
  })

  it('shows an actionable error when the backend fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })))
    renderHome()
    expect(await screen.findByText(/API unavailable/)).toBeInTheDocument()
  })
})
