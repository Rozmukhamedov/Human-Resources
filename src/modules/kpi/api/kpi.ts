import { apiRequest } from '@core/api/client'
import { tokenStorage } from '@core/api/tokenStorage'
import type { KpiResultsResponse, KpiResultEmployee, KpiWeightsConfig, KpiWeightsPayload } from '../model/kpi.types'

export interface KpiResultsParams {
  year?: number
  month?: number
}

type RawKpiResultEmployee = Omit<KpiResultEmployee, 'kpi' | 'grade'> & {
  kpi: number | null
  grade: KpiResultEmployee['grade'] | null
}
type RawKpiResultsResponse = Omit<KpiResultsResponse, 'results'> & {
  results: RawKpiResultEmployee[]
}

export function getKpiWeights() {
  return apiRequest<KpiWeightsConfig>('/kpi/weights/')
}

export function updateKpiWeights(data: KpiWeightsPayload) {
  return apiRequest<KpiWeightsConfig>('/kpi/weights/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function calculateKpi() {
  return apiRequest<void>('/kpi/calculate/', { method: 'POST' })
}

export async function getKpiResults(params: KpiResultsParams = {}): Promise<KpiResultsResponse> {
  const q = new URLSearchParams()
  if (params.year != null) q.set('year', String(params.year))
  if (params.month != null) q.set('month', String(params.month))
  const qs = q.toString()
  const data = await apiRequest<RawKpiResultsResponse>(`/kpi/results/${qs ? `?${qs}` : ''}`)
  return {
    ...data,
    results: data.results.map(r => ({ ...r, kpi: r.kpi ?? 0, grade: r.grade ?? '' })),
  }
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
