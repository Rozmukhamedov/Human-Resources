import { apiRequest } from '@core/api/client'
import type { Division, CreateDivisionPayload, PaginatedDivisions } from '../model/division.types'

export function getDivisions(page = 1, pageSize = 12) {
  return apiRequest<PaginatedDivisions>(
    `/division/?page=${page}&page_size=${pageSize}`
  )
}

export function createDivision(data: CreateDivisionPayload) {
  return apiRequest<Division>('/division/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateDivision(id: number, data: CreateDivisionPayload) {
  return apiRequest<Division>(`/division/${id}/update/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteDivision(id: number) {
  return apiRequest<void>(`/division/${id}/delete/`, {
    method: 'DELETE',
  })
}
