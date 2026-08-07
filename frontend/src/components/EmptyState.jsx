import { Inbox } from 'lucide-react'

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Inbox size={22} /></div>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

