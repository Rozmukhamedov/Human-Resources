import { apiRequest } from '@core/api/client'
import type { PaginatedAttendance, AttendanceRecord, CreateAttendancePayload } from '../model/attendance.types'

interface GetAttendanceParams {
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export function getAttendance(params: GetAttendanceParams = {}) {
  const q = new URLSearchParams()
  if (params.search) q.set('search', params.search)
  if (params.ordering) q.set('ordering', params.ordering)
  if (params.page != null) q.set('page', String(params.page))
  if (params.page_size != null) q.set('page_size', String(params.page_size))
  const qs = q.toString()
  return apiRequest<PaginatedAttendance>(`/attendance/${qs ? `?${qs}` : ''}`)
}

export function createAttendance(data: CreateAttendancePayload) {
  return apiRequest<AttendanceRecord>('/attendance/', {
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
