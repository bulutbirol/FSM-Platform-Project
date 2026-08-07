import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, apiMessage } from '../api/client'
import { useToast } from '../components/Toast'
import { ErrorPanel, Field, Loading, PageHeader, Panel } from '../components/ui'

export function WorkOrderFormPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const requests = useQuery({ queryKey: ['approved-requests'], queryFn: async () => (await api.get('/service-requests', { params: { status: 'APPROVED' } })).data })
  const technicians = useQuery({ queryKey: ['technicians'], queryFn: async () => (await api.get('/users/technicians')).data })
  const { register, handleSubmit, setError, formState: { errors } } = useForm({ defaultValues: { serviceRequestId: params.get('requestId') || '', scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 16) } })
  const mutation = useMutation({ mutationFn: (values) => api.post('/work-orders', { ...values, serviceRequestId: Number(values.serviceRequestId), assignedUserId: values.assignedUserId ? Number(values.assignedUserId) : null, scheduledDate: values.scheduledDate || null }), onSuccess: ({ data }) => { queryClient.invalidateQueries({ queryKey: ['work-orders'] }); showToast('Work order created'); navigate(`/app/work-orders/${data.id}`) }, onError: (error) => { Object.entries(error.response?.data?.fieldErrors || {}).forEach(([field, message]) => setError(field, { message })); showToast(apiMessage(error), 'error') } })
  if (requests.isLoading || technicians.isLoading) return <Loading />
  if (requests.isError || technicians.isError) return <ErrorPanel message={apiMessage(requests.error || technicians.error)} />
  return <div className="animate-rise"><Link className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500" to="/app/work-orders"><ArrowLeft size={16} />Work orders</Link><PageHeader eyebrow="Field assignment" title="Create work order" description="Turn approved service into a scheduled technician visit." /><Panel className="max-w-3xl"><form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit((values) => mutation.mutate(values))}><div className="sm:col-span-2"><Field label="Approved request" error={errors.serviceRequestId}><select className="input" {...register('serviceRequestId', { required: 'Request is required' })}><option value="">Select request</option>{requests.data.map((request) => <option value={request.id} key={request.id}>{request.title} — {request.customer.name}</option>)}</select></Field></div><div className="sm:col-span-2"><Field label="Work-order title" error={errors.title}><input className="input" {...register('title', { required: 'Title is required' })} /></Field></div><Field label="Technician" error={errors.assignedUserId}><select className="input" {...register('assignedUserId')}><option value="">Leave unassigned</option>{technicians.data.map((user) => <option value={user.id} key={user.id}>{user.firstName} {user.lastName}</option>)}</select></Field><Field label="Scheduled date and time" error={errors.scheduledDate}><input className="input" type="datetime-local" {...register('scheduledDate')} /></Field><div className="sm:col-span-2"><Field label="Instructions" error={errors.description}><textarea className="input min-h-32" {...register('description', { required: 'Instructions are required' })} /></Field></div><div className="flex gap-3 sm:col-span-2"><button className="btn-primary" disabled={mutation.isPending}><Save size={17} />Create work order</button><Link className="btn-secondary" to="/app/work-orders">Cancel</Link></div></form></Panel></div>
}

