import { Navigate, Outlet } from 'react-router-dom'
import { useUIStore } from '@core/store/uiStore'
import { tokenStorage } from '@core/api/tokenStorage'

export function ProtectedRoute() {
  const isAuthenticated = useUIStore((s) => s.isAuthenticated)
  // also check cookie directly in case zustand state is stale
  const hasToken = tokenStorage.hasToken()

  return isAuthenticated && hasToken ? <Outlet /> : <Navigate to="/login" replace />
}
