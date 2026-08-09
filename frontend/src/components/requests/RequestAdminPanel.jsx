import { CheckCircle2, XCircle } from 'lucide-react'
import { Panel } from '../ui'

const transitions = {
  REVIEWED: ['NEW', 'CANCELLED'],
  QUOTED: ['CANCELLED'],
  APPROVED: ['CANCELLED']
}

export function RequestAdminPanel({ requestStatus, isPending, onStatusChange }) {
  if (requestStatus === 'NEW') {
    return (
      <Panel>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-mineral">Admin review</p>
        <h2 className="mt-2 font-display text-lg font-bold">Send to technician queue?</h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Approval makes this request visible to technicians. Rejection closes the request.
        </p>
        <div className="mt-6 grid gap-2">
          <button className="btn-primary w-full" disabled={isPending} onClick={() => onStatusChange('REVIEWED')}>
            <CheckCircle2 size={17} />
            Approve for technicians
          </button>
          <button className="btn-secondary w-full !text-red-700" disabled={isPending} onClick={() => onStatusChange('CANCELLED')}>
            <XCircle size={17} />
            Reject request
          </button>
        </div>
      </Panel>
    )
  }

  const nextStatuses = transitions[requestStatus] || []

  return (
    <Panel>
      <h2 className="font-display font-bold">Update status</h2>
      <p className="mt-1 text-xs text-slate-500">Only valid next steps are available.</p>
      {nextStatuses.length ? (
        <select className="input mt-5" value="" disabled={isPending} onChange={(event) => onStatusChange(event.target.value)}>
          <option value="" disabled>Choose next status</option>
          {nextStatuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      ) : (
        <p className="mt-5 rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-500">
          No manual transitions are available.
        </p>
      )}
    </Panel>
  )
}
