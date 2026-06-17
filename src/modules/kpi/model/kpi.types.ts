export type KpiGrade = 'excellent' | 'good' | 'fair' | 'low'

export interface KpiScores {
  attendance: number
  tasks: number
  care: number
  docs: number
  discipline: number
  assessment: number
}

export interface KpiWeights {
  attendance: number
  tasks: number
  care: number
  docs: number
  discipline: number
  assessment: number
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
