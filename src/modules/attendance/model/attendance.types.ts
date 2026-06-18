export type AttendanceCode = 'p' | 'l' | 'a' | 't'

export interface AttendanceCell {
  day: number
  code: AttendanceCode
}

export interface AttendanceRow {
  employeeId: string
  employeeName: string
  initials: string
  departmentName: string
  cells: AttendanceCell[]
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

export interface PaginatedAttendance {
  count: number
  next: string | null
  previous: string | null
  results: AttendanceRecord[]
}

export interface CreateAttendancePayload {
  employee: number
  date: string
  status?: AttendanceCode
  check_in?: string | null
  check_out?: string | null
  note?: string
}
