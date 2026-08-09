import { CalendarClock } from 'lucide-react'
import { toLocalDateTimeInput } from '../../utils/dateTime'
import { Panel } from '../ui'

export function TechnicianAcceptancePanel({ appointment, isPending, onAppointmentChange, onAccept }) {
  return (
    <Panel>
      <p className="text-xs font-bold uppercase tracking-[.16em] text-saffron">Technician decision</p>
      <h2 className="mt-2 font-display text-lg font-bold">Confirm the appointment</h2>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Accepting assigns this request to you and creates a scheduled work order.
      </p>
      <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-slate-500">
        Appointment date and time
        <input
          className="input"
          type="datetime-local"
          value={appointment}
          min={toLocalDateTimeInput()}
          onChange={(event) => onAppointmentChange(event.target.value)}
        />
      </label>
      <button className="btn-primary mt-3 w-full" disabled={!appointment || isPending} onClick={() => onAccept()}>
        <CalendarClock size={17} />
        Accept and schedule
      </button>
    </Panel>
  )
}
