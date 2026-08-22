import { NavLink } from 'react-router-dom'
import { ClipboardList, FileText, LayoutDashboard, UserRound, UsersRound, Wrench } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

const nav = {
  ADMIN: [
    ['Dashboard', '/app/dashboard', LayoutDashboard],
    ['Customers', '/app/customers', UsersRound],
    ['Service requests', '/app/requests', ClipboardList],
    ['Quotations', '/app/quotes', FileText],
    ['Work orders', '/app/work-orders', Wrench],
    ['Profile', '/app/profile', UserRound]
  ],
  TECHNICIAN: [
    ['Request queue', '/app/requests', ClipboardList],
    ['Work orders', '/app/work-orders', Wrench],
    ['Profile', '/app/profile', UserRound]
  ],
  CUSTOMER: [
    ['Service requests', '/app/requests', ClipboardList],
    ['Quotations', '/app/quotes', FileText],
    ['Profile', '/app/profile', UserRound]
  ]
}

export function Navigation({ role, onNavigate }) {
  const { t } = useLanguage()
  return (
    <nav className="space-y-1.5" aria-label={t('Primary navigation')}>
      {(nav[role] || []).map(([label, path, Icon]) => (
        <NavLink key={path} to={path} onClick={onNavigate} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-white text-ink shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
          <Icon size={18} />
          {t(label)}
        </NavLink>
      ))}
    </nav>
  )
}
