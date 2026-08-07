import { useQuery } from '@tanstack/react-query'
import { CalendarDays, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { api, apiMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { EmptyState } from '../components/EmptyState'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorPanel, Loading, PageHeader } from '../components/ui'

const statuses = ['', 'NEW', 'REVIEWED', 'QUOTED', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export function RequestsPage() {
  const { user } = useAuth()
  const [status, setStatus] = useState('')
  const query = useQuery({ queryKey: ['requests', status], queryFn: async () => (await api.get('/service-requests', { params: status ? { status } : {} })).data })
  const requests = query.data || []
  return <div className="animate-rise"><PageHeader eyebrow="Intake queue" title={user.role === 'CUSTOMER' ? 'Your service requests' : 'Service requests'} description="Track each request from first review through completed work." actionLabel={user.role === 'ADMIN' ? 'New request' : null} actionTo={user.role === 'ADMIN' ? '/app/requests/new' : null} /><div className="mb-5 flex flex-wrap gap-2">{statuses.map((item) => <button key={item || 'ALL'} className={`rounded-full px-3 py-1.5 text-xs font-bold ${status === item ? 'bg-ink text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`} onClick={() => setStatus(item)}>{item ? item.replaceAll('_', ' ') : 'ALL'}</button>)}</div>{query.isLoading ? <Loading /> : query.isError ? <ErrorPanel message={apiMessage(query.error)} /> : requests.length === 0 ? <EmptyState title="No requests in this view" description="New service requests will appear here." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{requests.map((request) => <Link to={`/app/requests/${request.id}`} key={request.id} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-panel transition hover:-translate-y-1 hover:border-blue-300"><div className="flex items-start justify-between gap-3"><StatusBadge value={request.status} /><span className={`text-[11px] font-extrabold uppercase tracking-wider ${request.priority === 'URGENT' || request.priority === 'HIGH' ? 'text-red-600' : 'text-slate-400'}`}>{request.priority}</span></div><h2 className="mt-5 font-display text-lg font-bold text-ink group-hover:text-mineral">{request.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{request.description}</p><div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500"><p className="font-bold text-slate-700">{request.customer.name}</p><p className="flex items-center gap-2"><CalendarDays size={14} />Requested {new Date(`${request.requestedDate}T00:00:00`).toLocaleDateString()}</p><p className="flex items-center gap-2 truncate"><MapPin size={14} />{request.address}</p></div></Link>)}</div>}</div>
}

