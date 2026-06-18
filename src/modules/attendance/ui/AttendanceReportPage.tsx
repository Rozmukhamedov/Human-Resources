import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { EmployeeAvatar } from '@shared/ui/EmployeeAvatar/EmployeeAvatar'
import { SearchInput } from '@shared/ui/TableControls'
import type { AttendanceCode, AttendanceEmployee, CreateAttendancePayload } from '../model/attendance.types'
import { getAttendance, bulkCreateAttendance } from '../api/attendance'
import { getDepartments } from '@modules/organizations/api/departments'
import type { Department } from '@modules/organizations/model/department.types'
import { getHolidays } from '@modules/kpi/api/holidays'

const CODE_TO_STATUS: Record<AttendanceCode, string> = {
  p: 'present',
  l: 'late',
  a: 'absent',
  t: 'leave',
}

const CODE_META: Record<AttendanceCode, { color: string; bg: string; label: string }> = {
  p: { color: '#0f9d58', bg: '#e7f7ee', label: 'present' },
  l: { color: '#d97706', bg: '#fdf3e3', label: 'late' },
  a: { color: '#dc2626', bg: '#fdeaea', label: 'absent' },
  t: { color: '#4f46e5', bg: '#eef2ff', label: 'leaveDay' },
}

const CYCLE: (AttendanceCode | null)[] = [null, 'p', 'l', 'a', 't']

function nextCode(current: AttendanceCode | null): AttendanceCode | null {
  const idx = CYCLE.indexOf(current)
  return CYCLE[(idx + 1) % CYCLE.length]
}

function isWeekend(year: number, month: number, day: number): boolean {
  const dow = new Date(year, month - 1, day).getDay()
  return dow === 0 || dow === 6
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2)
}

function CellIcon({ code }: { code: AttendanceCode }) {
  if (code === 'p') return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
  if (code === 'a') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
  if (code === 'l') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
  return <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0 }}>T</span>
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
  const { t } = useTranslation('attendance')
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
      {t('export')}
    </button>
  )
}

