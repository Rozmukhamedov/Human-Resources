export interface Department {
  id: number
  name: string
  head: string
  count: number
}

export interface PaginatedDepartments {
  count: number
  next: string | null
  previous: string | null
  results: Department[]
}
