import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { RequestsPage } from './RequestsPage'

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'CUSTOMER' } })
}))

vi.mock('../api/client', () => ({
  api: { get: vi.fn(() => new Promise(() => {})) },
  apiMessage: () => 'Request failed'
}))

test('customer can start a new service request', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RequestsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )

  expect(screen.getByRole('link', { name: /new request/i })).toHaveAttribute('href', '/app/requests/new')
})
