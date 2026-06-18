import { apiRequest } from '@core/api/client'
import { tokenStorage } from '@core/api/tokenStorage'
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

export async function exportKpiExcel(): Promise<void> {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL as string
  const access = tokenStorage.getAccess()
  const headers: Record<string, string> = {}
  if (access) headers['Authorization'] = `Bearer ${access}`

  const res = await fetch(`${BASE_URL}/kpi/export/`, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition')
  let filename = 'kpi_report.xlsx'
  if (disposition) {
    const match = disposition.match(/filename[^;=\n]*=(['"]?)(.+?)\1(;|$)/)
    if (match?.[2]) filename = match[2]
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
