import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { EmployeeAvatar } from '@shared/ui/EmployeeAvatar/EmployeeAvatar'
import { SearchInput } from '@shared/ui/TableControls'
import type { AttendanceCode, AttendanceRecord } from '../model/attendance.types'
import { getAttendance } from '../api/attendance'

const CODE_META: Record<AttendanceCode, { color: string; bg: string; label: string }> = {
  p: { color: '#0f9d58', bg: '#e7f7ee', label: 'present' },
  l: { color: '#d97706', bg: '#fdf3e3', label: 'late' },
  a: { color: '#dc2626', bg: '#fdeaea', label: 'absent' },
  t: { color: '#4f46e5', bg: '#eef2ff', label: 'leaveDay' },
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2)
}

interface GridRow {
  employeeId: string
  employeeName: string
  initials: string
  departmentName: string
  cells: (AttendanceCode | null)[]
}

function StatCard({ count, label, color, bg }: { count: number; label: string; color: string; bg: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 20px', borderRight: '1px solid var(--border-color)',
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color }}>{count}</span>
      </div>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
    </div>
  )
}

function ExportButton() {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 36, padding: '0 14px', borderRadius: 10,
        background: hovered ? 'var(--bg-subtle)' : 'transparent',
        border: '1.5px solid var(--border-color)',
        color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
        cursor: 'pointer', transition: 'background .12s, color .12s',
        flexShrink: 0,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Export
    </button>
  )
}

