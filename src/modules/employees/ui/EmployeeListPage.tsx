import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { departments } from '@data/departments'
import { useEmployeeFilterStore } from '@modules/employees/model/employeeFilterStore'
import { useUIStore } from '@core/store/uiStore'
import { EmployeeAvatar } from '@shared/ui/EmployeeAvatar/EmployeeAvatar'
import { StatusBadge } from '@shared/ui/StatusBadge/StatusBadge'
import { EmptyState } from '@shared/ui/EmptyState/EmptyState'
import { CreateButton, SearchInput } from '@shared/ui/TableControls'
import { getDepartments } from '@modules/organizations/api/departments'
import type { Department } from '@modules/organizations/model/department.types'
import type { Employee, ApiEmployee, CreateEmployeePayload, Position } from '../model/employee.types'
import { getEmployees, createEmployee, getPositions } from '../api/employees'

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50]
const COLS = '42px 56px 1.1fr 1.1fr 1.6fr 1.5fr 1.4fr 1fr'

function toEmployee(e: ApiEmployee): Employee {
  return {
    id: String(e.id),
    initials: e.initials,
    firstName: e.first_name,
    lastName: e.last_name,
    departmentName: e.department?.name_uz ?? '',
    position: e.position?.name ?? '',
    supervisorName: e.supervisor_name ?? '',
    status: e.status,
    gender: e.gender === 'female' ? 'Ayol' : 'Erkak',
    dateOfBirth: '',
    hireDate: '',
    email: '',
    phone: '',
  }
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

type FormState = {
  first_name: string
  last_name: string
  department: string
  position: string
  status: string
  gender: string
  date_of_birth: string
  hire_date: string
  phone: string
  email: string
  is_head: boolean
}

const EMPTY_FORM: FormState = {
  first_name: '', last_name: '',
  department: '', position: '',
  status: '', gender: '',
  date_of_birth: '', hire_date: '',
  phone: '', email: '',
  is_head: false,
}

function SupervisorSearch({
  value,
  onChange,
  inputStyle,
}: {
  value: { id: number; label: string } | null
  onChange: (v: { id: number; label: string } | null) => void
  inputStyle: React.CSSProperties
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ApiEmployee[]>([])
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = (q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!q.trim()) { setResults([]); setOpen(false); return }
    timerRef.current = setTimeout(() => {
      getEmployees({ search: q, page_size: 20 })
        .then(d => { setResults(d.results ?? []); setOpen(true) })
        .catch(() => {})
    }, 280)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    if (value) onChange(null)
    search(q)
  }

  const select = (emp: ApiEmployee) => {
    onChange({ id: emp.id, label: emp.full_name || `${emp.first_name} ${emp.last_name}` })
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const clear = () => {
    onChange(null)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const displayValue = value ? value.label : query

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          style={{
            ...inputStyle,
            borderColor: focused ? '#4f46e5' : 'var(--border-color, #e4e7ef)',
            paddingRight: value ? 36 : 13,
          }}
          value={displayValue}
          onChange={handleInput}
          onFocus={() => { setFocused(true); if (results.length) setOpen(true) }}
          onBlur={() => setFocused(false)}
          placeholder="Rahbarni qidiring..."
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
              color: 'var(--text-muted, #9aa1ad)', fontSize: 16, lineHeight: 1,
              display: 'flex', alignItems: 'center',
            }}
          >×</button>
        )}
      </div>
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 10,
          background: 'var(--surface, #fff)',
          border: '1.5px solid var(--border-color, #e4e7ef)',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)',
          maxHeight: 220, overflowY: 'auto',
        }}>
          {results.map(emp => (
            <div
              key={emp.id}
              onMouseDown={() => select(emp)}
              style={{
                padding: '9px 13px', cursor: 'pointer', fontSize: 13.5,
                color: 'var(--text-primary, #2a2f3a)',
                borderBottom: '1px solid var(--border-color, #f0f1f5)',
                display: 'flex', flexDirection: 'column', gap: 2,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle, #f4f5f7)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontWeight: 600 }}>
                {emp.full_name || `${emp.first_name} ${emp.last_name}`}
              </span>
              {emp.position && (
                <span style={{ fontSize: 11.5, color: 'var(--text-muted, #9aa1ad)' }}>
                  {emp.position.name}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateEmployeeModal({
  onClose,
  onSave,
  loading,
}: {
  onClose: () => void
  onSave: (data: CreateEmployeePayload) => Promise<void>
  loading: boolean
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [supervisor, setSupervisor] = useState<{ id: number; label: string } | null>(null)
  const [depts, setDepts] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])

  useEffect(() => {
    getDepartments(1, 200).then(d => setDepts(d.data ?? [])).catch(() => {})
    getPositions(1, 200).then(p => setPositions(p.results ?? [])).catch(() => {})
  }, [])

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: CreateEmployeePayload = {
      first_name: form.first_name,
      last_name: form.last_name,
      department: Number(form.department),
      position: Number(form.position),
      gender: form.gender as 'male' | 'female',
    }
    if (supervisor) payload.supervisor = supervisor.id
    if (form.status) payload.status = form.status as CreateEmployeePayload['status']
    if (form.date_of_birth) payload.date_of_birth = form.date_of_birth
    if (form.hire_date) payload.hire_date = form.hire_date
    if (form.phone) payload.phone = form.phone
    if (form.email) payload.email = form.email
    if (form.is_head) payload.is_head = form.is_head
    void onSave(payload)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    border: '1.5px solid var(--border-color, #e4e7ef)',
    borderRadius: 10, padding: '9px 13px',
    fontSize: 13.5, color: 'var(--text-primary, #2a2f3a)',
    background: 'var(--bg-subtle, #f9fafc)',
    outline: 'none', fontFamily: 'inherit',
    transition: 'border-color .15s',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600,
    color: 'var(--text-secondary, #5b6270)',
    display: 'block', marginBottom: 5,
  }

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = '#4f46e5')
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.38)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(3px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--surface, #fff)',
        borderRadius: 20, width: 520,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,.18)',
        fontFamily: "'Public Sans', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border-color, #ebedf1)',
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-heading, #1a1f2e)' }}>
              Yangi xodim qo'shish
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
              Xodim ma'lumotlarini kiriting
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: 'var(--bg-subtle, #f4f5f7)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary, #5b6270)', fontSize: 18, lineHeight: 1,
            }}
          >×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* First / Last name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Ism *</label>
              <input
                style={inputStyle} value={form.first_name}
                onChange={e => set('first_name', e.target.value)}
                placeholder="Ism" maxLength={100} required
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>
            <div>
              <label style={labelStyle}>Familiya *</label>
              <input
                style={inputStyle} value={form.last_name}
                onChange={e => set('last_name', e.target.value)}
                placeholder="Familiya" maxLength={100} required
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label style={labelStyle}>Bo'lim *</label>
            <select
              style={inputStyle} value={form.department}
              onChange={e => set('department', e.target.value)}
              required onFocus={focusBorder} onBlur={blurBorder}
            >
              <option value="">Bo'limni tanlang</option>
              {depts.map(d => <option key={d.id} value={d.id}>{d.name_uz}</option>)}
            </select>
          </div>

          {/* Position */}
          <div>
            <label style={labelStyle}>Lavozim *</label>
            <select
              style={inputStyle} value={form.position}
              onChange={e => set('position', e.target.value)}
              required onFocus={focusBorder} onBlur={blurBorder}
            >
              <option value="">Lavozimni tanlang</option>
              {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Gender / Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Jinsi *</label>
              <select
                style={inputStyle} value={form.gender}
                onChange={e => set('gender', e.target.value)}
                required onFocus={focusBorder} onBlur={blurBorder}
              >
                <option value="">Tanlang</option>
                <option value="male">Erkak</option>
                <option value="female">Ayol</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Holat</label>
              <select
                style={inputStyle} value={form.status}
                onChange={e => set('status', e.target.value)}
                onFocus={focusBorder} onBlur={blurBorder}
              >
                <option value="">Tanlang</option>
                <option value="active">Faol</option>
                <option value="leave">Ta'tilda</option>
                <option value="probation">Sinov muddati</option>
              </select>
            </div>
          </div>

          {/* Supervisor */}
          <div>
            <label style={labelStyle}>Rahbar</label>
            <SupervisorSearch
              value={supervisor}
              onChange={setSupervisor}
              inputStyle={inputStyle}
            />
          </div>

          {/* Birth date / Hire date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Tug'ilgan sana</label>
              <input
                style={inputStyle} type="date" value={form.date_of_birth}
                onChange={e => set('date_of_birth', e.target.value)}
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>
            <div>
              <label style={labelStyle}>Ishga kirgan sana</label>
              <input
                style={inputStyle} type="date" value={form.hire_date}
                onChange={e => set('hire_date', e.target.value)}
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>
          </div>

          {/* Phone / Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Telefon</label>
              <input
                style={inputStyle} value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+998 90 000 00 00" maxLength={30}
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle} type="email" value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="email@example.com" maxLength={254}
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>
          </div>

          {/* Is head */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={form.is_head}
              onChange={e => set('is_head', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#4f46e5', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13.5, color: 'var(--text-secondary, #5b6270)', fontWeight: 500 }}>
              Bo'lim boshlig'i
            </span>
          </label>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="button" onClick={onClose} disabled={loading}
              style={{
                flex: 1, padding: '10px 0',
                border: '1.5px solid var(--border-color, #e4e7ef)',
                borderRadius: 10, background: 'transparent', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 600,
                color: 'var(--text-secondary, #5b6270)',
                fontFamily: 'inherit', transition: 'background .12s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-subtle, #f4f5f7)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
            >
              Bekor qilish
            </button>
            <button
              type="submit" disabled={loading}
              style={{
                flex: 1, padding: '10px 0', border: 'none',
                borderRadius: 10,
                background: loading ? '#a5b4fc' : '#4f46e5',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13.5, fontWeight: 600, color: '#fff',
                fontFamily: 'inherit', transition: 'background .12s',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#4338ca' }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#4f46e5' }}
            >
              {loading ? 'Saqlanmoqda...' : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function EmployeeListPage() {
  const { t } = useTranslation(['employees', 'common'])
  const navigate = useNavigate()
  const { setSelectedEmployee } = useUIStore()
  const {
    query, filterDept, sortKey, sortDir, sel, allSel, page,
    setQuery, setFilterDept, toggleSort, toggleSel, toggleAllSel, setPage,
  } = useEmployeeFilterStore()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(15)

  const load = useCallback(async (p: number, size: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getEmployees({ search: query || undefined, page: p, page_size: size })
      setEmployees((data.results ?? []).map(toEmployee))
      setTotal(data.count ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    void load(page, pageSize)
  }, [load, page, pageSize])

  const handleCreate = async (data: CreateEmployeePayload) => {
    setSaving(true)
    try {
      await createEmployee(data)
      setModalOpen(false)
      await load(page, pageSize)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const handleQueryChange = (q: string) => {
    setQuery(q)
    setPage(1)
  }

  const filtered = useMemo(() => {
    let list = [...employees]
    if (filterDept !== 'all') list = list.filter(e => e.departmentName === filterDept)
    list.sort((a, b) => {
      const av = String((a as unknown as Record<string, unknown>)[sortKey] ?? '')
      const bv = String((b as unknown as Record<string, unknown>)[sortKey] ?? '')
      return av.localeCompare(bv) * sortDir
    })
    return list
  }, [employees, filterDept, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

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
            onChange={handleQueryChange}
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
          <CreateButton label={t('common:actions.create')} onClick={() => setModalOpen(true)} />
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
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--accent)',
              animation: 'spin 0.7s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#ef4444', fontSize: 13 }}>
            {error}
            <br />
            <button
              onClick={() => void load(page, pageSize)}
              style={{
                marginTop: 10, padding: '7px 18px', borderRadius: 9, border: 'none',
                background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
              }}
            >
              Qayta urinish
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState message={t('common:noResults')} />
        ) : filtered.map(e => {
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
              {from}–{to} of {total}
            </span>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <PageBtn disabled={page === 1} onClick={() => setPage(page - 1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </PageBtn>
              {getPageNumbers(page, totalPages).map((n, i) =>
                n === '...'
                  ? <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 13 }}>…</span>
                  : <PageBtn key={n} active={n === page} onClick={() => setPage(n as number)}>{n}</PageBtn>
              )}
              <PageBtn disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </PageBtn>
            </div>
          )}
        </div>

      </div>

      {modalOpen && (
        <CreateEmployeeModal
          onClose={() => setModalOpen(false)}
          onSave={handleCreate}
          loading={saving}
        />
      )}
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
