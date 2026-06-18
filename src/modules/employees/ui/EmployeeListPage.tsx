import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Select } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useEmployeeFilterStore } from '@modules/employees/model/employeeFilterStore'
import { useUIStore } from '@core/store/uiStore'
import { EmployeeAvatar } from '@shared/ui/EmployeeAvatar/EmployeeAvatar'
import { StatusBadge } from '@shared/ui/StatusBadge/StatusBadge'
import { EmptyState } from '@shared/ui/EmptyState/EmptyState'
import { CreateButton, SearchInput } from '@shared/ui/TableControls'
import { getDepartments, createDepartment } from '@modules/organizations/api/departments'
import { getDivisions } from '@modules/organizations/api/divisions'
import type { Department } from '@modules/organizations/model/department.types'
import type { Division } from '@modules/organizations/model/division.types'
import type { Employee, ApiEmployee, CreateEmployeePayload, UpdateEmployeePayload, Position } from '../model/employee.types'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getPositions } from '../api/employees'

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50]
const COLS = '42px 52px 0.6fr 1.3fr 1.4fr 1.3fr 0.65fr 0.85fr 96px'

function toEmployee(e: ApiEmployee): Employee {
  return {
    id: String(e.id),
    code: e.code,
    initials: e.initials,
    firstName: e.first_name,
    lastName: e.last_name,
    fullName: e.full_name,
    departmentId: e.department?.id ?? null,
    departmentName: e.department?.name_uz ?? '',
    positionId: e.position?.id ?? null,
    position: e.position?.name_uz ?? '',
    supervisorId: e.supervisor?.id ?? null,
    supervisorName: e.supervisor?.full_name ?? '',
    status: e.status,
    statusDisplay: e.status_display,
    gender: e.gender === 'female' ? 'Ayol' : 'Erkak',
    genderRaw: e.gender,
    dateOfBirth: e.date_of_birth ?? '',
    hireDate: e.hire_date ?? '',
    email: e.email ?? '',
    phone: e.phone ?? '',
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
  const { t } = useTranslation('employees')
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
        .then(d => { setResults(d.data ?? []); setOpen(true) })
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
          placeholder={t('form.searchSupervisor')}
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
                  {emp.position.name_uz}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateDeptInlineModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (dept: Department) => void
}) {
  const { t } = useTranslation('employees')
  const [nameUz, setNameUz] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [divisionId, setDivisionId] = useState<string>('')
  const [divisions, setDivisions] = useState<Division[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getDivisions(1, 200).then(d => setDivisions(d.data ?? [])).catch(() => {})
  }, [])

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    border: '1.5px solid var(--border-color, #e4e7ef)',
    borderRadius: 10, padding: '9px 13px',
    fontSize: 13.5, color: 'var(--text-primary, #2a2f3a)',
    background: 'var(--bg-subtle, #f9fafc)',
    outline: 'none', fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600,
    color: 'var(--text-secondary, #5b6270)',
    display: 'block', marginBottom: 5,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const dept = await createDepartment({
        name_uz: nameUz,
        name_en: nameEn || undefined,
        division: divisionId ? Number(divisionId) : undefined,
      })
      onCreated(dept)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1002,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--surface, #fff)',
        borderRadius: 16, width: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,.22)',
        fontFamily: "'Public Sans', sans-serif",
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border-color, #ebedf1)',
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading, #1a1f2e)' }}>
            {t('deptModal.title')}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 7, border: 'none',
              background: 'var(--bg-subtle, #f4f5f7)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary, #5b6270)', fontSize: 16, lineHeight: 1,
            }}
          >×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>{t('deptModal.nameUz')} *</label>
            <input
              style={inputStyle}
              value={nameUz}
              onChange={e => setNameUz(e.target.value)}
              placeholder="Masalan: IT bo'lim"
              required
              autoFocus
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('deptModal.nameEn')}</label>
            <input
              style={inputStyle}
              value={nameEn}
              onChange={e => setNameEn(e.target.value)}
              placeholder="e.g. IT Department"
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('deptModal.division')}</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
              value={divisionId}
              onChange={e => setDivisionId(e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            >
              <option value="">{t('deptModal.selectDivision')}</option>
              {divisions.map(div => (
                <option key={div.id} value={String(div.id)}>
                  {div.name_uz}{div.name_en ? ` / ${div.name_en}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              type="button" onClick={onClose} disabled={saving}
              style={{
                flex: 1, padding: '9px 0',
                border: '1.5px solid var(--border-color, #e4e7ef)',
                borderRadius: 9, background: 'transparent', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 600,
                color: 'var(--text-secondary, #5b6270)', fontFamily: 'inherit',
              }}
            >{t('deptModal.cancel')}</button>
            <button
              type="submit" disabled={saving}
              style={{
                flex: 1, padding: '9px 0', border: 'none',
                borderRadius: 9, background: saving ? '#a5b4fc' : '#4f46e5',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 13.5, fontWeight: 600, color: '#fff', fontFamily: 'inherit',
              }}
            >{saving ? t('deptModal.saving') : t('deptModal.add')}</button>
          </div>
        </form>
      </div>
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
  const { t } = useTranslation('employees')
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [supervisor, setSupervisor] = useState<{ id: number; label: string } | null>(null)
  const [depts, setDepts] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [deptSearch, setDeptSearch] = useState('')
  const [deptModalOpen, setDeptModalOpen] = useState(false)

  useEffect(() => {
    getDepartments(1, 200).then(d => setDepts(d.data ?? [])).catch(() => {})
    getPositions(1, 200).then(p => setPositions(p.data ?? [])).catch(() => {})
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
              {t('form.addEmployee')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
              {t('form.enterInfo')}
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
              <label style={labelStyle}>{t('form.firstName')} *</label>
              <input
                style={inputStyle} value={form.first_name}
                onChange={e => set('first_name', e.target.value)}
                placeholder={t('form.firstName')} maxLength={100} required
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('form.lastName')} *</label>
              <input
                style={inputStyle} value={form.last_name}
                onChange={e => set('last_name', e.target.value)}
                placeholder={t('form.lastName')} maxLength={100} required
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>
          </div>

          {/* Department */}
          <Select
            label={t('form.dept')}
            placeholder={t('form.selectDept')}
            data={[
              ...depts.map(d => ({ value: String(d.id), label: d.name_uz })),
              { value: '__create_dept__', label: deptSearch.trim() ? `${deptSearch} — ${t('form.addDeptAction')}` : t('form.addNewDept') },
            ]}
            value={form.department || null}
            onChange={v => {
              if (v === '__create_dept__') { setDeptModalOpen(true); return }
              set('department', v ?? '')
            }}
            searchValue={deptSearch}
            onSearchChange={setDeptSearch}
            required
            searchable
            comboboxProps={{ withinPortal: true, zIndex: 1001 }}
            styles={{
              label: labelStyle,
              input: { border: '1.5px solid var(--border-color, #e4e7ef)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-primary, #2a2f3a)', background: 'var(--bg-subtle, #f9fafc)', fontFamily: 'inherit' },
            }}
          />

          {/* Position */}
          <Select
            label={t('form.position')}
            placeholder={t('form.selectPos')}
            data={positions.length > 0
              ? positions.map(p => ({ value: String(p.id), label: p.name_uz }))
              : [{ value: '__create_pos__', label: t('form.addNewPos') }]
            }
            value={form.position || null}
            onChange={v => {
              if (v === '__create_pos__') { onClose(); navigate('/divisions'); return }
              set('position', v ?? '')
            }}
            required
            searchable
            comboboxProps={{ withinPortal: true, zIndex: 1001 }}
            styles={{
              label: labelStyle,
              input: { border: '1.5px solid var(--border-color, #e4e7ef)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-primary, #2a2f3a)', background: 'var(--bg-subtle, #f9fafc)', fontFamily: 'inherit' },
            }}
          />

          {/* Gender / Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select
              label={t('form.gender')}
              placeholder={t('form.select')}
              data={[{ value: 'male', label: t('form.male') }, { value: 'female', label: t('form.female') }]}
              value={form.gender || null}
              onChange={v => set('gender', v ?? '')}
              required
              comboboxProps={{ withinPortal: true, zIndex: 1001 }}
              styles={{
                label: labelStyle,
                input: { border: '1.5px solid var(--border-color, #e4e7ef)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-primary, #2a2f3a)', background: 'var(--bg-subtle, #f9fafc)', fontFamily: 'inherit' },
              }}
            />
            <Select
              label={t('form.status')}
              placeholder={t('form.select')}
              data={[
                { value: 'active', label: t('form.active') },
                { value: 'leave', label: t('form.onLeave') },
                { value: 'probation', label: t('form.probation') },
              ]}
              value={form.status || null}
              onChange={v => set('status', v ?? '')}
              comboboxProps={{ withinPortal: true, zIndex: 1001 }}
              styles={{
                label: labelStyle,
                input: { border: '1.5px solid var(--border-color, #e4e7ef)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-primary, #2a2f3a)', background: 'var(--bg-subtle, #f9fafc)', fontFamily: 'inherit' },
              }}
            />
          </div>

          {/* Supervisor */}
          <div>
            <label style={labelStyle}>{t('form.supervisor')}</label>
            <SupervisorSearch
              value={supervisor}
              onChange={setSupervisor}
              inputStyle={inputStyle}
            />
          </div>

          {/* Birth date / Hire date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>{t('form.birthDate')}</label>
              <input
                style={inputStyle} type="date" value={form.date_of_birth}
                onChange={e => set('date_of_birth', e.target.value)}
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('form.hireDate')}</label>
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
              <label style={labelStyle}>{t('form.phone')}</label>
              <input
                style={inputStyle} value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+998 90 000 00 00" maxLength={30}
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('form.email')}</label>
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
              {t('form.isDeptHead')}
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
              {t('form.cancel')}
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
              {loading ? t('form.saving') : t('form.add')}
            </button>
          </div>
        </form>
      </div>
      {deptModalOpen && (
        <CreateDeptInlineModal
          onClose={() => setDeptModalOpen(false)}
          onCreated={dept => {
            setDepts(prev => [...prev, dept])
            set('department', String(dept.id))
            setDeptSearch('')
            setDeptModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

function EditEmployeeModal({
  employee,
  onClose,
  onSave,
  loading,
}: {
  employee: Employee
  onClose: () => void
  onSave: (id: number, data: UpdateEmployeePayload) => Promise<void>
  loading: boolean
}) {
  const { t } = useTranslation('employees')
  const navigate = useNavigate()
  const [deptSearch, setDeptSearch] = useState('')
  const [deptModalOpen, setDeptModalOpen] = useState(false)
  const [form, setForm] = useState<FormState>({
    first_name: employee.firstName,
    last_name: employee.lastName,
    department: String(employee.departmentId ?? ''),
    position: String(employee.positionId ?? ''),
    status: employee.status,
    gender: employee.genderRaw,
    date_of_birth: employee.dateOfBirth,
    hire_date: employee.hireDate,
    phone: employee.phone,
    email: employee.email,
    is_head: false,
  })
  const [supervisor, setSupervisor] = useState<{ id: number; label: string } | null>(
    employee.supervisorId ? { id: employee.supervisorId, label: employee.supervisorName } : null
  )
  const [depts, setDepts] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])

  useEffect(() => {
    getDepartments(1, 200).then(d => setDepts(d.data ?? [])).catch(() => {})
    getPositions(1, 200).then(p => setPositions(p.data ?? [])).catch(() => {})
  }, [])

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: UpdateEmployeePayload = {
      first_name: form.first_name,
      last_name: form.last_name,
      department: Number(form.department),
      position: Number(form.position),
      gender: form.gender as 'male' | 'female',
    }
    payload.supervisor = supervisor ? supervisor.id : null
    if (form.status) payload.status = form.status as UpdateEmployeePayload['status']
    if (form.date_of_birth) payload.date_of_birth = form.date_of_birth
    if (form.hire_date) payload.hire_date = form.hire_date
    if (form.phone) payload.phone = form.phone
    if (form.email) payload.email = form.email
    if (form.is_head) payload.is_head = form.is_head
    void onSave(Number(employee.id), payload)
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
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border-color, #ebedf1)',
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-heading, #1a1f2e)' }}>
              {t('form.editEmployee')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
              {employee.fullName} · {employee.code}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>{t('form.firstName')} *</label>
              <input style={inputStyle} value={form.first_name}
                onChange={e => set('first_name', e.target.value)}
                placeholder={t('form.firstName')} maxLength={100} required
                onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={labelStyle}>{t('form.lastName')} *</label>
              <input style={inputStyle} value={form.last_name}
                onChange={e => set('last_name', e.target.value)}
                placeholder={t('form.lastName')} maxLength={100} required
                onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          <Select
            label={t('form.dept')}
            placeholder={t('form.selectDept')}
            data={[
              ...depts.map(d => ({ value: String(d.id), label: d.name_uz })),
              { value: '__create_dept__', label: deptSearch.trim() ? `${deptSearch} — ${t('form.addDeptAction')}` : t('form.addNewDept') },
            ]}
            value={form.department || null}
            onChange={v => {
              if (v === '__create_dept__') { setDeptModalOpen(true); return }
              set('department', v ?? '')
            }}
            searchValue={deptSearch}
            onSearchChange={setDeptSearch}
            required
            searchable
            comboboxProps={{ withinPortal: true, zIndex: 1001 }}
            styles={{
              label: labelStyle,
              input: { border: '1.5px solid var(--border-color, #e4e7ef)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-primary, #2a2f3a)', background: 'var(--bg-subtle, #f9fafc)', fontFamily: 'inherit' },
            }}
          />

          <Select
            label={t('form.position')}
            placeholder={t('form.selectPos')}
            data={positions.length > 0
              ? positions.map(p => ({ value: String(p.id), label: p.name_uz }))
              : [{ value: '__create_pos__', label: t('form.addNewPos') }]
            }
            value={form.position || null}
            onChange={v => {
              if (v === '__create_pos__') { onClose(); navigate('/divisions'); return }
              set('position', v ?? '')
            }}
            required
            searchable
            comboboxProps={{ withinPortal: true, zIndex: 1001 }}
            styles={{
              label: labelStyle,
              input: { border: '1.5px solid var(--border-color, #e4e7ef)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-primary, #2a2f3a)', background: 'var(--bg-subtle, #f9fafc)', fontFamily: 'inherit' },
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select
              label={t('form.gender')}
              placeholder={t('form.select')}
              data={[{ value: 'male', label: t('form.male') }, { value: 'female', label: t('form.female') }]}
              value={form.gender || null}
              onChange={v => set('gender', v ?? '')}
              required
              comboboxProps={{ withinPortal: true, zIndex: 1001 }}
              styles={{
                label: labelStyle,
                input: { border: '1.5px solid var(--border-color, #e4e7ef)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-primary, #2a2f3a)', background: 'var(--bg-subtle, #f9fafc)', fontFamily: 'inherit' },
              }}
            />
            <Select
              label={t('form.status')}
              placeholder={t('form.select')}
              data={[
                { value: 'active', label: t('form.active') },
                { value: 'leave', label: t('form.onLeave') },
                { value: 'probation', label: t('form.probation') },
              ]}
              value={form.status || null}
              onChange={v => set('status', v ?? '')}
              comboboxProps={{ withinPortal: true, zIndex: 1001 }}
              styles={{
                label: labelStyle,
                input: { border: '1.5px solid var(--border-color, #e4e7ef)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-primary, #2a2f3a)', background: 'var(--bg-subtle, #f9fafc)', fontFamily: 'inherit' },
              }}
            />
          </div>

          <div>
            <label style={labelStyle}>{t('form.supervisor')}</label>
            <SupervisorSearch value={supervisor} onChange={setSupervisor} inputStyle={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>{t('form.birthDate')}</label>
              <input style={inputStyle} type="date" value={form.date_of_birth}
                onChange={e => set('date_of_birth', e.target.value)}
                onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={labelStyle}>{t('form.hireDate')}</label>
              <input style={inputStyle} type="date" value={form.hire_date}
                onChange={e => set('hire_date', e.target.value)}
                onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>{t('form.phone')}</label>
              <input style={inputStyle} value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+998 90 000 00 00" maxLength={30}
                onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={labelStyle}>{t('form.email')}</label>
              <input style={inputStyle} type="email" value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="email@example.com" maxLength={254}
                onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={form.is_head}
              onChange={e => set('is_head', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#4f46e5', cursor: 'pointer' }} />
            <span style={{ fontSize: 13.5, color: 'var(--text-secondary, #5b6270)', fontWeight: 500 }}>
              {t('form.isDeptHead')}
            </span>
          </label>

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button type="button" onClick={onClose} disabled={loading}
              style={{
                flex: 1, padding: '10px 0',
                border: '1.5px solid var(--border-color, #e4e7ef)',
                borderRadius: 10, background: 'transparent', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 600,
                color: 'var(--text-secondary, #5b6270)', fontFamily: 'inherit',
              }}
            >{t('form.cancel')}</button>
            <button type="submit" disabled={loading}
              style={{
                flex: 1, padding: '10px 0', border: 'none',
                borderRadius: 10,
                background: loading ? '#a5b4fc' : '#4f46e5',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13.5, fontWeight: 600, color: '#fff', fontFamily: 'inherit',
              }}
            >{loading ? t('form.saving') : t('form.save')}</button>
          </div>
        </form>
      </div>
      {deptModalOpen && (
        <CreateDeptInlineModal
          onClose={() => setDeptModalOpen(false)}
          onCreated={dept => {
            setDepts(prev => [...prev, dept])
            set('department', String(dept.id))
            setDeptSearch('')
            setDeptModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

export function EmployeeListPage() {
  const { t } = useTranslation(['employees', 'common'])
  const navigate = useNavigate()
  const { setSelectedEmployee } = useUIStore()
  const {
    query, sortKey, sortDir, sel, allSel, page,
    setQuery, toggleSort, toggleSel, toggleAllSel, setPage,
  } = useEmployeeFilterStore()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Employee | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(15)

  const load = useCallback(async (p: number, size: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getEmployees({ search: query || undefined, page: p, page_size: size })
      setEmployees((data.data ?? []).map(toEmployee))
      setTotal(data.total_elements ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    void load(page, pageSize)
  }, [load, page, pageSize])

  const handleEdit = async (id: number, data: UpdateEmployeePayload) => {
    setSaving(true)
    try {
      await updateEmployee(id, data)
      setEditTarget(null)
      await load(page, pageSize)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (emp: Employee) => {
    if (!window.confirm(t('deleteConfirm', { name: emp.fullName }))) return
    setDeletingId(emp.id)
    try {
      await deleteEmployee(Number(emp.id))
      await load(page, pageSize)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Xatolik yuz berdi')
    } finally {
      setDeletingId(null)
    }
  }

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
    const list = [...employees]
    list.sort((a, b) => {
      const av = String((a as unknown as Record<string, unknown>)[sortKey] ?? '')
      const bv = String((b as unknown as Record<string, unknown>)[sortKey] ?? '')
      return av.localeCompare(bv) * sortDir
    })
    return list
  }, [employees, sortKey, sortDir])

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
          <div />
          <SortHeader field="code"           label={t('code')} />
          <SortHeader field="fullName"       label={t('name')} />
          <SortHeader field="departmentName" label={t('dept')} />
          <SortHeader field="position"       label={t('pos')} />
          <SortHeader field="gender"         label={t('gender')} />
          <SortHeader field="status"         label={t('status')} />
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.05em', textTransform: 'uppercase', textAlign: 'center' }}>
            {t('colActions')}
          </div>
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
              {t('retry')}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState message={t('common:noResults')} />
        ) : filtered.map(e => {
          const hovered = hoveredId === e.id
          const isDeleting = deletingId === e.id
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
                opacity: isDeleting ? 0.5 : 1,
              }}
            >
              <div onClick={ev => { ev.stopPropagation(); toggleSel(e.id) }} style={checkboxStyle(!!sel[e.id])}>
                {sel[e.id] && <Checkmark />}
              </div>
              <EmployeeAvatar initials={e.initials} size={34} />
              <Cell muted>{e.code}</Cell>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden' }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.fullName}
                </span>
              </div>
              <Cell>{e.departmentName}</Cell>
              <Cell>{e.position}</Cell>
              <Cell>{e.gender}</Cell>
              <div><StatusBadge statusKey={e.status} label={e.statusDisplay} /></div>
              <div
                onClick={ev => ev.stopPropagation()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                <ActionBtn
                  title="Tahrirlash"
                  color="#4f46e5"
                  onClick={() => setEditTarget(e)}
                  disabled={isDeleting}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </ActionBtn>
                <ActionBtn
                  title="O'chirish"
                  color="#ef4444"
                  onClick={() => void handleDelete(e)}
                  disabled={isDeleting}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </ActionBtn>
              </div>
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
                {t('rowsPerPage')}
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
      {editTarget && (
        <EditEmployeeModal
          employee={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
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

function Cell({ children, bold, muted }: { children: React.ReactNode; bold?: boolean; muted?: boolean }) {
  return (
    <div style={{
      fontSize: muted ? 12 : 13.5,
      fontWeight: bold ? 600 : 400,
      color: bold ? 'var(--text-heading)' : muted ? 'var(--text-muted)' : 'var(--text-secondary)',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8,
      fontFamily: muted ? 'monospace' : undefined,
    }}>
      {children}
    </div>
  )
}

function ActionBtn({
  children, title, color, onClick, disabled,
}: {
  children: React.ReactNode
  title: string
  color: string
  onClick: () => void
  disabled?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 30, height: 30, borderRadius: 7, border: 'none',
        background: hovered ? `${color}18` : 'transparent',
        color: hovered ? color : 'var(--text-muted)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .12s, color .12s',
        flexShrink: 0,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
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
