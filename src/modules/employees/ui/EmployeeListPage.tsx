import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { employees } from '@data/employees'
import { departments } from '@data/departments'
import { useEmployeeFilterStore } from '@modules/employees/model/employeeFilterStore'
import { useUIStore } from '@core/store/uiStore'
import { EmployeeAvatar } from '@shared/ui/EmployeeAvatar/EmployeeAvatar'
import { StatusBadge } from '@shared/ui/StatusBadge/StatusBadge'
import { EmptyState } from '@shared/ui/EmptyState/EmptyState'
import { CreateButton, SearchInput } from '@shared/ui/TableControls'

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50]
const COLS = '42px 56px 1.1fr 1.1fr 1.6fr 1.5fr 1.4fr 1fr'

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

export function EmployeeListPage() {
  const { t } = useTranslation(['employees', 'common'])
  const navigate = useNavigate()
  const { setSelectedEmployee } = useUIStore()
  const {
    query, filterDept, sortKey, sortDir, sel, allSel, page,
    setQuery, setFilterDept, toggleSort, toggleSel, toggleAllSel, setPage,
  } = useEmployeeFilterStore()

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(15)

  const filtered = useMemo(() => {
    let list = [...employees]
    if (filterDept !== 'all') list = list.filter(e => e.departmentName === filterDept)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(e =>
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.departmentName.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q),
      )
    }
    list.sort((a, b) => {
      const av = String((a as Record<string, unknown>)[sortKey] ?? '')
      const bv = String((b as Record<string, unknown>)[sortKey] ?? '')
      return av.localeCompare(bv) * sortDir
    })
    return list
  }, [query, filterDept, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageData = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
  const from = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, filtered.length)

  const handlePageSize = (n: number) => { setPageSize(n); setPage(1) }

  const checkboxStyle = (checked: boolean): React.CSSProperties => ({
    width: 18, height: 18, borderRadius: 5,
    border: `2px solid ${checked ? 'var(--accent)' : 'var(--border-color)'}`,
    background: checked ? 'var(--accent)' : 'var(--surface)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
    transition: 'background .12s, border-color .12s',
  })

  const SortHeader = ({ field, label }: { field: string; label: string }) => {
    const active = sortKey === field
    return (
      <div
        onClick={() => toggleSort(field)}
        style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '.05em',
          textTransform: 'uppercase', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4, userSelect: 'none',
          color: active ? 'var(--accent)' : 'var(--text-muted)',
        }}
      >
        {label}
        <span style={{ fontSize: 9, opacity: active ? 1 : 0, transition: 'opacity .1s' }}>
          {sortDir === 1 ? '▲' : '▼'}
        </span>
      </div>
    )
  }

  return (
    <div style={{ padding: '18px 24px 40px' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 16, overflow: 'hidden',
      }}>

        {/* ── Header: title + search + dept filter + create ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '13px 20px', borderBottom: '1px solid var(--border-color)',
        }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 16,
            color: 'var(--text-heading)', letterSpacing: '-.01em', marginRight: 6, flexShrink: 0,
          }}>
            {t('common:titles.employees')}
          </span>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t('common:search')}
            width={200}
          />
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            style={{
              height: 36, border: '1.5px solid var(--border-color)',
              borderRadius: 10, background: 'var(--bg-subtle)',
              padding: '0 12px', fontSize: 13,
              color: 'var(--text-secondary)',
              cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="all">{t('common:allDepts')}</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div style={{ flex: 1 }} />
          <CreateButton label={t('common:actions.create')} />
        </div>

        {/* ── Column headers ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: COLS,
          alignItems: 'center', padding: '0 18px', height: 44,
          background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)',
        }}>
          <div onClick={() => toggleAllSel(employees.map(e => e.id))} style={checkboxStyle(allSel)}>
            {allSel && <Checkmark />}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
            {t('action')}
          </div>
          <SortHeader field="firstName"      label={t('name')} />
          <SortHeader field="lastName"       label={t('surname')} />
          <SortHeader field="departmentName" label={t('dept')} />
          <SortHeader field="position"       label={t('pos')} />
          <SortHeader field="supervisorName" label={t('sup')} />
          <SortHeader field="status"         label={t('status')} />
        </div>

        {/* ── Rows ── */}
        {pageData.length === 0 ? (
          <EmptyState message={t('common:noResults')} />
        ) : pageData.map(e => {
          const hovered = hoveredId === e.id
          return (
            <div
              key={e.id}
              onClick={() => { setSelectedEmployee(e.id); navigate(`/employees/${e.id}`) }}
              onMouseEnter={() => setHoveredId(e.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: 'grid', gridTemplateColumns: COLS,
                alignItems: 'center', padding: '0 18px', height: 52,
                borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer',
                background: hovered ? 'var(--bg-subtle)' : 'transparent',
                transition: 'background .1s',
              }}
            >
              <div onClick={ev => { ev.stopPropagation(); toggleSel(e.id) }} style={checkboxStyle(!!sel[e.id])}>
                {sel[e.id] && <Checkmark />}
              </div>
              <EmployeeAvatar initials={e.initials} size={34} />
              <Cell bold>{e.firstName}</Cell>
              <Cell>{e.lastName}</Cell>
              <Cell>{e.departmentName}</Cell>
              <Cell>{e.position}</Cell>
              <Cell>{e.supervisorName}</Cell>
              <div><StatusBadge statusKey={e.status} label={t(`common:status.${e.status}`)} /></div>
            </div>
          )
        })}

        {/* ── Pagination footer ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 18px', borderTop: '1px solid var(--border-color)',
          gap: 12, flexWrap: 'wrap',
        }}>
          {/* Left: page size + count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                Rows per page:
              </span>
              <select
                value={pageSize}
                onChange={e => handlePageSize(Number(e.target.value))}
                style={{
                  fontSize: 12, fontWeight: 600,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-subtle)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 7, padding: '4px 8px',
                  cursor: 'pointer', outline: 'none',
                }}
              >
                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {from}–{to} of {filtered.length}
            </span>
          </div>

          {/* Right: page buttons */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <PageBtn disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </PageBtn>
              {getPageNumbers(safePage, totalPages).map((n, i) =>
                n === '...'
                  ? <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 13 }}>…</span>
                  : <PageBtn key={n} active={n === safePage} onClick={() => setPage(n as number)}>{n}</PageBtn>
              )}
              <PageBtn disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </PageBtn>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

/* ── Small helpers ── */

function Checkmark() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function Cell({ children, bold }: { children: React.ReactNode; bold?: boolean }) {
  return (
    <div style={{
      fontSize: 13.5, fontWeight: bold ? 600 : 400,
      color: bold ? 'var(--text-heading)' : 'var(--text-secondary)',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8,
    }}>
      {children}
    </div>
  )
}

function PageBtn({
  children, active, disabled, onClick,
}: {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: 32, height: 32, padding: '0 8px', borderRadius: 8,
        border: active ? '1.5px solid var(--accent)' : '1.5px solid var(--border-color)',
        background: active ? 'var(--accent)' : hovered && !disabled ? 'var(--bg-subtle)' : 'transparent',
        color: active ? '#fff' : disabled ? 'var(--text-muted)' : 'var(--text-primary)',
        fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background .1s, border-color .1s',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </button>
  )
}
