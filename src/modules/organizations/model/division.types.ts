export interface Division {
  id: number
  name: string
}

export interface CreateDivisionPayload {
  name: string
}

export interface PaginatedDivisions {
  total_elements: number
  page_size: number
  from: number
  to: number
  next: string | null
  previous: string | null
  data: Division[]
}
