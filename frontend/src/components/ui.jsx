import { LoaderCircle, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PageHeader({ eyebrow, title, description, action, actionLabel, actionTo }) {
  return (
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-mineral">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {action || (actionTo && <Link className="btn-primary" to={actionTo}><Plus size={17} />{actionLabel}</Link>)}
    </header>
  )
}

export function Loading({ label = 'Loading' }) {
  return <div className="grid min-h-48 place-items-center text-sm font-semibold text-slate-500"><span className="flex items-center gap-2"><LoaderCircle className="animate-spin" size={18} />{label}</span></div>
}

export function ErrorPanel({ message }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800" role="alert">{message}</div>
}

export function Field({ label, error, children }) {
  return <label className="block text-sm font-semibold text-slate-700"><span>{label}</span>{children}{error && <span className="mt-1 block text-xs text-red-600">{error.message}</span>}</label>
}

export function Panel({ children, className = '' }) {
  return <div className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6 ${className}`}>{children}</div>
}
