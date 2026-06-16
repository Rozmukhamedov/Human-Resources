export type StatusKey = 'active' | 'leave' | 'probation' | 'approved' | 'rejected' | 'pending' | 'pendingApproval' | 'submitted' | 'notCreated' | 'in_progress'

const STATUS_COLORS: Record<StatusKey, { color: string; bg: string }> = {
  active:         { color: '#0f9d58', bg: '#e7f7ee' },
  approved:       { color: '#0f9d58', bg: '#e7f7ee' },
  leave:          { color: '#d97706', bg: '#fdf3e3' },
  pending:        { color: '#d97706', bg: '#fdf3e3' },
  pendingApproval:{ color: '#d97706', bg: '#fdf3e3' },
  submitted:      { color: '#d97706', bg: '#fdf3e3' },
  rejected:       { color: '#dc2626', bg: '#fdeaea' },
  probation:      { color: '#5b6270', bg: '#eef0f3' },
  notCreated:     { color: '#5b6270', bg: '#eef0f3' },
  in_progress:    { color: '#2563eb', bg: '#eef4ff' },
}

export function getStatusColors(key: string): { color: string; bg: string } {
  return STATUS_COLORS[key as StatusKey] ?? { color: '#5b6270', bg: '#eef0f3' }
}
