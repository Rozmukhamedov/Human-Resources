export interface AssessmentTemplate {
  id: number
  name_uz: string
  name_en: string
  description: string
  competencies: unknown[]
  created_at: string
}

export interface AssessmentTemplatePayload {
  name_uz: string
  name_en: string
  description: string
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
