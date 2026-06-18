import { apiRequest } from '@core/api/client'
import type { ApiEmployee, CreateEmployeePayload, UpdateEmployeePayload, PaginatedEmployees, PaginatedPositions } from '../model/employee.types'

interface GetEmployeesParams {
  search?: string
  page?: number
  page_size?: number
}

export function getEmployees(params: GetEmployeesParams = {}) {
  const q = new URLSearchParams()
  if (params.search) q.set('search', params.search)
  if (params.page != null) q.set('page', String(params.page))
  if (params.page_size != null) q.set('page_size', String(params.page_size))
  const qs = q.toString()
  return apiRequest<PaginatedEmployees>(`/employees/${qs ? `?${qs}` : ''}`)
}

export function createEmployee(data: CreateEmployeePayload) {
  return apiRequest<ApiEmployee>('/employees/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateEmployee(id: number, data: UpdateEmployeePayload) {
  return apiRequest<ApiEmployee>(`/employees/${id}/update/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteEmployee(id: number) {
  return apiRequest<void>(`/employees/${id}/delete/`, {
    method: 'DELETE',
  })
}

export function getEmployee(id: number | string) {
  return apiRequest<ApiEmployee>(`/employees/${id}/`)
}

export function getPositions(page = 1, pageSize = 100) {
  return apiRequest<PaginatedPositions>(
    `/employees/positions/?page=${page}&page_size=${pageSize}`
  )
}
