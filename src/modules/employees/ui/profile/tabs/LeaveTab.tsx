import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getLeaves } from '@modules/leave/api/leave'
import { StatusBadge } from '@shared/ui/StatusBadge/StatusBadge'
import { DataTable } from '@shared/ui/DataTable/DataTable'
import { ActionButton } from '@shared/ui/TableControls'
import type { Column } from '@shared/ui/DataTable/DataTable'
import type { ApiLeaveRequest } from '@modules/leave/model/leave.types'

function formatPeriod(from: string, to: string): string {
  if (!from && !to) return '—'
  const fmt = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    } catch {
      return d
    }
  }
  return `${fmt(from)} – ${fmt(to)}`
}

export function LeaveTab() {
  const { t } = useTranslation(['leave', 'common'])
  const { id } = useParams<{ id: string }>()
  const [leaves, setLeaves] = useState<ApiLeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 5

  const load = useCallback(async (p: number) => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getLeaves({
        employee: Number(id),
        page: p,
        page_size: pageSize,
      })
      setLeaves(data.data ?? [])
      setTotal(data.total_elements ?? 0)
    } catch {
      setLeaves([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load(page)
  }, [page, load])

  const columns: Column<ApiLeaveRequest>[] = [
    {
      key: 'reason',
      header: t('reason'),
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
          {row.reason_display ?? t(row.reason)}
        </span>
      ),
    },
    {
      key: 'desc',
      header: t('desc'),
      width: 180,
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)', display: 'block', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.description || '—'}
        </span>
      ),
    },
    {
      key: 'period',
      header: t('period'),
      render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{formatPeriod(row.period_from, row.period_to)}</span>,
    },
    {
      key: 'days',
      header: t('days'),
      align: 'center',
      render: (row) => <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{row.days ?? '—'}</span>,
    },
    {
      key: 'type',
      header: t('type'),
      render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.leave_type_display ?? t(row.leave_type)}</span>,
    },
    {
      key: 'approver',
      header: t('approver'),
      render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.approver_name || '—'}</span>,
    },
    {
      key: 'status',
      header: t('status'),
      render: (row) => <StatusBadge statusKey={row.status} label={row.status_display ?? t(`common:status.${row.status}`)} />,
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
      rows={leaves}
      rowKey={(r) => r.id}
      loading={loading}
      paginated
      serverSide
      pageSize={pageSize}
      totalCount={total}
      page={page}
      onPageChange={setPage}
      emptyText={t('common:noResults')}
    />
  )
}
