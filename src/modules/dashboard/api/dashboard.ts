import { apiRequest } from '@core/api/client'
import type { DashboardData } from '../model/dashboard.types'

export function getDashboard() {
  return apiRequest<DashboardData>('/dashboard/')
}
