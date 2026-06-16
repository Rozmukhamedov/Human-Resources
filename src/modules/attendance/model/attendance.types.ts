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
