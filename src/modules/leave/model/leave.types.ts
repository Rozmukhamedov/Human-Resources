export type LeaveReason = 'annual' | 'sick'
export type LeaveType = 'paid' | 'unpaid'
export type LeaveStatus = 'approved' | 'rejected' | 'pending' | 'pendingApproval'

export interface LeaveRequest {
  id: string
  reason: LeaveReason
  description: string
  period: string
  daysCount: string
  type: LeaveType
  approverName: string
  status: LeaveStatus
}
