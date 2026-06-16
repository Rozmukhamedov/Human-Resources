import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { assessments } from '@data/assessments'
import { employees } from '@data/employees'
import { StatusBadge } from '@shared/ui/StatusBadge/StatusBadge'
import { DataTable } from '@shared/ui/DataTable/DataTable'
import { CreateButton, SearchInput, ActionButton } from '@shared/ui/TableControls'
import type { Column } from '@shared/ui/DataTable/DataTable'
import type { Assessment } from '@modules/assessments/model/assessment.types'

export function AssessmentsTab() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation(['assessments', 'common'])
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const emp = employees.find(e => e.id === id) ?? employees[0]
  const fullName = `${emp.firstName} ${emp.lastName}`

  const empAssessments = assessments.filter(a => a.employeeName === fullName)

  const q = search.trim().toLowerCase()
  const filtered = q
    ? empAssessments.filter(a =>
        a.startedBy.toLowerCase().includes(q) ||
        a.reviewer.toLowerCase().includes(q) ||
        a.departmentName.toLowerCase().includes(q),
      )
    : empAssessments

  const columns: Column<Assessment>[] = [
    {
      key: 'started',
      header: t('started'),
      render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.startedDate}</span>,
    },
    {
      key: 'startedBy',
      header: t('startedBy'),
      render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.startedBy}</span>,
    },
    {
      key: 'reviewers',
      header: t('reviewers'),
      render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.reviewer}</span>,
    },
    {
      key: 'totalScore',
      header: t('totalScore'),
      align: 'center',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 13.5 }}>{row.totalScore}</span>
      ),
    },
    {
      key: 'status',
      header: t('status'),
      render: (row) => <StatusBadge statusKey={row.status} label={t(`common:status.${row.status}`)} />,
    },
    {
      key: 'validity',
      header: t('validity'),
      render: () => <span style={{ color: 'var(--text-secondary)' }}>{t('period')}</span>,
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
      title={t('common:titles.assessments')}
      columns={columns}
      rows={filtered}
      rowKey={(r) => r.id}
      onRowClick={(r) => navigate(`/assessments/${r.id}`)}
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
