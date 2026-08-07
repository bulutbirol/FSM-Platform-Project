import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Mail, Phone, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, apiMessage } from '../api/client'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../components/Toast'
import { ErrorPanel, Loading, PageHeader } from '../components/ui'

export function CustomersPage() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const query = useQuery({ queryKey: ['customers', search], queryFn: async () => (await api.get('/customers', { params: search ? { search } : {} })).data })
  const archive = useMutation({
    mutationFn: (id) => api.delete(`/customers/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); showToast('Customer archived') },
    onError: (error) => showToast(apiMessage(error), 'error')
  })
  const customers = query.data || []

  return <div className="animate-rise"><PageHeader eyebrow="Customer base" title="Customers" description="Contact details and service history in one place." actionLabel="Add customer" actionTo="/app/customers/new" /><div className="mb-5 max-w-md"><label className="relative block"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input className="input !mt-0 !pl-10" placeholder="Search name or company" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>{query.isLoading ? <Loading /> : query.isError ? <ErrorPanel message={apiMessage(query.error)} /> : customers.length === 0 ? <EmptyState title="No customers found" description={search ? 'Try a different search term.' : 'Create the first customer to begin a service workflow.'} action={!search && <Link className="btn-primary" to="/app/customers/new">Add customer</Link>} /> : <div className="table-shell"><div className="divide-y divide-slate-100">{customers.map((customer) => <div key={customer.id} className="grid gap-4 p-5 transition hover:bg-slate-50 sm:grid-cols-[1.3fr_1fr_auto] sm:items-center"><Link to={`/app/customers/${customer.id}`} className="min-w-0"><p className="font-display font-bold text-ink hover:text-mineral">{customer.name}</p><p className="mt-1 flex items-center gap-2 text-xs text-slate-500"><Building2 size={14} />{customer.company || 'Independent customer'}</p></Link><div className="space-y-1 text-xs text-slate-500"><p className="flex items-center gap-2"><Mail size={14} />{customer.email}</p><p className="flex items-center gap-2"><Phone size={14} />{customer.phone}</p></div><button className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Archive ${customer.name}`} onClick={() => window.confirm(`Archive ${customer.name}?`) && archive.mutate(customer.id)}><Trash2 size={17} /></button></div>)}</div></div>}</div>
}

