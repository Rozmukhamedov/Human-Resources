import { apiRequest } from '@core/api/client'
import type { Department, PaginatedDepartments } from '../model/department.types'

export function getDepartments(page = 1, pageSize = 10) {
  return apiRequest<PaginatedDepartments>(
    `/employees/departments/?page=${page}&page_size=${pageSize}`
  )
}

export function createDepartment(data: Omit<Department, 'id'>) {
  return apiRequest<Department>('/employees/departments/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateDepartment(id: number, data: Omit<Department, 'id'>) {
  return apiRequest<Department>(`/employees/departments/${id}/update/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteDepartment(id: number) {
  return apiRequest<void>(`/employees/departments/${id}/delete/`, {
    method: 'DELETE',
  })
}
