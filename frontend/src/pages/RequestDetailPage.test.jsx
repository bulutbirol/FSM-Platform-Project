import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import { api } from '../api/client'
import { ToastProvider } from '../components/Toast'
import { RequestDetailPage } from './RequestDetailPage'

const state = vi.hoisted(() => ({
  role: 'TECHNICIAN',
  request: null
}))

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ user: { role: state.role } })
}))

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ data: state.request })),
    patch: vi.fn(() => Promise.resolve({ data: state.request })),
    post: vi.fn(() => Promise.resolve({ data: { id: 44 } }))
  },
  apiMessage: () => 'Request failed'
}))

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/app/requests/15']}>
        <ToastProvider>
          <Routes>
            <Route path="/app/requests/:id" element={<RequestDetailPage />} />
            <Route path="/app/work-orders/:id" element={<div>Scheduled work order</div>} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  state.request = {
    id: 15,
    title: 'Repair espresso machine',
    description: 'Pressure drops during service.',
    priority: 'HIGH',
    status: 'REVIEWED',
    requestedDate: '2026-08-20',
    address: 'Kadikoy, Istanbul',
    customer: { id: 1, name: 'Mert Yilmaz', company: 'Northstar Coffee' }
  }
})

test('technician accepts an approved request with an appointment', async () => {
  state.role = 'TECHNICIAN'
  renderPage()

  const appointment = await screen.findByLabelText('Appointment date and time')
  fireEvent.change(appointment, { target: { value: '2026-08-20T10:30' } })
  fireEvent.click(screen.getByRole('button', { name: 'Accept and schedule' }))

  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/work-orders/accept-request/15', { scheduledDate: '2026-08-20T10:30' }))
  expect(await screen.findByText('Scheduled work order')).toBeInTheDocument()
})

test('admin explicitly approves a new request for the technician queue', async () => {
  state.role = 'ADMIN'
  state.request = { ...state.request, status: 'NEW' }
  renderPage()

  fireEvent.click(await screen.findByRole('button', { name: 'Approve for technicians' }))

  await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/service-requests/15/status', { status: 'REVIEWED' }))
  expect(screen.getByRole('button', { name: 'Reject request' })).toBeInTheDocument()
})
