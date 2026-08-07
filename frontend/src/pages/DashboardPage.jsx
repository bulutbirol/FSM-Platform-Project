import { useQuery } from '@tanstack/react-query'
import { BarChart3, CheckCircle2, ClipboardList, FileClock, UsersRound, Wrench } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api, apiMessage } from '../api/client'
import { ErrorPanel, Loading, PageHeader, Panel } from '../components/ui'
import { StatusBadge } from '../components/StatusBadge'

export function DashboardPage() {
  const query = useQuery({ queryKey: ['dashboard'], queryFn: async () => (await api.get('/dashboard')).data })
  if (query.isLoading) return <Loading label="Building dashboard" />
  if (query.isError) return <ErrorPanel message={apiMessage(query.error)} />
  const data = query.data
  const cards = [
    ['Customers', data.totalCustomers, UsersRound, 'bg-blue-50 text-blue-700'],
    ['Open requests', data.openServiceRequests, ClipboardList, 'bg-amber-50 text-amber-700'],
    ['Pending quotes', data.pendingQuotations, FileClock, 'bg-violet-50 text-violet-700'],
    ['Scheduled', data.scheduledWorkOrders, Wrench, 'bg-indigo-50 text-indigo-700'],
    ['Completed', data.completedWorkOrders, CheckCircle2, 'bg-emerald-50 text-emerald-700']
  ]
  const chart = data.workOrderStatusChart.map((item) => ({ ...item, label: item.status.replaceAll('_', ' ') }))

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Operations overview" title="Good work starts with clarity." description="Live activity across customers, requests, quotations, and field assignments." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, Icon, color]) => <Panel key={label} className="!rounded-2xl !p-4"><div className="flex items-center justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon size={19} /></span><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live</span></div><p className="mt-5 font-display text-3xl font-extrabold text-ink">{value}</p><p className="mt-1 text-sm font-semibold text-slate-500">{label}</p></Panel>)}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <Panel><div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600"><BarChart3 size={18} /></span><div><h2 className="font-display font-bold text-ink">Work-order mix</h2><p className="text-xs text-slate-500">Current volume by status</p></div></div><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart} margin={{ top: 10, right: 0, bottom: 5, left: -20 }}><CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }} /><Bar dataKey="count" fill="#2463eb" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div></Panel>
        <Panel><h2 className="font-display font-bold text-ink">Recent work orders</h2><p className="mt-1 text-xs text-slate-500">The latest field activity</p><div className="mt-5 divide-y divide-slate-100">{data.recentWorkOrders.map((order) => <div key={order.id} className="flex items-center gap-3 py-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><Wrench size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-ink">{order.title}</p><p className="truncate text-xs text-slate-500">{order.customer.name}</p></div><StatusBadge value={order.status} /></div>)}</div></Panel>
      </div>
    </div>
  )
}
