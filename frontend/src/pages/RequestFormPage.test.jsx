import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { api } from '../api/client'
import { ToastProvider } from '../components/Toast'
import { RequestFormPage } from './RequestFormPage'

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'CUSTOMER' } })
}))

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(() => new Promise(() => {})),
    post: vi.fn()
  },
  apiMessage: () => 'Request failed'
}))

test('customer request form uses the customer linked to the signed-in account', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/app/requests/new']}>
        <ToastProvider><RequestFormPage /></ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )

  expect(screen.getByRole('heading', { name: 'Create service request' })).toBeInTheDocument()
  expect(screen.queryByLabelText('Customer')).not.toBeInTheDocument()
  expect(screen.getByText(/linked customer account/i)).toBeInTheDocument()
  expect(api.get).not.toHaveBeenCalledWith('/customers')
})
