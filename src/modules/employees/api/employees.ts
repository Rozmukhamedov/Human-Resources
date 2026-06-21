import { apiRequest } from '@core/api/client'
import { tokenStorage } from '@core/api/tokenStorage'
import type { ApiEmployee, CreateEmployeePayload, UpdateEmployeePayload, PaginatedEmployees, PaginatedPositions, ImportEmployeesResult } from '../model/employee.types'

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

export async function importEmployees(file: File): Promise<ImportEmployeesResult> {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL as string
  const access = tokenStorage.getAccess()
  const headers: Record<string, string> = {}
  if (access) headers['Authorization'] = `Bearer ${access}`

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${BASE_URL}/employees/import/`, {
    method: 'POST',
    headers,
    body: formData,
  })

  const text = await res.text()
  const data = text ? (JSON.parse(text) as ImportEmployeesResult) : {}

  if (!res.ok) {
    throw new Error(data.detail || data.message || text || `HTTP ${res.status}`)
  }
  return data
}

export async function exportEmployeeTemplate(): Promise<void> {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL as string
  const access = tokenStorage.getAccess()
  const headers: Record<string, string> = {}
  if (access) headers['Authorization'] = `Bearer ${access}`

  const res = await fetch(`${BASE_URL}/employees/export-template/`, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition')
  let filename = 'employees_template.xlsx'
  if (disposition) {
    const match = disposition.match(/filename[^;=\n]*=(['"]?)(.+?)\1(;|$)/)
    if (match?.[2]) filename = match[2]
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
