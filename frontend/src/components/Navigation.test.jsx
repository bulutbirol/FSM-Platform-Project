import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Navigation } from './Navigation'

test('admin navigation exposes management and dashboard links', () => {
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Navigation role="ADMIN" /></MemoryRouter>)

  expect(screen.getByText('Dashboard')).toBeInTheDocument()
  expect(screen.getByText('Customers')).toBeInTheDocument()
  expect(screen.getByText('Quotations')).toBeInTheDocument()
})

test('technician navigation only exposes assigned work and profile', () => {
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Navigation role="TECHNICIAN" /></MemoryRouter>)

  expect(screen.getByText('Work orders')).toBeInTheDocument()
  expect(screen.getByText('Profile')).toBeInTheDocument()
  expect(screen.queryByText('Customers')).not.toBeInTheDocument()
  expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
})
