import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import { ToastProvider } from '../components/Toast'
import { WorkOrderDetailPage } from './WorkOrderDetailPage'

function localDateTime(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19)
}

let scheduledDate = localDateTime(new Date(Date.now() + 2 * 60 * 60 * 1000))

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'TECHNICIAN' } })
}))

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(() => Promise.resolve({
      data: {
        id: 31,
        title: 'Coffee machine visit',
        description: 'Inspect pressure loss.',
        status: 'SCHEDULED',
        scheduledDate,
        customer: { id: 1, name: 'Mert Yilmaz', company: 'Northstar Coffee', address: 'Kadikoy' },
        serviceRequestId: 15,
        serviceRequestTitle: 'Coffee machine issue',
        assignedUser: { id: 2, firstName: 'Emre', lastName: 'Tekin' }
      }
    })),
    patch: vi.fn()
  },
  apiMessage: () => 'Request failed'
}))

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/app/work-orders/31']}>
        <ToastProvider>
          <Routes><Route path="/app/work-orders/:id" element={<WorkOrderDetailPage />} /></Routes>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

test('technician waits until the scheduled appointment before starting work', async () => {
  scheduledDate = localDateTime(new Date(Date.now() + 2 * 60 * 60 * 1000))
  renderPage()

  expect(await screen.findByRole('button', { name: 'Waiting for appointment' })).toBeDisabled()
  expect(screen.queryByRole('button', { name: 'Start work' })).not.toBeInTheDocument()
})

test('start action unlocks automatically when the appointment arrives', async () => {
  scheduledDate = localDateTime(new Date(Date.now() + 1200))
  renderPage()

  expect(await screen.findByRole('button', { name: 'Waiting for appointment' })).toBeDisabled()
  expect(await screen.findByRole('button', { name: 'Start work' }, { timeout: 3000 })).toBeEnabled()
})
