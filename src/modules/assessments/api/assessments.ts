import { apiRequest } from '@core/api/client'
import type { AssessmentList, AssessmentPayload, PaginatedAssessments } from '../model/assessment.types'

interface GetAssessmentsParams {
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export function getAssessments(params: GetAssessmentsParams = {}) {
  const q = new URLSearchParams()
  if (params.search) q.set('search', params.search)
  if (params.ordering) q.set('ordering', params.ordering)
  if (params.page != null) q.set('page', String(params.page))
  if (params.page_size != null) q.set('page_size', String(params.page_size))
  const qs = q.toString()
  return apiRequest<PaginatedAssessments>(`/assessments/${qs ? `?${qs}` : ''}`)
}

export function getAssessmentDetail(id: number) {
  return apiRequest<AssessmentList>(`/assessments/${id}/`)
}

export function createAssessment(data: AssessmentPayload) {
  return apiRequest<AssessmentList>('/assessments/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateAssessment(id: number, data: Partial<AssessmentPayload>) {
  return apiRequest<AssessmentList>(`/assessments/${id}/update/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteAssessment(id: number) {
  return apiRequest<void>(`/assessments/${id}/delete/`, {
    method: 'DELETE',
  })
}
