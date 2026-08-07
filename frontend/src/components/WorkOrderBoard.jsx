import { CalendarClock, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge } from './StatusBadge'

const columns = ['UNASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED']

export function WorkOrderBoard({ orders = [] }) {
  return (
    <div className="grid min-w-[960px] grid-cols-4 gap-4">
      {columns.map((status) => {
        const items = orders.filter((order) => order.status === status)
        return (
          <section key={status} className="rounded-2xl bg-slate-100/80 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="font-display text-sm font-bold text-ink">{status.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}</h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500">{items.length}</span>
            </div>
            <div className="space-y-3">
              {items.map((order) => (
                <Link to={`/app/work-orders/${order.id}`} key={order.id} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-panel">
                  <StatusBadge value={order.status} />
                  <h4 className="mt-3 font-display text-sm font-bold text-ink">{order.title}</h4>
                  <p className="mt-1 text-xs text-slate-500">{order.customer?.name}</p>
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-2"><CalendarClock size={14} />{order.scheduledDate ? new Date(order.scheduledDate).toLocaleString() : 'Not scheduled'}</span>
                    <span className="flex items-center gap-2"><UserRound size={14} />{order.assignedUser ? `${order.assignedUser.firstName} ${order.assignedUser.lastName}` : 'Unassigned'}</span>
                  </div>
                </Link>
              ))}
              {!items.length && <p className="rounded-xl border border-dashed border-slate-300 px-3 py-8 text-center text-xs text-slate-400">No work here</p>}
            </div>
          </section>
        )
      })}
    </div>
  )
}
