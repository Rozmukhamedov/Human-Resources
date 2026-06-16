import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { shiftSchedules } from '@data/shiftSchedules'
import { StatusBadge } from '@shared/ui/StatusBadge/StatusBadge'
import { DataTable } from '@shared/ui/DataTable/DataTable'
import { CreateButton, SearchInput, ActionButton } from '@shared/ui/TableControls'
import type { Column } from '@shared/ui/DataTable/DataTable'
import type { ShiftSchedule } from '../model/shift.types'

export function ShiftSchedulesPage() {
  const { t } = useTranslation(['shifts', 'common'])
  const [search, setSearch] = useState('')

  const q = search.trim().toLowerCase()
  const filtered = q
    ? shiftSchedules.filter(r =>
        r.departmentName.toLowerCase().includes(q) ||
        r.createdBy.toLowerCase().includes(q) ||
        r.month.toLowerCase().includes(q),
      )
    : shiftSchedules

  const columns: Column<ShiftSchedule>[] = [
    {
      key: 'order',
      header: t('order'),
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          {row.id}
        </span>
      ),
    },
    {
      key: 'dept',
      header: t('dept'),
      width: 340,
      render: (row) => (
        <span style={{
          fontWeight: 500, color: 'var(--text-primary)',
          display: 'block', maxWidth: 340,
          overflow: 'hidden', textOverflow: 'ellipsis',
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
      key: 'month',
      header: t('month'),
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)' }}>{row.month}</span>
      ),
    },
    {
      key: 'createdBy',
      header: t('createdBy'),
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)' }}>{row.createdBy}</span>
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
        title={t('common:titles.shifts')}
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.id}
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
