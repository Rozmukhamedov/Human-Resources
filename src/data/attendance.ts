import type { AttendanceRow } from '@modules/attendance/model/attendance.types'
import { employees } from './employees'

const CODES = ['p', 'l', 'a', 't', 'p', 'p', 'l', 'p', 'a', 'p', 'p', 't', 'p', 'p'] as const
const DAYS = Array.from({ length: 14 }, (_, i) => i + 1)

export const attendanceRows: AttendanceRow[] = employees.slice(0, 8).map((emp, ri) => ({
  employeeId: emp.id,
  employeeName: `${emp.firstName} ${emp.lastName}`,
  initials: emp.initials,
  departmentName: emp.departmentName,
  cells: DAYS.map((day, di) => ({
    day,
    code: CODES[(di + ri) % CODES.length],
  })),
}))
