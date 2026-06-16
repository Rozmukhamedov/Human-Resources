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
