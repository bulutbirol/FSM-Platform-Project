import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { WorkOrderBoard } from './WorkOrderBoard'

test('groups work orders into their operational columns', () => {
  const orders = [
    { id: 1, title: 'Inspect unit', status: 'SCHEDULED', customer: { name: 'Northstar' } },
    { id: 2, title: 'Replace filter', status: 'COMPLETED', customer: { name: 'Acar Dental' } }
  ]

  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><WorkOrderBoard orders={orders} /></MemoryRouter>)

  expect(screen.getByRole('heading', { name: 'Scheduled' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Completed' })).toBeInTheDocument()
  expect(screen.getByText('Inspect unit')).toBeInTheDocument()
  expect(screen.getByText('Replace filter')).toBeInTheDocument()
})
