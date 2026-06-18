export interface OrgNode {
  id: string
  initials: string
  name: string
  role: string
  avatarBg: string
  avatarColor: string
  children?: OrgNode[]
}

export interface OrgStructureDepartment {
  id: number
  name_uz: string
  name_en: string
  head_name: string | null
  head_initials: string | null
  employee_count: number
}

export interface OrgStructureDivision {
  id: number
  name_uz: string
  name_en: string
  color: string
  department_count: number
  departments: OrgStructureDepartment[]
}

export interface SupervisorNode {
  id: number
  code: string
  full_name: string
  initials: string
  position_uz: string
  position_en: string
  department_uz: string
  department_en: string
  children: SupervisorNode[]
}
