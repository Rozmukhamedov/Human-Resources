export interface AssessmentTemplate {
  id: number
  name: string
  weight: number
  order: number
}

export interface AssessmentTemplatePayload {
  name: string
  weight: number
  order: number
}

export interface PaginatedAssessmentTemplates {
  next: string | null
  previous: string | null
  total_elements: number
  page_size: number
  from: number
  to: number
  data: AssessmentTemplate[]
}
