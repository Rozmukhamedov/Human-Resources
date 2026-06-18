export type EmployeeStatus = 'active' | 'leave' | 'probation'
export type Gender = 'Ayol' | 'Erkak'

export interface Employee {
  id: string
  code: string
  initials: string
  firstName: string
  lastName: string
  fullName: string
  departmentId: number | null
  departmentName: string
  positionId: number | null
  position: string
  supervisorId: number | null
  supervisorName: string
  status: EmployeeStatus
  statusDisplay: string
  gender: Gender
  genderRaw: ApiGender
  dateOfBirth: string
  hireDate: string
  email: string
  phone: string
}

export type ApiGender = 'male' | 'female'

export type UpdateEmployeePayload = Partial<CreateEmployeePayload>

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
  department: { id: number; name_uz: string; name_en: string; division: null; head_name: string; created_at: string } | null
  position: { id: number; name_uz: string; name_en: string } | null
  supervisor: { id: number; code: string; full_name: string; initials: string; position: { id: number; name_uz: string; name_en: string } | null } | null
  status: EmployeeStatus
  status_display: string
  gender: ApiGender
  date_of_birth: string | null
  hire_date: string | null
  phone: string
  email: string
  created_at?: string
  updated_at?: string
}

export interface PaginatedEmployees {
  next: string | null
  previous: string | null
  total_elements: number
  page_size: number
  from: number
  to: number
  data: ApiEmployee[]
}

export interface Position {
  id: number
  name_uz: string
  name_en: string
}

export interface PaginatedPositions {
  next: string | null
  previous: string | null
  total_elements: number
  data: Position[]
}
