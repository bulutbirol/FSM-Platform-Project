import { useQuery } from '@tanstack/react-query'
import { api, apiMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { WorkOrderBoard } from '../components/WorkOrderBoard'
import { ErrorPanel, Loading, PageHeader } from '../components/ui'

export function WorkOrdersPage() {
  const { user } = useAuth()
  const query = useQuery({ queryKey: ['work-orders'], queryFn: async () => (await api.get('/work-orders')).data })
  return <div className="animate-rise"><PageHeader eyebrow="Field execution" title={user.role === 'TECHNICIAN' ? 'Your assigned work' : 'Work-order board'} description={user.role === 'TECHNICIAN' ? 'Start and complete the visits assigned to you.' : 'See scheduling and field progress across the team.'} />{query.isLoading ? <Loading /> : query.isError ? <ErrorPanel message={apiMessage(query.error)} /> : <div className="overflow-x-auto pb-4"><WorkOrderBoard orders={query.data} /></div>}</div>
}

