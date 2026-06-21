export type KpiGrade = 'excellent' | 'good' | 'fair' | 'low'

export interface KpiCustomWeight {
  name: string
  weight: number
}

export interface KpiWeights {
  attendance: number
  discipline: number
  custom: Record<string, KpiCustomWeight>
}

export interface KpiResultEmployee {
  rank: number
  employee_id: number
  employee_name: string
  employee_code: string
  department_name: string
  attendance: number | null
  discipline: number | null
  custom_scores: Record<string, number | null>
  kpi: number
  grade: KpiGrade | ''
}

export interface KpiResultsResponse {
  weights: KpiWeights
  total_weight: number
  year: number
  month: number
  count: number
  avg_kpi: number
  below_75_count: number
  results: KpiResultEmployee[]
}

export interface KpiCustomIndicator {
  id: number
  name: string
  weight: number
  order: number
}

export interface KpiWeightsConfig {
  attendance: number
  discipline: number
  total_weight: number
  custom_indicators: KpiCustomIndicator[]
  updated_at: string
}

export interface KpiWeightsPayload {
  attendance: number
  discipline: number
}
