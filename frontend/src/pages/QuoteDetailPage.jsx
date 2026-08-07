import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, Edit3, Send, Wrench, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, apiMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../components/Toast'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorPanel, Loading, PageHeader, Panel } from '../components/ui'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TRY' })

export function QuoteDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const query = useQuery({ queryKey: ['quote', id], queryFn: async () => (await api.get(`/quotes/${id}`)).data })
  const action = useMutation({ mutationFn: (name) => api.post(`/quotes/${id}/${name}`), onSuccess: ({ data }) => { queryClient.invalidateQueries({ queryKey: ['quote', id] }); queryClient.invalidateQueries({ queryKey: ['quotes'] }); queryClient.invalidateQueries({ queryKey: ['requests'] }); showToast(`Quotation ${data.status.toLowerCase()}`) }, onError: (error) => showToast(apiMessage(error), 'error') })
  if (query.isLoading) return <Loading />
  if (query.isError) return <ErrorPanel message={apiMessage(query.error)} />
  const quote = query.data
  const actions = <div className="flex flex-wrap gap-2">{user.role === 'ADMIN' && quote.status === 'DRAFT' && <><Link className="btn-secondary" to={`/app/quotes/${id}/edit`}><Edit3 size={16} />Edit</Link><button className="btn-primary" onClick={() => action.mutate('send')}><Send size={16} />Send quote</button></>}{user.role === 'ADMIN' && quote.status === 'APPROVED' && <button className="btn-primary" onClick={() => navigate(`/app/work-orders/new?requestId=${quote.serviceRequest.id}`)}><Wrench size={16} />Create work order</button>}{user.role === 'CUSTOMER' && quote.status === 'SENT' && <><button className="btn-primary" onClick={() => action.mutate('approve')}><Check size={16} />Approve</button><button className="btn-danger" onClick={() => action.mutate('reject')}><X size={16} />Reject</button></>}</div>
  return <div className="animate-rise"><Link className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500" to="/app/quotes"><ArrowLeft size={16} />Quotations</Link><PageHeader eyebrow={`Quotation #${quote.id}`} title={quote.serviceRequest.title} description={`Prepared for ${quote.serviceRequest.customer.name}`} action={actions} /><div className="grid gap-6 lg:grid-cols-[1fr_340px]"><Panel><StatusBadge value={quote.status} /><p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-600">{quote.description}</p><div className="mt-8 border-t border-slate-100 pt-6"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Quoted total</p><p className="mt-2 font-display text-4xl font-extrabold text-ink">{money.format(quote.amount)}</p></div></Panel><Panel><h2 className="font-display font-bold">Quotation details</h2><dl className="mt-5 space-y-5 text-sm"><div><dt className="text-xs font-bold uppercase text-slate-400">Valid until</dt><dd className="mt-1 font-semibold">{new Date(`${quote.validUntil}T00:00:00`).toLocaleDateString()}</dd></div><div><dt className="text-xs font-bold uppercase text-slate-400">Service request</dt><dd className="mt-1"><Link className="font-semibold text-mineral" to={`/app/requests/${quote.serviceRequest.id}`}>#{quote.serviceRequest.id} {quote.serviceRequest.title}</Link></dd></div><div><dt className="text-xs font-bold uppercase text-slate-400">Customer</dt><dd className="mt-1 font-semibold">{quote.serviceRequest.customer.name}</dd></div></dl></Panel></div></div>
}

