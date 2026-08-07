import { ArrowLeft, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <main className="grid min-h-screen place-items-center bg-paper px-5 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-100 text-mineral"><Compass size={28} /></span><p className="mt-7 text-xs font-bold uppercase tracking-[.2em] text-mineral">404 · Route not found</p><h1 className="mt-3 font-display text-4xl font-extrabold text-ink">This job went off route.</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">The page may have moved, or the address may be incomplete.</p><Link className="btn-primary mt-7" to="/"><ArrowLeft size={17} />Return home</Link></div></main>
}

