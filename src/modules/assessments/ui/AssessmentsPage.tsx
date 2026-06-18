import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { StatusBadge } from '@shared/ui/StatusBadge/StatusBadge'
import { DataTable } from '@shared/ui/DataTable/DataTable'
import { CreateButton, SearchInput, ActionButton } from '@shared/ui/TableControls'
import type { Column } from '@shared/ui/DataTable/DataTable'
import type { AssessmentList, AssessmentPayload, AssessmentStatus } from '../model/assessment.types'
import { getAssessments, getAssessmentDetail, createAssessment, updateAssessment, deleteAssessment } from '../api/assessments'
import { getEmployees } from '@modules/employees/api/employees'
import { getAssessmentTemplates } from '../api/assessmentTemplates'
import { getDepartments } from '@modules/organizations/api/departments'

const PAGE_SIZE = 10
const STATUS_OPTIONS: AssessmentStatus[] = ['pending', 'in_progress', 'approved', 'rejected']

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

interface SelectOption {
  id: number
  label: string
}

interface EmployeeSelectOption extends SelectOption {
  departmentId: number | null
  departmentLabel: string
}

async function fetchEmployeeOptions(search: string): Promise<EmployeeSelectOption[]> {
  const data = await getEmployees({ search: search || undefined, page: 1, page_size: 20 })
  return data.data.map(e => ({
    id: e.id,
    label: e.full_name,
    departmentId: e.department?.id ?? null,
    departmentLabel: e.department?.name_uz ?? '',
  }))
}

async function fetchTemplateOptions(search: string): Promise<SelectOption[]> {
  const data = await getAssessmentTemplates(1, 100)
  const lower = search.toLowerCase()
  const list = search ? data.data.filter(t => t.name_uz.toLowerCase().includes(lower)) : data.data
  return list.map(t => ({ id: t.id, label: t.name_uz }))
}

async function fetchDepartmentOptions(search: string): Promise<SelectOption[]> {
  const data = await getDepartments(1, 100)
  const lower = search.toLowerCase()
  const list = search ? data.data.filter(d => d.name_uz.toLowerCase().includes(lower)) : data.data
  return list.map(d => ({ id: d.id, label: d.name_uz }))
}

