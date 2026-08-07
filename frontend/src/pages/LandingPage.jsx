import { ArrowRight, CalendarCheck, Check, ClipboardCheck, FileCheck2, ShieldCheck, Sparkles, Wrench, Zap } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { apiMessage } from '../api/client'

const steps = [
  ['01', 'Request', 'Capture the customer need and priority.', ClipboardCheck],
  ['02', 'Quote', 'Price the work and collect approval.', FileCheck2],
  ['03', 'Schedule', 'Assign the right technician.', CalendarCheck],
  ['04', 'Complete', 'Track field work through completion.', Wrench]
]

export function LandingPage() {
  const { switchRole } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tryDemo = async () => {
    setLoading(true)
    setError('')
    try {
      await switchRole('ADMIN')
      navigate('/app/dashboard')
    } catch (requestError) {
      setError(apiMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-blue-500/20 blur-[110px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <nav className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-mineral"><Zap size={21} fill="currentColor" /></span><span className="font-display text-lg font-extrabold">ServiceFlow</span></Link>
          <Link to="/login" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10">Sign in</Link>
        </nav>
        <main className="grid min-h-[calc(100vh-80px)] items-center gap-14 py-16 lg:grid-cols-[1.08fr_.92fr] lg:py-20">
          <section className="animate-rise">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-blue-200"><Sparkles size={14} />Every job, one clear flow</div>
            <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[1.02] tracking-[-.045em] sm:text-6xl lg:text-7xl">Field service work,<br /><span className="text-blue-400">finally in order.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">ServiceFlow brings customer requests, quotations, technician schedules, and work orders into one focused workspace for growing service teams.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button className="btn-primary !rounded-2xl !px-6 !py-3.5" onClick={tryDemo} disabled={loading}>{loading ? 'Entering demo…' : 'Try Demo'}<ArrowRight size={18} /></button>
              <Link to="/login" className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3.5 text-sm font-bold hover:bg-white/10">Use an account</Link>
            </div>
            {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400"><span className="flex items-center gap-2"><Check size={15} className="text-emerald-400" />Seeded demo data</span><span className="flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-400" />Role-based access</span><span className="flex items-center gap-2"><Check size={15} className="text-emerald-400" />No setup to explore</span></div>
          </section>
          <section className="relative animate-rise [animation-delay:120ms]">
            <div className="absolute -inset-4 rotate-2 rounded-[2rem] border border-white/10 bg-white/5" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/[.07] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
              <div className="mb-7 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-300">Live workflow</p><h2 className="mt-1 font-display text-2xl font-extrabold">From request to done</h2></div><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">Operational</span></div>
              <div className="space-y-3">
                {steps.map(([number, title, text, Icon], index) => <div key={title} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-ink/45 p-4 transition hover:border-blue-400/40 hover:bg-blue-400/10"><span className="font-display text-xs font-extrabold text-slate-500">{number}</span><span className={`grid h-11 w-11 place-items-center rounded-xl ${index === 0 ? 'bg-saffron text-ink' : 'bg-white/10 text-blue-300'}`}><Icon size={20} /></span><div className="flex-1"><h3 className="font-display font-bold">{title}</h3><p className="mt-0.5 text-xs text-slate-400">{text}</p></div>{index < 3 && <ArrowRight size={16} className="text-slate-600" />}</div>)}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

