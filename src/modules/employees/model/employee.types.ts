export type EmployeeStatus = 'active' | 'leave' | 'probation'
export type Gender = 'Ayol' | 'Erkak'

export interface Employee {
  id: string
  initials: string
  firstName: string
  lastName: string
  departmentName: string
  position: string
  supervisorName: string
  status: EmployeeStatus
  gender: Gender
  dateOfBirth: string
  hireDate: string
  email: string
  phone: string
}

export type ApiGender = 'male' | 'female'

export interface CreateEmployeePayload {
  first_name: string
  last_name: string
  department: number
  position: number
  supervisor?: number | null
  status?: EmployeeStatus
  gender: ApiGender
  date_of_birth?: string | null
  hire_date?: string | null
  phone?: string
  email?: string
  is_head?: boolean
}

export interface ApiEmployee {
  id: number
  code: string
  first_name: string
  last_name: string
  full_name: string
  initials: string
  department: { id: number; name_uz: string; name_en: string } | null
  position: { id: number; name: string } | null
  supervisor_name: string | null
  status: EmployeeStatus
  status_display: string
  gender: ApiGender
}

export interface PaginatedEmployees {
  count: number
  next: string | null
  previous: string | null
  results: ApiEmployee[]
}

export interface Position {
  id: number
  name: string
}

export interface PaginatedPositions {
  count: number
  next: string | null
  previous: string | null
  results: Position[]
}
