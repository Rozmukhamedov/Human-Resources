import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { StatusBadge } from '@shared/ui/StatusBadge/StatusBadge'
import { DataTable } from '@shared/ui/DataTable/DataTable'
import { CreateButton, SearchInput, ActionButton } from '@shared/ui/TableControls'
import type { Column } from '@shared/ui/DataTable/DataTable'
import type { AssessmentList } from '../model/assessment.types'
import { getAssessments } from '../api/assessments'

const PAGE_SIZE = 10

export function AssessmentsPage() {
  const { t } = useTranslation(['assessments', 'common'])
  const navigate = useNavigate()

  const [rows, setRows] = useState<AssessmentList[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (p: number, s: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAssessments({ page: p, page_size: PAGE_SIZE, search: s || undefined })
      setRows(data.results)
      setCount(data.count)
    } catch (e) {
      setError((e as Error).message || 'Error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(page, search)
  }, [page, load])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setPage(1)
      void load(1, value)
    }, 400)
  }

  const columns: Column<AssessmentList>[] = [
    {
      key: 'employee',
      header: t('employee'),
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
          {row.employee_name}
        </span>
      ),
    },
    {
      key: 'template',
      header: t('template', 'Template'),
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)' }}>{row.template_name}</span>
      ),
    },
    {
      key: 'started',
      header: t('started'),
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)' }}>{row.started_date}</span>
      ),
    },
    {
      key: 'startedBy',
      header: t('startedBy'),
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)' }}>{row.started_by_name}</span>
      ),
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
      width: 200,
      render: (row) => (
        <span style={{
          color: 'var(--text-secondary)', display: 'block',
          maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {row.department_name}
        </span>
      ),
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
      render: (row) => (
        <StatusBadge statusKey={row.status} label={row.status_display} />
      ),
    },
    {
      key: 'action',
      header: t('action'),
      align: 'right',
      render: () => (
        <ActionButton
          label={t('common:actions.edit')}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ]

  return (
    <div style={{ padding: '18px 24px 40px' }}>
      {error && (
        <div style={{ marginBottom: 12, color: '#ef4444', fontSize: 13 }}>{error}</div>
      )}
      <DataTable
        title={t('common:titles.assessments')}
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/assessments/${row.id}`)}
        loading={loading}
        paginated
        serverSide
        totalCount={count}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        headerRight={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder={t('common:search')}
            />
            <CreateButton label={t('common:actions.create')} />
          </div>
        }
        emptyText={t('common:noResults')}
      />
    </div>
  )
}
