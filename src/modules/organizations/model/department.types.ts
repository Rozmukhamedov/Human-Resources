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
