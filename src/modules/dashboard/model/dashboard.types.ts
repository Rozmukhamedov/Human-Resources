export interface DashboardStatCards {
  total_departments: number
  filled_departments: number
  not_filled_departments: number
  avg_kpi_score: number
  total_employees: number
}

export interface DashboardScheduleOverview {
  approved: number
  submitted: number
  not_created: number
  total: number
}

export interface DashboardDepartment {
  id: number
  name_uz: string
  name_en: string
  employee_count: number
}

export interface DashboardBirthday {
  id: number
  full_name: string
  initials: string
  department: string
  day: number
  month: string
}

export interface DashboardData {
  stat_cards: DashboardStatCards
  schedule_overview: DashboardScheduleOverview
  not_filled_departments: DashboardDepartment[]
  employees_by_department: DashboardDepartment[]
  upcoming_birthdays: DashboardBirthday[]
}
