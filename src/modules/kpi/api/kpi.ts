import { apiRequest } from '@core/api/client'
import type { KpiWeights, KpiWeightsResponse, KpiResultsResponse } from '../model/kpi.types'

export interface KpiResultsParams {
  year?: number
  month?: number
}

export function getKpiWeights() {
  return apiRequest<KpiWeightsResponse>('/kpi/weights/')
}

export function updateKpiWeights(data: KpiWeights) {
  return apiRequest<KpiWeightsResponse>('/kpi/weights/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function calculateKpi() {
  return apiRequest<void>('/kpi/calculate/', { method: 'POST' })
}

export function getKpiResults(params: KpiResultsParams = {}) {
  const q = new URLSearchParams()
  if (params.year != null) q.set('year', String(params.year))
  if (params.month != null) q.set('month', String(params.month))
  const qs = q.toString()
  return apiRequest<KpiResultsResponse>(`/kpi/results/${qs ? `?${qs}` : ''}`)
}
