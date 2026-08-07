import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, apiMessage } from '../api/client'
import { useToast } from '../components/Toast'
import { ErrorPanel, Field, Loading, PageHeader, Panel } from '../components/ui'

export function QuoteFormPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const quoteQuery = useQuery({ queryKey: ['quote', id], queryFn: async () => (await api.get(`/quotes/${id}`)).data, enabled: editing })
  const requestsQuery = useQuery({ queryKey: ['requests'], queryFn: async () => (await api.get('/service-requests')).data })
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({ defaultValues: { serviceRequestId: params.get('requestId') || '', validUntil: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) } })
  useEffect(() => { if (quoteQuery.data) reset({ ...quoteQuery.data, serviceRequestId: quoteQuery.data.serviceRequest.id }) }, [quoteQuery.data, reset])
  const mutation = useMutation({ mutationFn: (values) => { const body = { ...values, amount: Number(values.amount), serviceRequestId: Number(values.serviceRequestId) }; return editing ? api.put(`/quotes/${id}`, body) : api.post('/quotes', body) }, onSuccess: ({ data }) => { queryClient.invalidateQueries({ queryKey: ['quotes'] }); showToast(editing ? 'Quotation updated' : 'Draft quotation created'); navigate(`/app/quotes/${data.id}`) }, onError: (error) => { Object.entries(error.response?.data?.fieldErrors || {}).forEach(([field, message]) => setError(field, { message })); showToast(apiMessage(error), 'error') } })
  if (quoteQuery.isLoading || requestsQuery.isLoading) return <Loading />
  if (quoteQuery.isError || requestsQuery.isError) return <ErrorPanel message={apiMessage(quoteQuery.error || requestsQuery.error)} />
  const eligible = requestsQuery.data.filter((request) => ['NEW', 'REVIEWED'].includes(request.status) || request.id === quoteQuery.data?.serviceRequest.id)
  return <div className="animate-rise"><Link className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500" to="/app/quotes"><ArrowLeft size={16} />Quotations</Link><PageHeader eyebrow="Commercial proposal" title={editing ? 'Edit quotation' : 'Create quotation'} description="Set a clear price, scope, and decision deadline." /><Panel className="max-w-3xl"><form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit((values) => mutation.mutate(values))}><div className="sm:col-span-2"><Field label="Service request" error={errors.serviceRequestId}><select className="input" disabled={editing} {...register('serviceRequestId', { required: 'Request is required' })}><option value="">Select request</option>{eligible.map((request) => <option key={request.id} value={request.id}>{request.title} — {request.customer.name}</option>)}</select></Field></div><Field label="Amount (TRY)" error={errors.amount}><input className="input" type="number" min="0.01" step="0.01" {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Amount must be positive' } })} /></Field><Field label="Valid until" error={errors.validUntil}><input className="input" type="date" {...register('validUntil', { required: 'Validity date is required' })} /></Field><div className="sm:col-span-2"><Field label="Scope and pricing notes" error={errors.description}><textarea className="input min-h-36" {...register('description', { required: 'Description is required' })} /></Field></div><div className="flex gap-3 sm:col-span-2"><button className="btn-primary" disabled={mutation.isPending}><Save size={17} />Save draft</button><Link className="btn-secondary" to="/app/quotes">Cancel</Link></div></form></Panel></div>
}

