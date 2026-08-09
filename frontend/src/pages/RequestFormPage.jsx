import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, apiMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../components/Toast'
import { ErrorPanel, Field, Loading, PageHeader, Panel } from '../components/ui'

const defaultValues = {
  priority: 'MEDIUM',
  requestedDate: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
}

function LinkedCustomerNotice() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:col-span-2">
      <p className="flex items-center gap-2 text-sm font-bold text-blue-950">
        <ShieldCheck size={18} />
        Linked customer account
      </p>
      <p className="mt-1 text-xs leading-5 text-blue-800">
        This request is securely linked to the customer record associated with your signed-in account.
      </p>
    </div>
  )
}

function CustomerField({ customers, error, register }) {
  return (
    <Field label="Customer" error={error}>
      <select className="input" {...register('customerId', { required: 'Customer is required' })}>
        <option value="">Select customer</option>
        {customers.map((customer) => (
          <option value={customer.id} key={customer.id}>
            {customer.name} — {customer.company || 'Independent'}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function RequestFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { user } = useAuth()
  const isAdmin = user.role === 'ADMIN'

  const requestQuery = useQuery({
    queryKey: ['request', id],
    queryFn: async () => (await api.get(`/service-requests/${id}`)).data,
    enabled: editing
  })
  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: async () => (await api.get('/customers')).data,
    enabled: isAdmin
  })
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm({ defaultValues })

  useEffect(() => {
    if (requestQuery.data) {
      reset({ ...requestQuery.data, customerId: requestQuery.data.customer.id })
    }
  }, [requestQuery.data, reset])

  const mutation = useMutation({
    mutationFn: (values) => {
      const payload = { ...values, customerId: isAdmin ? Number(values.customerId) : null }
      return editing
        ? api.put(`/service-requests/${id}`, payload)
        : api.post('/service-requests', payload)
    },
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      showToast(editing ? 'Request updated' : 'Request submitted for admin review')
      navigate(`/app/requests/${data.id}`)
    },
    onError: (error) => {
      const fieldErrors = error.response?.data?.fieldErrors || {}
      Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }))
      showToast(apiMessage(error), 'error')
    }
  })

  if (requestQuery.isLoading || (isAdmin && customersQuery.isLoading)) return <Loading />
  if (requestQuery.isError || (isAdmin && customersQuery.isError)) {
    return <ErrorPanel message={apiMessage(requestQuery.error || customersQuery.error)} />
  }

  const description = isAdmin
    ? 'Capture enough context for a clear quotation and successful visit.'
    : 'Tell the operations team what you need. Your request will be reviewed before a technician can accept it.'
  const submitLabel = editing ? 'Save changes' : isAdmin ? 'Create request' : 'Submit for review'

  return (
    <div className="animate-rise">
      <Link className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500" to="/app/requests">
        <ArrowLeft size={16} />
        Service requests
      </Link>
      <PageHeader
        eyebrow={editing ? 'Request details' : 'New intake'}
        title={editing ? requestQuery.data?.title : 'Create service request'}
        description={description}
      />
      <Panel className="max-w-3xl">
        <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div className="sm:col-span-2">
            <Field label="Title" error={errors.title}>
              <input className="input" {...register('title', { required: 'Title is required' })} />
            </Field>
          </div>

          {isAdmin ? (
            <CustomerField customers={customersQuery.data || []} error={errors.customerId} register={register} />
          ) : (
            <LinkedCustomerNotice />
          )}

          <Field label="Priority" error={errors.priority}>
            <select className="input" {...register('priority')}>
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
              <option>URGENT</option>
            </select>
          </Field>
          <Field label="Requested date" error={errors.requestedDate}>
            <input className="input" type="date" {...register('requestedDate', { required: 'Date is required' })} />
          </Field>
          <Field label="Service address" error={errors.address}>
            <input className="input" {...register('address', { required: 'Address is required' })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description" error={errors.description}>
              <textarea className="input min-h-32" {...register('description', { required: 'Description is required' })} />
            </Field>
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <button className="btn-primary" disabled={mutation.isPending}>
              <Save size={17} />
              {submitLabel}
            </button>
            <Link className="btn-secondary" to="/app/requests">Cancel</Link>
          </div>
        </form>
      </Panel>
    </div>
  )
}
