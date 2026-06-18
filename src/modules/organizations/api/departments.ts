import { apiRequest } from '@core/api/client'
import type { Department, DepartmentDetail, CreateDepartmentPayload, PaginatedDepartments } from '../model/department.types'

export function getDepartments(page = 1, pageSize = 10) {
  return apiRequest<PaginatedDepartments>(
    `/employees/departments/?page=${page}&page_size=${pageSize}`
  )
}

export function getDepartment(id: number) {
  return apiRequest<DepartmentDetail>(`/employees/departments/${id}/`)
}

export function createDepartment(data: CreateDepartmentPayload) {
  return apiRequest<Department>('/employees/departments/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateDepartment(id: number, data: CreateDepartmentPayload) {
  return apiRequest<Department>(`/employees/departments/${id}/update/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteDepartment(id: number) {
  return apiRequest<void>(`/employees/departments/${id}/delete/`, {
    method: 'DELETE',
  })
}
