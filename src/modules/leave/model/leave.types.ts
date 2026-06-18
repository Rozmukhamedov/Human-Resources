export type LeaveReason = 'annual' | 'sick' | 'other'
export type LeaveType = 'paid' | 'unpaid'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export interface ApiLeaveRequest {
  id: number
  employee: number
  employee_name?: string
  reason: string
  reason_display?: string
  description: string
  period_from: string
  period_to: string
  days: number | null
  leave_type: string
  leave_type_display?: string
  approver: number | null
  approver_name?: string
  status: string
  status_display?: string
}

export interface CreateLeavePayload {
  employee: number
  reason: string
  description?: string
  period_from: string
  period_to: string
  days?: number | null
  leave_type?: string
  approver?: number | null
  status?: string
}

export interface PaginatedLeaves {
  next: string | null
  previous: string | null
  total_elements: number
  page_size: number
  from: number
  to: number
  data: ApiLeaveRequest[]
}
