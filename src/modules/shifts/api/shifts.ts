import { apiRequest } from '@core/api/client'
import type { ShiftSchedule, ShiftScheduleList, CreateShiftPayload, PaginatedShifts } from '../model/shift.types'

export interface GetShiftsParams {
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export function getShifts(params: GetShiftsParams = {}) {
  const q = new URLSearchParams()
  if (params.search) q.set('search', params.search)
  if (params.ordering) q.set('ordering', params.ordering)
  if (params.page != null) q.set('page', String(params.page))
  if (params.page_size != null) q.set('page_size', String(params.page_size))
  const qs = q.toString()
  return apiRequest<PaginatedShifts>(`/shifts/${qs ? `?${qs}` : ''}`)
}

export function createShift(data: CreateShiftPayload) {
  return apiRequest<ShiftSchedule>('/shifts/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateShift(id: number, data: Partial<CreateShiftPayload>) {
  return apiRequest<ShiftSchedule>(`/shifts/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteShift(id: number) {
  return apiRequest<void>(`/shifts/${id}/`, {
    method: 'DELETE',
  })
}

export type { ShiftScheduleList }
