import { apiRequest } from '@core/api/client'
import type {
  AssessmentTemplate,
  AssessmentTemplatePayload,
  PaginatedAssessmentTemplates,
} from '../model/assessmentTemplate.types'

export function getAssessmentTemplates(page = 1, pageSize = 20) {
  return apiRequest<PaginatedAssessmentTemplates>(
    `/assessments/templates/?page=${page}&page_size=${pageSize}`
  )
}

export function createAssessmentTemplate(data: AssessmentTemplatePayload) {
  return apiRequest<AssessmentTemplate>('/assessments/templates/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateAssessmentTemplate(id: number, data: AssessmentTemplatePayload) {
  return apiRequest<AssessmentTemplate>(`/assessments/templates/${id}/update/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteAssessmentTemplate(id: number) {
  return apiRequest<void>(`/assessments/templates/${id}/delete/`, {
    method: 'DELETE',
  })
}
