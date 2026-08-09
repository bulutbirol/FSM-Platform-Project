import { Panel } from '../ui'

function AssignmentForm({ technicians, technicianId, scheduledDate, isPending, onTechnicianChange, onDateChange, onAssign }) {
  return (
    <div className="mt-6 border-t border-slate-100 pt-5">
      <h3 className="text-xs font-bold uppercase text-slate-400">Assign technician</h3>
      <select className="input" value={technicianId} onChange={(event) => onTechnicianChange(event.target.value)}>
        <option value="">Select technician</option>
        {technicians.map((technician) => (
          <option key={technician.id} value={technician.id}>
            {technician.firstName} {technician.lastName}
          </option>
        ))}
      </select>
      <input className="input" type="datetime-local" value={scheduledDate} onChange={(event) => onDateChange(event.target.value)} />
      <button className="btn-primary mt-3 w-full" disabled={!technicianId || !scheduledDate || isPending} onClick={() => onAssign()}>
        Assign and schedule
      </button>
    </div>
  )
}

function StatusControl({ statuses, onStatusChange }) {
  return (
    <div className="mt-6 border-t border-slate-100 pt-5">
      <label className="text-xs font-bold uppercase text-slate-400">
        Admin status control
        <select className="input" value="" onChange={(event) => onStatusChange(event.target.value)}>
          <option value="" disabled>Choose next status</option>
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </label>
    </div>
  )
}

export function WorkOrderSidePanel({
  isAdmin,
  order,
  technicians,
  technicianId,
  scheduledDate,
  nextStatuses,
  assignmentPending,
  onTechnicianChange,
  onDateChange,
  onAssign,
  onStatusChange
}) {
  return (
    <Panel>
      <h2 className="font-display font-bold">Source request</h2>
      <p className="mt-3 text-sm font-semibold">{order.serviceRequestTitle}</p>
      <p className="mt-1 text-xs text-slate-500">Request #{order.serviceRequestId}</p>

      {isAdmin && order.status === 'UNASSIGNED' && (
        <AssignmentForm
          technicians={technicians}
          technicianId={technicianId}
          scheduledDate={scheduledDate}
          isPending={assignmentPending}
          onTechnicianChange={onTechnicianChange}
          onDateChange={onDateChange}
          onAssign={onAssign}
        />
      )}
      {isAdmin && nextStatuses.length > 0 && (
        <StatusControl statuses={nextStatuses} onStatusChange={onStatusChange} />
      )}
    </Panel>
  )
}
