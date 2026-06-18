export type AssessmentStatus = 'approved' | 'pending' | 'in_progress' | 'rejected'

export interface Assessment {
  id: string
  employeeName: string
  startedDate: string
  startedBy: string
  reviewer: string
  totalScore: string
  departmentName: string
  status: AssessmentStatus
}

export interface Competency {
  title: string
  items: string[]
  score: number
}

export interface AssessmentList {
  id: number
  employee_name: string
  employee_code: string
  template_name: string
  department_name: string
  started_by_name: string
  reviewer_names: string[]
  started_date: string
  status: AssessmentStatus
  status_display: string
  total_score: string | null
  validity_from: string | null
  validity_to: string | null
}

export interface PaginatedAssessments {
  count: number
  next: string | null
  previous: string | null
  results: AssessmentList[]
}

export interface AssessmentPayload {
  employee: number
  template: number
  department: number
  started_by: number
  started_date: string
  validity_from?: string | null
  validity_to?: string | null
  status?: AssessmentStatus
  total_score?: string | null
  notes?: string
}
