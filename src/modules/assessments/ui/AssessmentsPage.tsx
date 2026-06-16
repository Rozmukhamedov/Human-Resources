import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { assessments } from '@data/assessments'
import { StatusBadge } from '@shared/ui/StatusBadge/StatusBadge'
import { DataTable } from '@shared/ui/DataTable/DataTable'
import { CreateButton, SearchInput, ActionButton } from '@shared/ui/TableControls'
import type { Column } from '@shared/ui/DataTable/DataTable'
import type { Assessment } from '../model/assessment.types'

export function AssessmentsPage() {
  const { t } = useTranslation(['assessments', 'common'])
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const q = search.trim().toLowerCase()
  const filtered = q
    ? assessments.filter(
        a =>
          a.employeeName.toLowerCase().includes(q) ||
          a.departmentName.toLowerCase().includes(q) ||
          a.startedBy.toLowerCase().includes(q) ||
          a.reviewer.toLowerCase().includes(q),
      )
    : assessments

  const columns: Column<Assessment>[] = [
    {
      key: 'employee',
      header: t('employee'),
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
          {row.employeeName}
        </span>
      ),
    },
    {
      key: 'started',
      header: t('started'),
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)' }}>{row.startedDate}</span>
      ),
    },
    {
      key: 'startedBy',
      header: t('startedBy'),
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)' }}>{row.startedBy}</span>
      ),
    },
    {
      key: 'reviewers',
      header: t('reviewers'),
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)' }}>{row.reviewer}</span>
      ),
    },
    {
      key: 'totalScore',
      header: t('totalScore'),
      align: 'center',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 13.5 }}>
          {row.totalScore}
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
          {row.departmentName}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('status'),
      render: (row) => (
        <StatusBadge statusKey={row.status} label={t(`common:status.${row.status}`)} />
      ),
    },
    {
      key: 'validity',
      header: t('validity'),
      render: () => (
        <span style={{ color: 'var(--text-secondary)' }}>{t('period')}</span>
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
      <DataTable
        title={t('common:titles.assessments')}
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/assessments/${row.id}`)}
        paginated
        defaultPageSize={10}
        headerRight={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SearchInput
              value={search}
              onChange={setSearch}
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
