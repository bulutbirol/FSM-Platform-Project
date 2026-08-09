import { useEffect, useState } from 'react'
import { CalendarClock, CheckCircle2, Play } from 'lucide-react'
import { isFutureDateTime } from '../../utils/dateTime'

const MAX_TIMEOUT = 2_147_483_647

export function TechnicianWorkOrderAction({ order, onStatusChange }) {
  const [clock, setClock] = useState(() => Date.now())

  useEffect(() => {
    if (order.status !== 'SCHEDULED' || !order.scheduledDate) return undefined

    const remaining = new Date(order.scheduledDate).getTime() - Date.now()
    if (remaining <= 0) return undefined

    const timer = setTimeout(() => setClock(Date.now()), Math.min(remaining + 50, MAX_TIMEOUT))
    return () => clearTimeout(timer)
  }, [clock, order.scheduledDate, order.status])

  if (order.status === 'SCHEDULED' && isFutureDateTime(order.scheduledDate, clock)) {
    return <button className="btn-secondary" disabled><CalendarClock size={17} />Waiting for appointment</button>
  }

  if (order.status === 'SCHEDULED') {
    return <button className="btn-primary" onClick={() => onStatusChange('IN_PROGRESS')}><Play size={17} />Start work</button>
  }

  if (order.status === 'IN_PROGRESS') {
    return (
      <button className="btn-primary !bg-emerald-600 hover:!bg-emerald-700" onClick={() => onStatusChange('COMPLETED')}>
        <CheckCircle2 size={17} />
        Complete work
      </button>
    )
  }

  return null
}
