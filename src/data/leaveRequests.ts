import type { LeaveRequest } from '@modules/leave/model/leave.types'

export const leaveRequests: LeaveRequest[] = [
  { id: 'L001', reason: 'annual', description: '—', period: 'apr 01, 2026 [09:30] – apr 30, 2026', daysCount: '—', type: 'paid', approverName: 'Dilshod Rahmonov', status: 'rejected' },
  { id: 'L002', reason: 'annual', description: "Yillik mehnat ta'tili", period: 'apr 01, 2026 – apr 30, 2026', daysCount: '30', type: 'paid', approverName: 'Dilshod Rahmonov', status: 'approved' },
  { id: 'L003', reason: 'sick', description: "Vaqtinchalik mehnatga layoqatsizlik", period: 'mar 10, 2026 – mar 14, 2026', daysCount: '5', type: 'paid', approverName: 'Nodira Saidova', status: 'approved' },
  { id: 'L004', reason: 'annual', description: "Qo'shimcha ta'til kunlari", period: 'jun 01, 2026 – jun 07, 2026', daysCount: '7', type: 'unpaid', approverName: 'Dilshod Rahmonov', status: 'pending' },
]
