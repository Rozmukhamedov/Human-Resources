export type ShiftStatus = 'pending' | 'approved'

export interface ShiftScheduleList {
  id: number
  code: string
  department_name: string
  month: string
  status: ShiftStatus
  status_display: string
  created_by_name: string
}

export interface ShiftSchedule {
  id: number
  code: string
  department: number
  month: string
  status: ShiftStatus
  created_by: number
}

export interface CreateShiftPayload {
  code: string
  department: number
  month: string
  status?: ShiftStatus
  created_by: number
}

export interface PaginatedShifts {
  total_elements: number
  next: string | null
  previous: string | null
  data: ShiftScheduleList[]
}
