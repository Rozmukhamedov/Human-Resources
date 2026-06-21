import { apiRequest } from '@core/api/client'
import type {
  AssessmentTemplate,
  AssessmentTemplatePayload,
  PaginatedAssessmentTemplates,
} from '../model/assessmentTemplate.types'

export function getAssessmentTemplates(page = 1, pageSize = 20) {
  return apiRequest<PaginatedAssessmentTemplates>(
    `/kpi/indicators/?page=${page}&page_size=${pageSize}`
  )
}

export function createAssessmentTemplate(data: AssessmentTemplatePayload) {
  return apiRequest<AssessmentTemplate>('/kpi/indicators/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateAssessmentTemplate(id: number, data: AssessmentTemplatePayload) {
  return apiRequest<AssessmentTemplate>(`/kpi/indicators/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteAssessmentTemplate(id: number) {
  return apiRequest<void>(`/kpi/indicators/${id}/`, {
    method: 'DELETE',
  })
}
