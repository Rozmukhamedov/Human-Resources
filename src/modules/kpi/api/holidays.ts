import { apiRequest } from '@core/api/client'
import type { Holiday, HolidayPayload, HolidaysResponse } from '../model/holiday.types'

export function getHolidays(page = 1, pageSize = 12, year?: number, month?: number) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
  if (year) params.set('year', String(year))
  if (month) params.set('month', String(month))
  return apiRequest<HolidaysResponse>(`/kpi/holidays/?${params.toString()}`)
}

export function createHoliday(data: HolidayPayload) {
  return apiRequest<Holiday>('/kpi/holidays/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateHoliday(id: number, data: HolidayPayload) {
  return apiRequest<Holiday>(`/kpi/holidays/${id}/update/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteHoliday(id: number) {
  return apiRequest<void>(`/kpi/holidays/${id}/delete/`, {
    method: 'DELETE',
  })
}
