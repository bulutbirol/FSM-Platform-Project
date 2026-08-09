import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarClock, MapPin, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { api, apiMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { TechnicianWorkOrderAction } from '../components/work-orders/TechnicianWorkOrderAction'
import { WorkOrderSidePanel } from '../components/work-orders/WorkOrderSidePanel'
import { useToast } from '../components/Toast'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorPanel, Loading, PageHeader, Panel } from '../components/ui'

const transitions = {
  UNASSIGNED: ['CANCELLED'],
  SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
}

export function WorkOrderDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [technicianId, setTechnicianId] = useState('')
  const [scheduledDate, setScheduledDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 16))
  const query = useQuery({ queryKey: ['work-order', id], queryFn: async () => (await api.get(`/work-orders/${id}`)).data })
  const technicians = useQuery({ queryKey: ['technicians'], queryFn: async () => (await api.get('/users/technicians')).data, enabled: user.role === 'ADMIN' })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['work-order', id] })
    queryClient.invalidateQueries({ queryKey: ['work-orders'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
  const status = useMutation({
    mutationFn: (value) => api.patch(`/work-orders/${id}/status`, { status: value }),
    onSuccess: () => {
      refresh()
      showToast('Work order updated')
    },
    onError: (error) => showToast(apiMessage(error), 'error')
  })
  const assignment = useMutation({
    mutationFn: () => api.patch(`/work-orders/${id}/assignment`, {
      assignedUserId: Number(technicianId),
      scheduledDate
    }),
    onSuccess: () => {
      refresh()
      showToast('Technician assigned')
    },
    onError: (error) => showToast(apiMessage(error), 'error')
  })

  if (query.isLoading) return <Loading />
  if (query.isError) return <ErrorPanel message={apiMessage(query.error)} />

  const order = query.data
  const nextStatuses = transitions[order.status] || []
  const techAction = user.role === 'TECHNICIAN'
    ? <TechnicianWorkOrderAction order={order} onStatusChange={status.mutate} />
    : null

  return (
    <div className="animate-rise">
      <Link className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500" to="/app/work-orders">
        <ArrowLeft size={16} />
        Work orders
      </Link>
      <PageHeader
        eyebrow={`Work order #${order.id}`}
        title={order.title}
        description={order.description}
        action={techAction}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel>
          <StatusBadge value={order.status} />
          <dl className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer</dt>
              <dd className="mt-2 font-bold">{order.customer.name}</dd>
              <dd className="text-sm text-slate-500">{order.customer.company}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Technician</dt>
              <dd className="mt-2 flex items-center gap-2 text-sm font-semibold">
                <UserRound size={16} />
                {order.assignedUser ? `${order.assignedUser.firstName} ${order.assignedUser.lastName}` : 'Unassigned'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Scheduled</dt>
              <dd className="mt-2 flex items-center gap-2 text-sm">
                <CalendarClock size={16} />
                {order.scheduledDate ? new Date(order.scheduledDate).toLocaleString() : 'Not scheduled'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Address</dt>
              <dd className="mt-2 flex items-center gap-2 text-sm">
                <MapPin size={16} />
                {order.customer.address}
              </dd>
            </div>
          </dl>
        </Panel>
        <WorkOrderSidePanel
          isAdmin={user.role === 'ADMIN'}
          order={order}
          technicians={technicians.data || []}
          technicianId={technicianId}
          scheduledDate={scheduledDate}
          nextStatuses={nextStatuses}
          assignmentPending={assignment.isPending}
          onTechnicianChange={setTechnicianId}
          onDateChange={setScheduledDate}
          onAssign={assignment.mutate}
          onStatusChange={status.mutate}
        />
      </div>
    </div>
  )
}
