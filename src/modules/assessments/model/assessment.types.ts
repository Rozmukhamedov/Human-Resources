export type AssessmentStatus = 'approved' | 'pending' | 'in_progress'

export interface Competency {
  title: string
  items: string[]
  score: number
}

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
