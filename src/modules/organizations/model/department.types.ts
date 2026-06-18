export interface Department {
  id: number
  name_uz: string
  name_en: string
  head_name: string | null
  employee_count: number
  avg_kpi: number | null
  kpi_change: number | null
}

export interface DepartmentDetail {
  id: number
  name_uz: string
  name_en: string
  division: { id: number; name_uz: string; name_en: string } | null
  created_at: string
}

export interface DepartmentStaffMember {
  id: number
  full_name: string
  position: string | null
  kpi: number | null
  grade: string | null
  attendance: number | null
}

type IndicatorStat = { avg: number | null; weight: number }

export interface TopPerformer {
  id: number
  code: string
  full_name: string
  position: string | null
  kpi_score: number | null
  grade: string | null
}

export interface DepartmentDetailFull {
  id: number
  name_uz: string
  name_en: string
  division: {
    id: number
    name_uz: string
    name_en: string
    color: string
    order: number
  } | null
  head_name: string | null
  employee_count: number
  year: number
  month: number
  avg_kpi: number | null
  top_performer: TopPerformer | null
  indicator_breakdown: {
    attendance: IndicatorStat
    tasks: IndicatorStat
    care: IndicatorStat
    docs: IndicatorStat
    discipline: IndicatorStat
    assessment: IndicatorStat
  }
  staff: DepartmentStaffMember[]
}

export interface CreateDepartmentPayload {
  name_uz: string
  name_en?: string
  division?: number | null
}

export interface PaginatedDepartments {
  total_elements: number
  page_size: number
  from: number
  to: number
  next: string | null
  previous: string | null
  data: Department[]
}
