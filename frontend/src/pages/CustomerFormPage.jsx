import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, apiMessage } from '../api/client'
import { useToast } from '../components/Toast'
import { ErrorPanel, Field, Loading, PageHeader, Panel } from '../components/ui'
import { useLanguage } from '../i18n/LanguageContext'

export function CustomerFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const query = useQuery({ queryKey: ['customer', id], queryFn: async () => (await api.get(`/customers/${id}`)).data, enabled: editing })
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm()
  useEffect(() => { if (query.data) reset(query.data) }, [query.data, reset])

  const mutation = useMutation({
    mutationFn: (values) => editing ? api.put(`/customers/${id}`, values) : api.post('/customers', values),
    onSuccess: ({ data }) => { queryClient.invalidateQueries({ queryKey: ['customers'] }); showToast(editing ? t('Customer updated') : t('Customer created')); navigate(`/app/customers/${data.id}`) },
    onError: (error) => { Object.entries(error.response?.data?.fieldErrors || {}).forEach(([field, message]) => setError(field, { message: t(message) })); showToast(apiMessage(error), 'error') }
  })

  if (query.isLoading) return <Loading />
  if (query.isError) return <ErrorPanel message={apiMessage(query.error)} />
  return <div className="animate-rise"><Link className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-ink" to="/app/customers"><ArrowLeft size={16} />{t('Customers')}</Link><PageHeader eyebrow={editing ? t('Customer record') : t('New relationship')} title={editing ? query.data?.name : t('Add customer')} description={editing ? t('Review and update contact and site information.') : t('Create a customer before opening their first service request.')} /><Panel className="max-w-3xl"><form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit((values) => mutation.mutate(values))}><Field label={t('Contact name')} error={errors.name}><input className="input" {...register('name', { required: t('Name is required') })} /></Field><Field label={t('Company')} error={errors.company}><input className="input" {...register('company')} /></Field><Field label={t('Email')} error={errors.email}><input className="input" type="email" {...register('email', { required: t('Email is required') })} /></Field><Field label={t('Phone')} error={errors.phone}><input className="input" {...register('phone', { required: t('Phone is required') })} /></Field><div className="sm:col-span-2"><Field label={t('Service address')} error={errors.address}><input className="input" {...register('address', { required: t('Address is required') })} /></Field></div><div className="sm:col-span-2"><Field label={t('Notes')} error={errors.notes}><textarea className="input min-h-28 resize-y" {...register('notes')} /></Field></div><div className="flex gap-3 sm:col-span-2"><button className="btn-primary" disabled={isSubmitting || mutation.isPending}><Save size={17} />{editing ? t('Save changes') : t('Create customer')}</button><Link className="btn-secondary" to="/app/customers">{t('Cancel')}</Link></div></form></Panel></div>
}