function SearchSelect<T extends SelectOption>({
  value,
  displayLabel,
  onChange,
  fetchOptions,
  placeholder,
  disabled = false,
}: {
  value: number | null
  displayLabel: string
  onChange: (opt: T) => void
  fetchOptions: (search: string) => Promise<T[]>
  placeholder: string
  disabled?: boolean
}) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState<T[]>([])
  const [optLoading, setOptLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const doFetch = useCallback(async (s: string) => {
    setOptLoading(true)
    try {
      const results = await fetchOptions(s)
      setOptions(results)
    } catch {
      setOptions([])
    } finally {
      setOptLoading(false)
    }
  }, [fetchOptions])

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 40)
      void doFetch('')
    } else {
      setSearch('')
      setOptions([])
    }
  }, [open, doFetch])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => void doFetch(val), 300)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen(v => !v) }}
        style={{
          ...inputStyle,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          borderColor: open ? '#4f46e5' : 'var(--border-color, #e4e7ef)',
          color: (value != null || !!displayLabel) ? 'var(--text-primary, #2a2f3a)' : 'var(--text-muted, #9aa1ad)',
          padding: '9px 10px 9px 13px',
          opacity: disabled ? 0.6 : 1,
          background: disabled ? 'var(--bg-subtle, #f4f5f7)' : 'var(--bg-subtle, #f9fafc)',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {displayLabel || placeholder}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{
            flexShrink: 0, marginLeft: 6, color: 'var(--text-muted, #9aa1ad)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform .15s',
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
          background: 'var(--surface, #fff)',
          border: '1.5px solid #4f46e5',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color, #ebedf1)' }}>
            <input
              ref={searchRef}
              value={search}
              onChange={handleSearchChange}
              placeholder={t('search')}
              style={{ ...inputStyle, padding: '6px 10px', fontSize: 13, background: 'var(--surface, #fff)' }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {optLoading ? (
              <div style={{ padding: '12px 16px', color: 'var(--text-muted, #9aa1ad)', fontSize: 13 }}>
                {t('loading')}
              </div>
            ) : options.length === 0 ? (
              <div style={{ padding: '12px 16px', color: 'var(--text-muted, #9aa1ad)', fontSize: 13 }}>
                {t('noResults')}
              </div>
            ) : options.map(opt => (
              <div
                key={opt.id}
                onClick={() => { onChange(opt); setOpen(false); setSearch('') }}
                style={{
                  padding: '9px 14px', cursor: 'pointer', fontSize: 13.5,
                  fontWeight: opt.id === value ? 600 : 400,
                  color: opt.id === value ? '#4f46e5' : 'var(--text-primary, #2a2f3a)',
                  background: opt.id === value ? '#ede9fe' : 'transparent',
                  transition: 'background .1s',
                }}
                onMouseEnter={e => {
                  if (opt.id !== value)
                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle, #f9fafc)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background =
                    opt.id === value ? '#ede9fe' : 'transparent'
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface FormState {
  employee: number | null
  employeeLabel: string
  template: number | null
  templateLabel: string
  department: number | null
  departmentLabel: string
  started_by: number | null
  startedByLabel: string
  started_date: string
  validity_from: string
  validity_to: string
  status: string
  total_score: string
  notes: string
}

function AssessmentModal({
  assessment,
  onClose,
  onSave,
  loading,
}: {
  assessment: AssessmentList | null
  onClose: () => void
  onSave: (data: AssessmentPayload) => Promise<void>
  loading: boolean
}) {
  const { t } = useTranslation(['assessments', 'common'])
  const today = new Date().toISOString().slice(0, 10)
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState<FormState>({
    employee: assessment?.employee ?? null,
    employeeLabel: assessment?.employee_name ?? '',
    template: assessment?.template ?? null,
    templateLabel: assessment?.template_name ?? '',
    department: assessment?.department ?? null,
    departmentLabel: assessment?.department_name ?? '',
    started_by: assessment?.started_by ?? null,
    startedByLabel: assessment?.started_by_name ?? '',
    started_date: assessment?.started_date ?? today,
    validity_from: assessment?.validity_from ?? '',
    validity_to: assessment?.validity_to ?? '',
    status: assessment?.status ?? 'pending',
    total_score: assessment?.total_score ?? '',
    notes: assessment?.notes ?? '',
  })

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const focusBorder = (e: React.FocusEvent<HTMLElement>) =>
    ((e.target as HTMLElement).style.borderColor = '#4f46e5')
  const blurBorder = (e: React.FocusEvent<HTMLElement>) =>
    ((e.target as HTMLElement).style.borderColor = 'var(--border-color, #e4e7ef)')

  const handleEmployeeChange = (opt: EmployeeSelectOption) => {
    setForm(prev => ({
      ...prev,
      employee: opt.id,
      employeeLabel: opt.label,
      department: opt.departmentId,
      departmentLabel: opt.departmentLabel,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const hasEmployee = form.employee != null || !!form.employeeLabel
    const hasTemplate = form.template != null || !!form.templateLabel
    const hasDepartment = form.department != null || !!form.departmentLabel
    const hasStartedBy = form.started_by != null || !!form.startedByLabel
    if (!hasEmployee || !hasTemplate || !hasDepartment || !hasStartedBy) {
      setFormError(t('modal.requiredFields'))
      return
    }
    setFormError('')
    const payload: AssessmentPayload = {
      ...(form.employee != null && { employee: form.employee }),
      ...(form.template != null && { template: form.template }),
      ...(form.department != null && { department: form.department }),
      ...(form.started_by != null && { started_by: form.started_by }),
      started_date: form.started_date,
      validity_from: form.validity_from || null,
      validity_to: form.validity_to || null,
      status: form.status as AssessmentStatus || undefined,
      total_score: form.total_score || null,
      notes: form.notes || undefined,
    } as AssessmentPayload
    void onSave(payload)
  }

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
        borderRadius: 20, width: 580,
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
              {assessment ? t('modal.editTitle') : t('modal.addTitle')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
              {assessment ? t('modal.editSub') : t('modal.addSub')}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>{t('employee')} *</label>
              <SearchSelect<EmployeeSelectOption>
                value={form.employee}
                displayLabel={form.employeeLabel}
                onChange={handleEmployeeChange}
                fetchOptions={fetchEmployeeOptions}
                placeholder={t('modal.selectEmployee')}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('template')} *</label>
              <SearchSelect
                value={form.template}
                displayLabel={form.templateLabel}
                onChange={opt => setForm(p => ({ ...p, template: opt.id, templateLabel: opt.label }))}
                fetchOptions={fetchTemplateOptions}
                placeholder={t('modal.selectTemplate')}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('dept')} *</label>
              <SearchSelect
                value={form.department}
                displayLabel={form.departmentLabel}
                onChange={opt => setForm(p => ({ ...p, department: opt.id, departmentLabel: opt.label }))}
                fetchOptions={fetchDepartmentOptions}
                placeholder={t('modal.selectDepartment')}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('startedBy')} *</label>
              <SearchSelect<EmployeeSelectOption>
                value={form.started_by}
                displayLabel={form.startedByLabel}
                onChange={opt => setForm(p => ({ ...p, started_by: opt.id, startedByLabel: opt.label }))}
                fetchOptions={fetchEmployeeOptions}
                placeholder={t('modal.selectStartedBy')}
              />
            </div>
          </div>

          {formError && (
            <div style={{ fontSize: 12.5, color: '#ef4444', marginTop: -6 }}>{formError}</div>
          )}

          <div>
            <label style={labelStyle}>{t('started')} *</label>
            <input
              type="date" style={inputStyle}
              value={form.started_date}
              onChange={e => set('started_date', e.target.value)}
              required
              onFocus={focusBorder} onBlur={blurBorder}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>{t('validityFrom')}</label>
              <input
                type="date" style={inputStyle}
                value={form.validity_from}
                onChange={e => set('validity_from', e.target.value)}
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('validityTo')}</label>
              <input
                type="date" style={inputStyle}
                value={form.validity_to}
                onChange={e => set('validity_to', e.target.value)}
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>{t('status')}</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.status}
                onChange={e => set('status', e.target.value)}
                onFocus={focusBorder} onBlur={blurBorder}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('totalScore')}</label>
              <input
                type="number" style={inputStyle}
                value={form.total_score}
                onChange={e => {
                  const val = e.target.value
                  if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
                    set('total_score', val)
                  }
                }}
                min={0}
                max={100}
                step="0.01"
                placeholder="0 – 100"
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t('notes')}</label>
            <textarea
              style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              onFocus={focusBorder} onBlur={blurBorder}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button" onClick={onClose} disabled={loading}
              style={{
                flex: 1, padding: '10px 0',
                border: '1.5px solid var(--border-color, #e4e7ef)',
                borderRadius: 10, background: 'transparent', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 600,
                color: 'var(--text-secondary, #5b6270)',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-subtle, #f4f5f7)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
            >
              {t('modal.cancel')}
            </button>
            <button
              type="submit" disabled={loading}
              style={{
                flex: 1, padding: '10px 0', border: 'none',
                borderRadius: 10,
                background: loading ? '#a5b4fc' : '#4f46e5',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13.5, fontWeight: 600, color: '#fff',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#4338ca' }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#4f46e5' }}
            >
              {loading ? t('modal.loading') : assessment ? t('modal.save') : t('modal.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({
  assessment,
  onClose,
  onConfirm,
  loading,
}: {
  assessment: AssessmentList
  onClose: () => void
  onConfirm: () => Promise<void>
  loading: boolean
}) {
  const { t } = useTranslation('assessments')
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
        borderRadius: 20, width: 400, padding: '28px 28px 24px',
        boxShadow: '0 20px 60px rgba(0,0,0,.18)',
        fontFamily: "'Public Sans', sans-serif",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: '#fee2e2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading, #1a1f2e)', marginBottom: 8 }}>
          {t('delete.title')}
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--text-secondary, #5b6270)', lineHeight: 1.6, marginBottom: 24 }}>
          {t('delete.confirm', { name: assessment.employee_name })}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose} disabled={loading}
            style={{
              flex: 1, padding: '10px 0',
              border: '1.5px solid var(--border-color, #e4e7ef)',
              borderRadius: 10, background: 'transparent', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 600,
              color: 'var(--text-secondary, #5b6270)',
              fontFamily: 'inherit',
            }}
          >
            {t('delete.cancel')}
          </button>
          <button
            onClick={() => void onConfirm()} disabled={loading}
            style={{
              flex: 1, padding: '10px 0', border: 'none',
              borderRadius: 10,
              background: loading ? '#fca5a5' : '#ef4444',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13.5, fontWeight: 600, color: '#fff',
              fontFamily: 'inherit',
            }}
          >
            {loading ? t('delete.deleting') : t('delete.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AssessmentsPage() {
  const { t } = useTranslation(['assessments', 'common'])
  const navigate = useNavigate()

  const [rows, setRows] = useState<AssessmentList[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [modal, setModal] = useState<{ open: boolean; assessment: AssessmentList | null }>({
    open: false, assessment: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<AssessmentList | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  const handleEditClick = async (row: AssessmentList) => {
    setEditLoading(true)
    try {
      const detail = await getAssessmentDetail(row.id)
      setModal({ open: true, assessment: detail })
    } catch {
      setModal({ open: true, assessment: row })
    } finally {
      setEditLoading(false)
    }
  }

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (p: number, s: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAssessments({ page: p, page_size: PAGE_SIZE, search: s || undefined })
      setRows(data.data)
      setCount(data.total_elements)
    } catch (e) {
      setError((e as Error).message || t('common:error'))
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

  const handleSave = async (data: AssessmentPayload) => {
    setSaving(true)
    try {
      if (modal.assessment) {
        const updated = await updateAssessment(modal.assessment.id, data)
        setRows(prev => prev.map(r => r.id === updated.id ? updated : r))
      } else {
        await createAssessment(data)
        await load(page, search)
      }
      setModal({ open: false, assessment: null })
    } catch (e) {
      alert((e as Error).message || t('common:error'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await deleteAssessment(deleteTarget.id)
      setDeleteTarget(null)
      if (rows.length === 1 && page > 1) {
        setPage(p => p - 1)
      } else {
        await load(page, search)
      }
    } catch (e) {
      alert((e as Error).message || t('common:error'))
    } finally {
      setSaving(false)
    }
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
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
          <ActionButton
            label={editLoading ? '...' : t('common:actions.edit')}
            onClick={(e) => {
              e.stopPropagation()
              void handleEditClick(row)
            }}
          />
          <span
            onClick={(e) => {
              e.stopPropagation()
              setDeleteTarget(row)
            }}
            title={t('delete.title')}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 7, cursor: 'pointer',
              color: 'var(--text-muted, #9aa1ad)',
              border: '1px solid var(--border-color, #ebedf1)',
              transition: 'background .12s, color .12s, border-color .12s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = '#fee2e2'
              el.style.color = '#ef4444'
              el.style.borderColor = '#fca5a5'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'transparent'
              el.style.color = 'var(--text-muted, #9aa1ad)'
              el.style.borderColor = 'var(--border-color, #ebedf1)'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
          </span>
        </div>
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
            <CreateButton
              label={t('common:actions.create')}
              onClick={() => setModal({ open: true, assessment: null })}
            />
          </div>
        }
        emptyText={t('common:noResults')}
      />

      {modal.open && (
        <AssessmentModal
          assessment={modal.assessment}
          onClose={() => setModal({ open: false, assessment: null })}
          onSave={handleSave}
          loading={saving}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          assessment={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={saving}
        />
      )}
    </div>
  )
}
