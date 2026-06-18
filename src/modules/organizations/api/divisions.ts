import { apiRequest } from '@core/api/client'
import type { Division, DivisionPayload, PaginatedDivisions } from '../model/division.types'

export function getDivisions(page = 1, pageSize = 12) {
  return apiRequest<PaginatedDivisions>(
    `/employees/divisions/?page=${page}&page_size=${pageSize}`
  )
}

export function createDivision(data: DivisionPayload) {
  return apiRequest<Division>('/employees/divisions/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateDivision(id: number, data: DivisionPayload) {
  return apiRequest<Division>(`/employees/divisions/${id}/update/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteDivision(id: number) {
  return apiRequest<void>(`/employees/divisions/${id}/delete/`, {
    method: 'DELETE',
  })
}
