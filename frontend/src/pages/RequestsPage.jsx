import { useQuery } from '@tanstack/react-query'
import { CalendarDays, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, apiMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { EmptyState } from '../components/EmptyState'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorPanel, Loading, PageHeader } from '../components/ui'
import { formatDate, useLanguage } from '../i18n/LanguageContext'

const statuses = ['', 'NEW', 'REVIEWED', 'QUOTED', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

function StatusFilters({ statuses: options, selected, onSelect }) {
  const { t, statusLabel } = useLanguage()
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {options.map((status) => (
        <button
          key={status || 'ALL'}
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${selected === status ? 'bg-ink text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}
          onClick={() => onSelect(status)}
        >
          {status ? statusLabel(status) : t('ALL')}
        </button>
      ))}
    </div>
  )
}

function RequestCard({ request }) {
  const { language, priorityLabel, t } = useLanguage()
  const urgent = request.priority === 'URGENT' || request.priority === 'HIGH'

  return (
    <Link
      to={`/app/requests/${request.id}`}
      className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-panel transition hover:-translate-y-1 hover:border-blue-300"
    >
      <div className="flex items-start justify-between gap-3">
        <StatusBadge value={request.status} />
        <span className={`text-[11px] font-extrabold uppercase tracking-wider ${urgent ? 'text-red-600' : 'text-slate-400'}`}>
          {priorityLabel(request.priority)}
        </span>
      </div>
      <h2 className="mt-5 font-display text-lg font-bold text-ink group-hover:text-mineral">{request.title}</h2>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{request.description}</p>
      <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <p className="font-bold text-slate-700">{request.customer.name}</p>
        <p className="flex items-center gap-2">
          <CalendarDays size={14} />
          {t('Requested {date}', { date: formatDate(`${request.requestedDate}T00:00:00`, language) })}
        </p>
        <p className="flex items-center gap-2 truncate"><MapPin size={14} />{request.address}</p>
      </div>
    </Link>
  )
}

export function RequestsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [status, setStatus] = useState('')
  const query = useQuery({
    queryKey: ['requests', status],
    queryFn: async () => (await api.get('/service-requests', { params: status ? { status } : {} })).data
  })
  const requests = query.data || []
  const visibleStatuses = user.role === 'TECHNICIAN' ? ['REVIEWED'] : statuses
  const canCreate = user.role === 'ADMIN' || user.role === 'CUSTOMER'
  const title = user.role === 'CUSTOMER'
    ? t('Your service requests')
    : user.role === 'TECHNICIAN' ? t('Request queue') : t('Service requests')
  const description = user.role === 'TECHNICIAN'
    ? t('Review administrator-approved requests and schedule your next visit.')
    : t('Track each request from first review through completed work.')
  const emptyDescription = user.role === 'TECHNICIAN'
    ? t('Approved requests will appear here.')
    : t('New service requests will appear here.')

  let content
  if (query.isLoading) content = <Loading />
  else if (query.isError) content = <ErrorPanel message={apiMessage(query.error)} />
  else if (requests.length === 0) content = <EmptyState title={t('No requests in this view')} description={emptyDescription} />
  else content = <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{requests.map((request) => <RequestCard key={request.id} request={request} />)}</div>

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={t('Intake queue')}
        title={title}
        description={description}
        actionLabel={canCreate ? t('New request') : null}
        actionTo={canCreate ? '/app/requests/new' : null}
      />
      <StatusFilters statuses={visibleStatuses} selected={status} onSelect={setStatus} />
      {content}
    </div>
  )
}
