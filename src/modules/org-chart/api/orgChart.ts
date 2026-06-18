import { apiRequest } from '@core/api/client'
import type { OrgStructureDivision, SupervisorNode } from '@modules/org-chart/model/org.types'

export function getOrgStructure() {
  return apiRequest<OrgStructureDivision[]>('/employees/org-structure/')
}

export function getSupervisorTree() {
  return apiRequest<SupervisorNode[]>('/employees/supervisor-tree/')
}
