import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, Edit3, FilePlus2, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, apiMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { RequestAdminPanel } from '../components/requests/RequestAdminPanel'
import { TechnicianAcceptancePanel } from '../components/requests/TechnicianAcceptancePanel'
import { useToast } from '../components/Toast'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorPanel, Loading, PageHeader, Panel } from '../components/ui'

export function RequestDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState('')
  const query = useQuery({ queryKey: ['request', id], queryFn: async () => (await api.get(`/service-requests/${id}`)).data })
  const status = useMutation({
    mutationFn: (value) => api.patch(`/service-requests/${id}/status`, { status: value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', id] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      showToast('Request status updated')
    },
    onError: (error) => showToast(apiMessage(error), 'error')
  })
  const accept = useMutation({
    mutationFn: () => api.post(`/work-orders/accept-request/${id}`, { scheduledDate: appointment }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['work-orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      showToast('Request accepted and appointment scheduled')
      navigate(`/app/work-orders/${data.id}`)
    },
    onError: (error) => showToast(apiMessage(error), 'error')
  })

  useEffect(() => {
    if (query.data?.requestedDate && !appointment) setAppointment(`${query.data.requestedDate}T09:00`)
  }, [appointment, query.data?.requestedDate])

  if (query.isLoading) return <Loading />
  if (query.isError) return <ErrorPanel message={apiMessage(query.error)} />

  const request = query.data
  const actions = user.role === 'ADMIN' ? (
    <div className="flex flex-wrap gap-2">
      {['NEW', 'REVIEWED'].includes(request.status) && (
        <>
          <Link className="btn-secondary" to={`/app/requests/${id}/edit`}>
            <Edit3 size={16} />
            Edit
          </Link>
          <Link className="btn-primary" to={`/app/quotes/new?requestId=${id}`}>
            <FilePlus2 size={16} />
            Create quote
          </Link>
        </>
      )}
    </div>
  ) : null

  return (
    <div className="animate-rise">
      <Link className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500" to="/app/requests">
        <ArrowLeft size={16} />
        Service requests
      </Link>
      <PageHeader
        eyebrow={`Request #${request.id}`}
        title={request.title}
        description={request.description}
        action={actions}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge value={request.status} />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              {request.priority} priority
            </span>
          </div>
          <dl className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer</dt>
              <dd className="mt-2 font-bold text-ink">{request.customer.name}</dd>
              <dd className="text-sm text-slate-500">{request.customer.company}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Requested date</dt>
              <dd className="mt-2 flex items-center gap-2 text-sm font-semibold">
                <CalendarDays size={16} />
                {new Date(`${request.requestedDate}T00:00:00`).toLocaleDateString()}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Service address</dt>
              <dd className="mt-2 flex items-center gap-2 text-sm">
                <MapPin size={16} />
                {request.address}
              </dd>
            </div>
          </dl>
        </Panel>
        {user.role === 'ADMIN' && (
          <RequestAdminPanel
            requestStatus={request.status}
            isPending={status.isPending}
            onStatusChange={status.mutate}
          />
        )}
        {user.role === 'TECHNICIAN' && request.status === 'REVIEWED' && (
          <TechnicianAcceptancePanel
            appointment={appointment}
            isPending={accept.isPending}
            onAppointmentChange={setAppointment}
            onAccept={accept.mutate}
          />
        )}
      </div>
    </div>
  )
}
