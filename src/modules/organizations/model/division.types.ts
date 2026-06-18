export interface Division {
  id: number
  name_uz: string
  name_en: string
  color: string
  order: number
}

export interface DivisionPayload {
  name_uz: string
  name_en?: string
  color?: string
  order?: number
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
