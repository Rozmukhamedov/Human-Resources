import { apiRequest } from '@core/api/client'
import type { ApiLeaveRequest, CreateLeavePayload, PaginatedLeaves } from '../model/leave.types'

export interface GetLeavesParams {
  search?: string
  ordering?: string
  page?: number
  page_size?: number
  employee?: number
}

export function getLeaves(params: GetLeavesParams = {}) {
  const q = new URLSearchParams()
  if (params.search) q.set('search', params.search)
  if (params.ordering) q.set('ordering', params.ordering)
  if (params.page != null) q.set('page', String(params.page))
  if (params.page_size != null) q.set('page_size', String(params.page_size))
  if (params.employee != null) q.set('employee', String(params.employee))
  const qs = q.toString()
  return apiRequest<PaginatedLeaves>(`/leave/${qs ? `?${qs}` : ''}`)
}

export function createLeave(data: CreateLeavePayload) {
  return apiRequest<ApiLeaveRequest>('/leave/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateLeave(id: number, data: Partial<CreateLeavePayload>) {
  return apiRequest<ApiLeaveRequest>(`/leave/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteLeave(id: number) {
  return apiRequest<void>(`/leave/${id}/`, {
    method: 'DELETE',
  })
}
