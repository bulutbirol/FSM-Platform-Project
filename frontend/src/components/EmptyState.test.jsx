import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

test('shows a helpful empty state and optional action', () => {
  render(<EmptyState title="No customers yet" description="Add the first customer." action={<button>Add customer</button>} />)

  expect(screen.getByRole('heading', { name: 'No customers yet' })).toBeInTheDocument()
  expect(screen.getByText('Add the first customer.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Add customer' })).toBeInTheDocument()
})

