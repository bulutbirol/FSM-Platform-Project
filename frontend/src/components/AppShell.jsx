import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, LogOut, Menu, RotateCcw, X, Zap } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'
import { api, apiMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Navigation } from './Navigation'
import { useToast } from './Toast'

export function AppShell() {
  const { user, logout, switchRole } = useAuth()
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const reset = useMutation({
    mutationFn: () => api.post('/demo/reset'),
    onSuccess: () => {
      queryClient.clear()
      showToast('Demo data restored')
      navigate('/app/dashboard')
    },
    onError: (error) => showToast(apiMessage(error), 'error')
  })

  const changeRole = async (event) => {
    setSwitching(true)
    try {
      const nextUser = await switchRole(event.target.value)
      queryClient.clear()
      showToast(`Switched to ${nextUser.role.toLowerCase()}`)
      navigate(nextUser.role === 'ADMIN' ? '/app/dashboard' : nextUser.role === 'TECHNICIAN' ? '/app/work-orders' : '/app/requests')
    } catch (error) {
      showToast(apiMessage(error), 'error')
    } finally {
      setSwitching(false)
    }
  }

  const signOut = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-ink p-5 text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-9 flex items-center justify-between">
          <button className="flex items-center gap-3 text-left" onClick={() => navigate('/')}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-mineral text-white shadow-lg shadow-blue-900/30"><Zap size={21} fill="currentColor" /></span>
            <span><strong className="block font-display text-lg">ServiceFlow</strong><small className="text-[10px] uppercase tracking-[.16em] text-slate-400">Field operations</small></span>
          </button>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button>
        </div>
        <Navigation role={user.role} onNavigate={() => setOpen(false)} />
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-saffron font-display text-sm font-extrabold text-ink">{user.firstName[0]}{user.lastName[0]}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{user.firstName} {user.lastName}</p><p className="text-[10px] uppercase tracking-wider text-slate-400">{user.role}</p></div>
            <button onClick={signOut} aria-label="Sign out" className="text-slate-400 hover:text-white"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>
      {open && <button className="fixed inset-0 z-40 bg-ink/50 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-slate-200/80 bg-paper/90 px-4 backdrop-blur-xl sm:px-7">
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-slate-400 sm:flex"><Zap size={14} className="text-saffron" />Demo workspace</div>
          <div className="ml-auto flex items-center gap-2">
            {user.role === 'ADMIN' && <button className="btn-secondary !px-3 !py-2 text-xs" onClick={() => window.confirm('Restore the original shared demo data?') && reset.mutate()} disabled={reset.isPending}><RotateCcw size={15} /> <span className="hidden sm:inline">Reset demo data</span></button>}
            <label className="relative">
              <span className="sr-only">Switch demo role</span>
              <select className="appearance-none rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-8 text-xs font-bold text-slate-700 outline-none" value={user.role} onChange={changeRole} disabled={switching}>
                <option value="ADMIN">Admin demo</option>
                <option value="TECHNICIAN">Technician demo</option>
                <option value="CUSTOMER">Customer demo</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5" size={14} />
            </label>
          </div>
        </header>
        <main className="mx-auto max-w-[1480px] p-4 sm:p-7 lg:p-9"><Outlet /></main>
      </div>
    </div>
  )
}

