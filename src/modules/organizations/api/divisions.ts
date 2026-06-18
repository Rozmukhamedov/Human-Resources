import { apiRequest } from '@core/api/client'
import type { Division, DivisionPayload, PaginatedDivisions } from '../model/division.types'

export function getDivisions(page = 1, pageSize = 12, search?: string) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
  if (search) params.set('search', search)
  return apiRequest<PaginatedDivisions>(`/employees/divisions/?${params.toString()}`)
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