export function AttendanceReportPage() {
  const { t } = useTranslation(['attendance', 'common'])
  const now = new Date()
  const [search, setSearch] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [rows, setRows] = useState<AttendanceEmployee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('')
  const [overrides, setOverrides] = useState<Record<string, AttendanceCode | null>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  // day number → holiday name
  const [holidayMap, setHolidayMap] = useState<Map<number, string>>(new Map())

  useEffect(() => {
    getDepartments(1, 100).then(res => setDepartments(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    getHolidays(1, 100, year, month)
      .then(res => {
        const map = new Map<number, string>()
        for (const h of res.data ?? []) {
          const d = new Date(h.date)
          if (d.getFullYear() === year && d.getMonth() + 1 === month) {
            map.set(d.getDate(), h.name)
          }
        }
        setHolidayMap(map)
      })
      .catch(() => setHolidayMap(new Map()))
  }, [year, month])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    setOverrides({})
    try {
      const data = await getAttendance({
        year,
        month,
        search: search || undefined,
        department: selectedDepartment || undefined,
        page_size: 100,
      })
      setRows(data.data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common:error'))
    } finally {
      setLoading(false)
    }
  }, [year, month, search, selectedDepartment])

  useEffect(() => { fetchData() }, [fetchData])

  const daysInMonth = new Date(year, month, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const workingDays = days.filter(d => !isWeekend(year, month, d) && !holidayMap.has(d)).length
  const selectedMonthStr = `${year}-${String(month).padStart(2, '0')}`

  const getCellCode = (employeeId: number, day: number, attendanceMap: Map<number, AttendanceCode>): AttendanceCode | null => {
    const key = `${employeeId}-${day}`
    if (key in overrides) return overrides[key]
    return attendanceMap.get(day) ?? null
  }

  const handleCellClick = (employeeId: number, day: number, current: AttendanceCode | null) => {
    if (isWeekend(year, month, day) || holidayMap.has(day)) return
    const key = `${employeeId}-${day}`
    setOverrides(prev => ({ ...prev, [key]: nextCode(current) }))
  }

  const handleSave = async () => {
    const payload: CreateAttendancePayload[] = []
    for (const [key, code] of Object.entries(overrides)) {
      if (!code) continue
      const [empId, day] = key.split('-').map(Number)
      payload.push({
        employee: empId,
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        status: CODE_TO_STATUS[code] as CreateAttendancePayload['status'],
      })
    }
    if (payload.length === 0) return
    setSaving(true)
    setSaveError(null)
    try {
      await bulkCreateAttendance(payload)
      setOverrides({})
      await fetchData()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : t('common:error'))
    } finally {
      setSaving(false)
    }
  }

  const totals = { p: 0, l: 0, a: 0, t: 0 }
  rows.forEach(row => {
    const attendanceMap = new Map(row.attendance.map(a => [a.day, a.status]))
    days.forEach(d => {
      const code = getCellCode(row.id, d, attendanceMap)
      if (code) totals[code]++
    })
  })

  const monthLabel = new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: '18px 24px 48px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '13px 20px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 16,
            color: 'var(--text-heading)', letterSpacing: '-.01em', flexShrink: 0, marginRight: 6,
          }}>
            {t('title')}
          </span>
          <SearchInput value={search} onChange={setSearch} placeholder={t('common:search')} width={200} />
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value ? Number(e.target.value) : '')}
            style={{
              height: 36, border: '1.5px solid var(--border-color)',
              borderRadius: 10, background: 'var(--bg-subtle)',
              padding: '0 12px', fontSize: 13, color: 'var(--text-secondary)',
              cursor: 'pointer', outline: 'none', flexShrink: 0,
            }}
          >
            <option value="">{t('common:allDepts')}</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name_uz}</option>
            ))}
          </select>
          <input
            type="month"
            value={selectedMonthStr}
            onChange={e => {
              const [y, m] = e.target.value.split('-').map(Number)
              if (y && m) { setYear(y); setMonth(m) }
            }}
            style={{
              height: 36, border: '1.5px solid var(--border-color)',
              borderRadius: 10, background: 'var(--bg-subtle)',
              padding: '0 12px', fontSize: 13, color: 'var(--text-secondary)',
              cursor: 'pointer', outline: 'none', flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }} />
          <ExportButton />
          {Object.values(overrides).some(v => v !== null) && (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 36, padding: '0 16px', borderRadius: 10,
                background: saving ? '#6366f1aa' : '#6366f1',
                border: 'none',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'background .12s',
                flexShrink: 0,
              }}
            >
              {saving ? t('saving', 'Saving...') : t('save', 'Save')}
            </button>
          )}
        </div>
        {saveError && (
          <div style={{ padding: '10px 20px', color: '#dc2626', fontSize: 13, background: '#fdeaea', borderBottom: '1px solid #fca5a5' }}>
            {saveError}
          </div>
        )}

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
                  {days.map(d => {
                    const weekend = isWeekend(year, month, d)
                    const holiday = holidayMap.get(d)
                    return (
                      <th key={d} title={holiday} style={{
                        padding: '10px 6px', textAlign: 'center', fontSize: 11,
                        fontWeight: 700, minWidth: 38,
                        color: weekend ? '#dc2626' : holiday ? '#d97706' : 'var(--text-muted)',
                      }}>
                        {d}
                      </th>
                    )
                  })}
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
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={days.length + 2} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {t('common:noResults')}
                    </td>
                  </tr>
                ) : rows.map(row => {
                  const initials = getInitials(row.full_name)
                  const hovered = hoveredId === String(row.id)
                  const attendanceMap = new Map(row.attendance.map(a => [a.day, a.status]))
                  const presentCount = days.filter(d => !isWeekend(year, month, d) && !holidayMap.has(d) && getCellCode(row.id, d, attendanceMap) === 'p').length
                  return (
                    <tr
                      key={row.id}
                      onMouseEnter={() => setHoveredId(String(row.id))}
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
                          <EmployeeAvatar initials={initials} size={32} fontSize={11} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>{row.full_name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{row.department_name}</div>
                          </div>
                        </div>
                      </td>
                      {days.map(d => {
                        const weekend = isWeekend(year, month, d)
                        const holidayName = holidayMap.get(d)
                        const disabled = weekend || !!holidayName
                        const code = getCellCode(row.id, d, attendanceMap)
                        const meta = code ? CODE_META[code] : null
                        return (
                          <td
                            key={d}
                            onClick={() => handleCellClick(row.id, d, code)}
                            title={holidayName}
                            style={{
                              padding: '7px 4px', textAlign: 'center',
                              background: weekend
                                ? 'rgba(220,38,38,.04)'
                                : holidayName
                                  ? 'rgba(217,119,6,.04)'
                                  : hovered ? 'var(--bg-subtle)' : 'transparent',
                              transition: 'background .1s',
                              cursor: disabled ? 'default' : 'pointer',
                              userSelect: 'none',
                            }}
                          >
                            {weekend ? (
                              <div style={{
                                width: 32, height: 32, borderRadius: 10,
                                background: 'rgba(220,38,38,.08)',
                                margin: '0 auto',
                              }} />
                            ) : holidayName ? (
                              <div style={{
                                width: 32, height: 32, borderRadius: 10,
                                background: 'rgba(217,119,6,.12)',
                                margin: '0 auto',
                              }} />
                            ) : meta ? (
                              <div title={t(meta.label)} style={{
                                width: 32, height: 32, borderRadius: 10,
                                background: meta.bg, color: meta.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto',
                                transition: 'background .12s',
                              }}>
                                <CellIcon code={code!} />
                              </div>
                            ) : (
                              <div style={{
                                width: 32, height: 32, borderRadius: 10,
                                background: 'var(--bg-subtle)',
                                margin: '0 auto',
                                transition: 'background .12s',
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
                        {presentCount}<span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}>/{workingDays}</span>
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
                width: 26, height: 26, borderRadius: 8,
                background: meta.bg, color: meta.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CellIcon code={code} />
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
