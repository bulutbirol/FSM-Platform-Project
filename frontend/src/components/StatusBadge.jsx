const tones = {
  NEW: 'bg-sky-50 text-sky-700 ring-sky-200',
  REVIEWED: 'bg-slate-100 text-slate-700 ring-slate-200',
  DRAFT: 'bg-slate-100 text-slate-700 ring-slate-200',
  QUOTED: 'bg-amber-50 text-amber-800 ring-amber-200',
  SENT: 'bg-blue-50 text-blue-700 ring-blue-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  SCHEDULED: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  IN_PROGRESS: 'bg-orange-50 text-orange-700 ring-orange-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-200',
  UNASSIGNED: 'bg-slate-100 text-slate-700 ring-slate-200'
}

export function StatusBadge({ value }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${tones[value] || tones.NEW}`}>{value?.replaceAll('_', ' ')}</span>
}

