export type AssessmentStatus = 'draft' | 'pending' | 'approved' | 'rejected'

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

export interface AssessmentPersonRef {
  id: number
  code: string
  first_name: string
  last_name: string
}

export interface AssessmentDepartmentRef {
  id: number
  name: string
}

export interface AssessmentIndicatorRef {
  id: number
  name: string
  weight: number
}

export interface AssessmentList {
  id: number
  employee: AssessmentPersonRef
  department: AssessmentDepartmentRef | null
  indicator: AssessmentIndicatorRef
  reviewed_by: AssessmentPersonRef | null
  year: number
  month: number
  score: string
  status: AssessmentStatus
  notes: string
  created_at: string
}

export interface PaginatedAssessments {
  total_elements: number
  page_size: number
  from: number
  to: number
  next: string | null
  previous: string | null
  data: AssessmentList[]
}

export interface AssessmentPayload {
  employee: number
  department?: number | null
  indicator: number
  reviewed_by?: number | null
  year: number
  month: number
  score: string
  status?: AssessmentStatus
  notes?: string
}
