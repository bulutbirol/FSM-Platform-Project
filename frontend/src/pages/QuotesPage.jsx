import { useQuery } from '@tanstack/react-query'
import { CalendarClock, CircleDollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api, apiMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { EmptyState } from '../components/EmptyState'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorPanel, Loading, PageHeader } from '../components/ui'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TRY' })

export function QuotesPage() {
  const { user } = useAuth()
  const query = useQuery({ queryKey: ['quotes'], queryFn: async () => (await api.get('/quotes')).data })
  const quotes = query.data || []
  return <div className="animate-rise"><PageHeader eyebrow="Commercial desk" title={user.role === 'CUSTOMER' ? 'Your quotations' : 'Quotations'} description="Prepare, send, and collect clear decisions on proposed service work." />{query.isLoading ? <Loading /> : query.isError ? <ErrorPanel message={apiMessage(query.error)} /> : !quotes.length ? <EmptyState title="No quotations yet" description="Create a quotation from an eligible service request." /> : <div className="grid gap-4 lg:grid-cols-2">{quotes.map((quote) => <Link key={quote.id} to={`/app/quotes/${quote.id}`} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-panel transition hover:-translate-y-1 hover:border-blue-300"><div className="flex items-start justify-between"><StatusBadge value={quote.status} /><span className="font-display text-xl font-extrabold text-ink">{money.format(quote.amount)}</span></div><h2 className="mt-5 font-display text-lg font-bold group-hover:text-mineral">{quote.serviceRequest.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{quote.description}</p><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500"><span className="flex items-center gap-2"><CircleDollarSign size={15} />{quote.serviceRequest.customer.name}</span><span className="flex items-center gap-2"><CalendarClock size={15} />Valid until {new Date(`${quote.validUntil}T00:00:00`).toLocaleDateString()}</span></div></Link>)}</div>}</div>
}

