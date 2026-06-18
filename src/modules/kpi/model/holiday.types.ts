export interface Holiday {
  id: number
  date: string
  name: string
}

export interface HolidayPayload {
  date: string
  name: string
}

export interface HolidaysResponse {
  total_elements: number
  next: string | null
  previous: string | null
  data: Holiday[]
}
