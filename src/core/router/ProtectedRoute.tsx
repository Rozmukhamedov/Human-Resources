import { Navigate, Outlet } from 'react-router-dom'
import { useUIStore } from '@core/store/uiStore'

export function ProtectedRoute() {
  const isAuthenticated = useUIStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
