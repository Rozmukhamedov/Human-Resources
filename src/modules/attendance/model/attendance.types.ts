export type AttendanceCode = 'p' | 'l' | 'a' | 't'

export interface AttendanceDayRecord {
  day: number
  status: AttendanceCode
}

export interface AttendanceEmployee {
  id: number
  code: string
  full_name: string
  department_name: string
  position_name: string
  attendance: AttendanceDayRecord[]
}

export interface PaginatedAttendance {
  next: string | null
  previous: string | null
  total_elements: number
  page_size: number
  from: number
  to: number
  data: AttendanceEmployee[]
}

export interface AttendanceRecord {
  id: number
  employee: number
  employee_name: string
  department_name: string
  date: string
  status: AttendanceCode
  status_display: string
  check_in: string | null
  check_out: string | null
  note: string
}

export interface CreateAttendancePayload {
  employee: number
  date: string
  status?: AttendanceCode
  check_in?: string | null
  check_out?: string | null
  note?: string
}
