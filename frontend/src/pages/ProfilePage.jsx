import { Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { PageHeader, Panel } from '../components/ui'

export function ProfilePage() {
  const { user } = useAuth()
  return <div className="animate-rise"><PageHeader eyebrow="Account" title="Profile" description="Your current demo identity and access level." /><Panel className="max-w-2xl"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><span className="grid h-20 w-20 place-items-center rounded-3xl bg-ink font-display text-2xl font-extrabold text-white">{user.firstName[0]}{user.lastName[0]}</span><div><h2 className="font-display text-2xl font-extrabold">{user.firstName} {user.lastName}</h2><p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Mail size={16} />{user.email}</p><p className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"><ShieldCheck size={14} />{user.role}</p></div></div><div className="mt-8 border-t border-slate-100 pt-6"><h3 className="flex items-center gap-2 font-display font-bold"><UserRound size={18} />Demo profile</h3><p className="mt-2 text-sm leading-6 text-slate-500">Profile editing is outside this MVP. Use the role switcher in the top bar to explore the permissions and workflow for each seeded account.</p></div></Panel></div>
}

