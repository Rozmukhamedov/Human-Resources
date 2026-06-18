import { apiRequest } from '@core/api/client'
import type { PaginatedAttendance, AttendanceRecord, CreateAttendancePayload, AttendanceCode } from '../model/attendance.types'

interface GetAttendanceParams {
  search?: string
  year?: number
  month?: number
  department?: number
  page?: number
  page_size?: number
}

const STATUS_TO_CODE: Record<string, AttendanceCode> = {
  present: 'p',
  late: 'l',
  absent: 'a',
  leave: 't',
}

export async function getAttendance(params: GetAttendanceParams = {}) {
  const q = new URLSearchParams()
  if (params.search) q.set('search', params.search)
  if (params.year != null) q.set('year', String(params.year))
  if (params.month != null) q.set('month', String(params.month))
  if (params.department != null) q.set('department', String(params.department))
  if (params.page != null) q.set('page', String(params.page))
  if (params.page_size != null) q.set('page_size', String(params.page_size))
  const qs = q.toString()
  const res = await apiRequest<any>(`/attendance/${qs ? `?${qs}` : ''}`)
  const mapped: PaginatedAttendance = {
    ...res,
    data: (res.data ?? []).map((emp: any) => ({
      ...emp,
      attendance: (emp.attendance ?? []).map((a: any) => ({
        day: new Date(a.date).getDate(),
        status: STATUS_TO_CODE[a.status] ?? a.status,
      })),
    })),
  }
  return mapped
}

export function createAttendance(data: CreateAttendancePayload) {
  return apiRequest<AttendanceRecord>('/attendance/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function bulkCreateAttendance(data: CreateAttendancePayload[]) {
  return apiRequest<AttendanceRecord[]>('/attendance/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateAttendance(id: number, data: Partial<CreateAttendancePayload>) {
  return apiRequest<AttendanceRecord>(`/attendance/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}
