import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { leaveRequests } from '@data/leaveRequests'
import { StatusBadge } from '@shared/ui/StatusBadge/StatusBadge'
import { DataTable } from '@shared/ui/DataTable/DataTable'
import { CreateButton, SearchInput, ActionButton } from '@shared/ui/TableControls'
import type { Column } from '@shared/ui/DataTable/DataTable'
import type { LeaveRequest } from '@modules/leave/model/leave.types'

export function LeaveTab() {
  const { t } = useTranslation(['leave', 'common'])
  const [search, setSearch] = useState('')

  const q = search.trim().toLowerCase()
  const filtered = q
    ? leaveRequests.filter(r =>
        t(r.reason).toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.approverName.toLowerCase().includes(q),
      )
    : leaveRequests

  const columns: Column<LeaveRequest>[] = [
    {
      key: 'reason',
      header: t('reason'),
      render: (row) => <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{t(row.reason)}</span>,
    },
    {
      key: 'desc',
      header: t('desc'),
      width: 180,
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)', display: 'block', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.description}
        </span>
      ),
    },
    {
      key: 'period',
      header: t('period'),
      render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.period}</span>,
    },
    {
      key: 'days',
      header: t('days'),
      align: 'center',
      render: (row) => <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{row.daysCount}</span>,
    },
    {
      key: 'type',
      header: t('type'),
      render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{t(row.type)}</span>,
    },
    {
      key: 'approver',
      header: t('approver'),
      render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.approverName}</span>,
    },
    {
      key: 'status',
      header: t('status'),
      render: (row) => <StatusBadge statusKey={row.status} label={t(`common:status.${row.status}`)} />,
    },
    {
      key: 'action',
      header: t('action'),
      align: 'right',
      render: () => <ActionButton label={t('pdf')} onClick={(e) => e.stopPropagation()} />,
    },
  ]

  return (
    <DataTable
      title={t('common:titles.leave')}
      columns={columns}
      rows={filtered}
      rowKey={(r) => r.id}
      paginated
      defaultPageSize={5}
      headerRight={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SearchInput value={search} onChange={setSearch} placeholder={t('common:search')} width={180} />
          <CreateButton label={t('common:actions.create')} />
        </div>
      }
      emptyText={t('common:noResults')}
    />
  )
}
