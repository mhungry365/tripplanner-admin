import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

const AdminLayout      = lazy(() => import('./components/layout/AdminLayout'))
const LoginPage        = lazy(() => import('./pages/LoginPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const DashboardPage    = lazy(() => import('./pages/DashboardPage'))
const UsersPage        = lazy(() => import('./pages/UsersPage'))
const DestinationsPage = lazy(() => import('./pages/DestinationsPage'))
const BroadcastPage    = lazy(() => import('./pages/BroadcastPage'))
const SupportPage      = lazy(() => import('./pages/SupportPage'))
const SettingsPage     = lazy(() => import('./pages/SettingsPage'))
const DealsPage        = lazy(() => import('./pages/DealsPage'))

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuthStore()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  const role = profile?.role
  if (role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="card max-w-md text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-4">This portal is restricted to super administrators only.</p>
          <button
            onClick={async () => { await useAuthStore.getState().signOut(); window.location.href = '/login' }}
            className="btn-primary"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }
  return children
}

export default function App() {
  const initialize = useAuthStore(s => s.initialize)
  useEffect(() => { initialize() }, [initialize])

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<DashboardPage />} />
          <Route path="users"        element={<UsersPage />} />
          <Route path="destinations" element={<DestinationsPage />} />
          <Route path="broadcast"    element={<BroadcastPage />} />
          <Route path="support"      element={<SupportPage />} />
          <Route path="deals"        element={<DealsPage />} />
          <Route path="settings"     element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