export function AttendanceReportPage() {
  const { t } = useTranslation(['attendance', 'common'])
  const [search, setSearch] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAttendance({ search: search || undefined, page_size: 500 })
      const raw = data as unknown
      console.log('[Attendance] API response:', raw)
      const list = Array.isArray(raw)
        ? (raw as AttendanceRecord[])
        : Array.isArray((raw as { results?: AttendanceRecord[] }).results)
          ? (raw as { results: AttendanceRecord[] }).results
          : []
      setRecords(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchData() }, [fetchData])

  const [year, month] = selectedMonth.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const employeeMap = new Map<number, GridRow>()
  ;(records ?? [])
    .filter(r => {
      const d = new Date(r.date)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
    .forEach(record => {
      const day = new Date(record.date).getDate()
      if (!employeeMap.has(record.employee)) {
        employeeMap.set(record.employee, {
          employeeId: String(record.employee),
          employeeName: record.employee_name,
          initials: getInitials(record.employee_name),
          departmentName: record.department_name,
          cells: Array(daysInMonth).fill(null),
        })
      }
      const row = employeeMap.get(record.employee)!
      if (day >= 1 && day <= daysInMonth) {
        row.cells[day - 1] = record.status
      }
    })

  const allRows = Array.from(employeeMap.values())
  const q = search.trim().toLowerCase()
  const filtered = q
    ? allRows.filter(r =>
        r.employeeName.toLowerCase().includes(q) ||
        r.departmentName.toLowerCase().includes(q),
      )
    : allRows

  const totals = { p: 0, l: 0, a: 0, t: 0 }
  allRows.forEach(row => row.cells.forEach(code => { if (code) totals[code]++ }))

  const monthLabel = new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: '18px 24px 48px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '13px 20px', borderBottom: '1px solid var(--border-color)',
        }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 16,
            color: 'var(--text-heading)', letterSpacing: '-.01em', flexShrink: 0, marginRight: 6,
          }}>
            {t('title')}
          </span>
          <SearchInput value={search} onChange={setSearch} placeholder={t('common:search')} width={200} />
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{
              height: 36, border: '1.5px solid var(--border-color)',
              borderRadius: 10, background: 'var(--bg-subtle)',
              padding: '0 12px', fontSize: 13, color: 'var(--text-secondary)',
              cursor: 'pointer', outline: 'none', flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }} />
          <ExportButton />
        </div>

        {/* ── Stats bar ── */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
          <StatCard count={totals.p} label={t('present')}  color={CODE_META.p.color} bg={CODE_META.p.bg} />
          <StatCard count={totals.l} label={t('late')}     color={CODE_META.l.color} bg={CODE_META.l.bg} />
          <StatCard count={totals.a} label={t('absent')}   color={CODE_META.a.color} bg={CODE_META.a.bg} />
          <StatCard count={totals.t} label={t('leaveDay')} color={CODE_META.t.color} bg={CODE_META.t.bg} />
          <div style={{ flex: 1 }} />
        </div>

        {/* ── Loading / Error ── */}
        {loading && (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            {t('common:loading', 'Loading...')}
          </div>
        )}
        {error && (
          <div style={{ padding: '16px 20px', color: '#dc2626', fontSize: 13, borderBottom: '1px solid var(--border-color)' }}>
            {error}
          </div>
        )}

        {/* ── Table ── */}
        {!loading && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%', minWidth: 820 }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{
                    padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                    color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase',
                    whiteSpace: 'nowrap', minWidth: 220,
                    position: 'sticky', left: 0, zIndex: 2,
                    background: 'var(--bg-subtle)',
                    borderRight: '1px solid var(--border-color)',
                  }}>
                    {t('employee')}
                  </th>
                  {days.map(d => (
                    <th key={d} style={{
                      padding: '10px 6px', textAlign: 'center', fontSize: 11,
                      fontWeight: 700, color: 'var(--text-muted)', minWidth: 38,
                    }}>
                      {d}
                    </th>
                  ))}
                  <th style={{
                    padding: '10px 16px', textAlign: 'center', fontSize: 11,
                    fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.06em',
                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                    borderLeft: '1px solid var(--border-color)',
                  }}>
                    {t('total')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={days.length + 2} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {t('common:noResults')}
                    </td>
                  </tr>
                ) : filtered.map(row => {
                  const presentCount = row.cells.filter(c => c === 'p').length
                  const hovered = hoveredId === row.employeeId
                  return (
                    <tr
                      key={row.employeeId}
                      onMouseEnter={() => setHoveredId(row.employeeId)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background .1s' }}
                    >
                      <td style={{
                        padding: '10px 16px', whiteSpace: 'nowrap',
                        position: 'sticky', left: 0, zIndex: 1,
                        background: hovered ? 'var(--bg-subtle)' : 'var(--surface)',
                        borderRight: '1px solid var(--border-color)',
                        transition: 'background .1s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <EmployeeAvatar initials={row.initials} size={32} fontSize={11} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>{row.employeeName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{row.departmentName}</div>
                          </div>
                        </div>
                      </td>
                      {row.cells.map((code, ci) => {
                        const meta = code ? CODE_META[code] : null
                        return (
                          <td key={ci} style={{
                            padding: '7px 4px', textAlign: 'center',
                            background: hovered ? 'var(--bg-subtle)' : 'transparent',
                            transition: 'background .1s',
                          }}>
                            {meta ? (
                              <div title={t(meta.label)} style={{
                                width: 30, height: 30, borderRadius: 8,
                                background: meta.bg, color: meta.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700, margin: '0 auto',
                                textTransform: 'uppercase', letterSpacing: '.02em',
                              }}>
                                {code}
                              </div>
                            ) : (
                              <div style={{
                                width: 30, height: 30, borderRadius: 8,
                                background: 'var(--bg-subtle)',
                                margin: '0 auto',
                              }} />
                            )}
                          </td>
                        )
                      })}
                      <td style={{
                        padding: '10px 16px', textAlign: 'center',
                        fontWeight: 700, fontSize: 14, color: 'var(--text-heading)',
                        borderLeft: '1px solid var(--border-color)',
                        background: hovered ? 'var(--bg-subtle)' : 'transparent',
                        transition: 'background .1s',
                      }}>
                        {presentCount}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Legend ── */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            {t('legend')}:
          </span>
          {(Object.entries(CODE_META) as [AttendanceCode, typeof CODE_META[AttendanceCode]][]).map(([code, meta]) => (
            <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7,
                background: meta.bg, color: meta.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              }}>
                {code}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{t(meta.label)}</span>
            </div>
          ))}
          <div style={{ flex: 1, textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
            {monthLabel}
          </div>
        </div>

      </div>
    </div>
  )
}
