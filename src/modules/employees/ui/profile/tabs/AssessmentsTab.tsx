import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { StatusBadge } from '@shared/ui/StatusBadge/StatusBadge'
import { DataTable } from '@shared/ui/DataTable/DataTable'
import { ActionButton } from '@shared/ui/TableControls'
import type { Column } from '@shared/ui/DataTable/DataTable'
import type { AssessmentList } from '@modules/assessments/model/assessment.types'
import { getAssessments } from '@modules/assessments/api/assessments'

const PAGE_SIZE = 5

export function AssessmentsTab() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation(['assessments', 'common'])
  const navigate = useNavigate()

  const [rows, setRows] = useState<AssessmentList[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const employeeId = id ? Number(id) : undefined

  const load = useCallback(async (p: number) => {
    if (!employeeId) return
    setLoading(true)
    try {
      const data = await getAssessments({
        page: p,
        page_size: PAGE_SIZE,
        employee: employeeId,
      })
      setRows(data.data)
      setCount(data.total_elements)
    } catch {
      setRows([])
      setCount(0)
    } finally {
      setLoading(false)
    }
  }, [employeeId])

  useEffect(() => {
    void load(page)
  }, [page, load])

  const columns: Column<AssessmentList>[] = [
    {
      key: 'template',
      header: t('template', 'Template'),
      render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.template_name}</span>,
    },
    {
      key: 'started',
      header: t('started'),
      render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.started_date}</span>,
    },
    {
      key: 'startedBy',
      header: t('startedBy'),
      render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.started_by_name}</span>,
    },
    {
      key: 'reviewers',
      header: t('reviewers'),
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)' }}>
          {row.reviewer_names.join(', ') || '—'}
        </span>
      ),
    },
    {
      key: 'totalScore',
      header: t('totalScore'),
      align: 'center',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 13.5 }}>
          {row.total_score ?? '—'}
        </span>
      ),
    },
    {
      key: 'dept',
      header: t('dept'),
      render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.department_name}</span>,
    },
    {
      key: 'validity',
      header: t('validity'),
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)' }}>
          {row.validity_from && row.validity_to
            ? `${row.validity_from} – ${row.validity_to}`
            : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('status'),
      render: (row) => <StatusBadge statusKey={row.status} label={row.status_display} />,
    },
    {
      key: 'action',
      header: t('action'),
      align: 'right',
      render: () => <ActionButton label={t('common:actions.edit')} onClick={(e) => e.stopPropagation()} />,
    },
  ]

  return (
    <DataTable
      title="Oddiy attestatsiyalar"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      onRowClick={(r) => navigate(`/assessments/${r.id}`)}
      loading={loading}
      paginated
      serverSide
      totalCount={count}
      page={page}
      pageSize={PAGE_SIZE}
      onPageChange={setPage}
      emptyText={t('common:noResults')}
    />
  )
}
