export type KpiGrade = 'excellent' | 'good' | 'fair' | 'low'

export interface KpiScores {
  attendance: number | null
  tasks: number | null
  care: number | null
  docs: number | null
  discipline: number | null
  assessment: number | null
}

export interface KpiWeights {
  attendance: number
  tasks: number
  care: number
  docs: number
  discipline: number
  assessment: number
}

export interface KpiWeightsResponse extends KpiWeights {
  total_weight: number
  updated_at: string
}

export interface KpiResultEmployee {
  rank: number
  employee_id: number
  employee_name: string
  employee_code: string
  department_name: string
  attendance: number | null
  tasks: number | null
  care: number | null
  docs: number | null
  discipline: number | null
  assessment: number | null
  kpi: number
  grade: KpiGrade
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

export interface KpiEmployee {
  id: string
  initials: string
  firstName: string
  lastName: string
  departmentName: string
  scores: KpiScores
  imported?: boolean
}
