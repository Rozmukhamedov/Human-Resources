export type ShiftStatus = 'approved' | 'pending' | 'submitted'

export interface ShiftSchedule {
  id: string
  departmentName: string
  status: ShiftStatus
  month: string
  createdBy: string
}
