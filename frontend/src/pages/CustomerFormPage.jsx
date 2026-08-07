import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, apiMessage } from '../api/client'
import { useToast } from '../components/Toast'
import { ErrorPanel, Field, Loading, PageHeader, Panel } from '../components/ui'

export function CustomerFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const query = useQuery({ queryKey: ['customer', id], queryFn: async () => (await api.get(`/customers/${id}`)).data, enabled: editing })
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm()
  useEffect(() => { if (query.data) reset(query.data) }, [query.data, reset])

  const mutation = useMutation({
    mutationFn: (values) => editing ? api.put(`/customers/${id}`, values) : api.post('/customers', values),
    onSuccess: ({ data }) => { queryClient.invalidateQueries({ queryKey: ['customers'] }); showToast(editing ? 'Customer updated' : 'Customer created'); navigate(`/app/customers/${data.id}`) },
    onError: (error) => { Object.entries(error.response?.data?.fieldErrors || {}).forEach(([field, message]) => setError(field, { message })); showToast(apiMessage(error), 'error') }
  })

  if (query.isLoading) return <Loading />
  if (query.isError) return <ErrorPanel message={apiMessage(query.error)} />
  return <div className="animate-rise"><Link className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-ink" to="/app/customers"><ArrowLeft size={16} />Customers</Link><PageHeader eyebrow={editing ? 'Customer record' : 'New relationship'} title={editing ? query.data?.name : 'Add customer'} description={editing ? 'Review and update contact and site information.' : 'Create a customer before opening their first service request.'} /><Panel className="max-w-3xl"><form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit((values) => mutation.mutate(values))}><Field label="Contact name" error={errors.name}><input className="input" {...register('name', { required: 'Name is required' })} /></Field><Field label="Company" error={errors.company}><input className="input" {...register('company')} /></Field><Field label="Email" error={errors.email}><input className="input" type="email" {...register('email', { required: 'Email is required' })} /></Field><Field label="Phone" error={errors.phone}><input className="input" {...register('phone', { required: 'Phone is required' })} /></Field><div className="sm:col-span-2"><Field label="Service address" error={errors.address}><input className="input" {...register('address', { required: 'Address is required' })} /></Field></div><div className="sm:col-span-2"><Field label="Notes" error={errors.notes}><textarea className="input min-h-28 resize-y" {...register('notes')} /></Field></div><div className="flex gap-3 sm:col-span-2"><button className="btn-primary" disabled={isSubmitting || mutation.isPending}><Save size={17} />{editing ? 'Save changes' : 'Create customer'}</button><Link className="btn-secondary" to="/app/customers">Cancel</Link></div></form></Panel></div>
}

