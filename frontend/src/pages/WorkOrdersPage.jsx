import { useQuery } from '@tanstack/react-query'
import { api, apiMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { WorkOrderBoard } from '../components/WorkOrderBoard'
import { ErrorPanel, Loading, PageHeader } from '../components/ui'
import { useLanguage } from '../i18n/LanguageContext'

export function WorkOrdersPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const query = useQuery({ queryKey: ['work-orders'], queryFn: async () => (await api.get('/work-orders')).data })
  return <div className="animate-rise"><PageHeader eyebrow={t('Field execution')} title={user.role === 'TECHNICIAN' ? t('Your assigned work') : t('Work-order board')} description={user.role === 'TECHNICIAN' ? t('Start and complete the visits assigned to you.') : t('See scheduling and field progress across the team.')} />{query.isLoading ? <Loading /> : query.isError ? <ErrorPanel message={apiMessage(query.error)} /> : <div className="overflow-x-auto pb-4"><WorkOrderBoard orders={query.data} /></div>}</div>
}
