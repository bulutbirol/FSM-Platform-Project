import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { AppShell } from './components/AppShell'
import { Loading } from './components/ui'
import { CustomerFormPage } from './pages/CustomerFormPage'
import { CustomersPage } from './pages/CustomersPage'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { QuoteDetailPage } from './pages/QuoteDetailPage'
import { QuoteFormPage } from './pages/QuoteFormPage'
import { QuotesPage } from './pages/QuotesPage'
import { RequestDetailPage } from './pages/RequestDetailPage'
import { RequestFormPage } from './pages/RequestFormPage'
import { RequestsPage } from './pages/RequestsPage'
import { WorkOrderDetailPage } from './pages/WorkOrderDetailPage'
import { WorkOrderFormPage } from './pages/WorkOrderFormPage'
import { WorkOrdersPage } from './pages/WorkOrdersPage'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center"><Loading label="Restoring session" /></div>
  return user ? children : <Navigate to="/login" replace />
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth()
  if (!roles.includes(user.role)) return <Navigate to={user.role === 'ADMIN' ? '/app/dashboard' : user.role === 'TECHNICIAN' ? '/app/work-orders' : '/app/requests'} replace />
  return children
}

function AppHome() {
  const { user } = useAuth()
  return <Navigate to={user.role === 'ADMIN' ? '/app/dashboard' : user.role === 'TECHNICIAN' ? '/app/work-orders' : '/app/requests'} replace />
}

export default function App() {
  return <Routes><Route path="/" element={<LandingPage />} /><Route path="/login" element={<LoginPage />} /><Route path="/app" element={<Protected><AppShell /></Protected>}><Route index element={<AppHome />} /><Route path="dashboard" element={<RoleRoute roles={['ADMIN']}><DashboardPage /></RoleRoute>} /><Route path="customers" element={<RoleRoute roles={['ADMIN']}><CustomersPage /></RoleRoute>} /><Route path="customers/new" element={<RoleRoute roles={['ADMIN']}><CustomerFormPage /></RoleRoute>} /><Route path="customers/:id" element={<RoleRoute roles={['ADMIN']}><CustomerFormPage /></RoleRoute>} /><Route path="requests" element={<RoleRoute roles={['ADMIN', 'CUSTOMER']}><RequestsPage /></RoleRoute>} /><Route path="requests/new" element={<RoleRoute roles={['ADMIN']}><RequestFormPage /></RoleRoute>} /><Route path="requests/:id/edit" element={<RoleRoute roles={['ADMIN']}><RequestFormPage /></RoleRoute>} /><Route path="requests/:id" element={<RoleRoute roles={['ADMIN', 'CUSTOMER']}><RequestDetailPage /></RoleRoute>} /><Route path="quotes" element={<RoleRoute roles={['ADMIN', 'CUSTOMER']}><QuotesPage /></RoleRoute>} /><Route path="quotes/new" element={<RoleRoute roles={['ADMIN']}><QuoteFormPage /></RoleRoute>} /><Route path="quotes/:id/edit" element={<RoleRoute roles={['ADMIN']}><QuoteFormPage /></RoleRoute>} /><Route path="quotes/:id" element={<RoleRoute roles={['ADMIN', 'CUSTOMER']}><QuoteDetailPage /></RoleRoute>} /><Route path="work-orders" element={<RoleRoute roles={['ADMIN', 'TECHNICIAN']}><WorkOrdersPage /></RoleRoute>} /><Route path="work-orders/new" element={<RoleRoute roles={['ADMIN']}><WorkOrderFormPage /></RoleRoute>} /><Route path="work-orders/:id" element={<RoleRoute roles={['ADMIN', 'TECHNICIAN']}><WorkOrderDetailPage /></RoleRoute>} /><Route path="profile" element={<ProfilePage />} /></Route><Route path="*" element={<NotFoundPage />} /></Routes>
}

