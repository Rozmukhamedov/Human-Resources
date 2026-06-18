import { useState, useEffect, useCallback, useRef } from 'react'
import { Select } from '@mantine/core'
import { getLeaves, createLeave, updateLeave, deleteLeave } from '../api/leave'
import { getEmployees } from '@modules/employees/api/employees'
import type { ApiEmployee } from '@modules/employees/model/employee.types'
import type { ApiLeaveRequest, CreateLeavePayload } from '../model/leave.types'

const PAGE_SIZE = 12

const REASON_OPTIONS = [
  { value: 'annual', label: 'Mehnat ta\'tili' },
  { value: 'sick', label: 'Kasallik ta\'tili' },
  { value: 'other', label: 'Boshqa' },
]

const LEAVE_TYPE_OPTIONS = [
  { value: 'paid', label: 'To\'langan' },
  { value: 'unpaid', label: 'To\'lanmagan' },
]

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'approved', label: 'Ma\'qullandi' },
  { value: 'rejected', label: 'Rad etildi' },
]

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid var(--border-color, #ebedf1)',
        borderTopColor: '#4f46e5',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

type FormState = {
  employee: string
  reason: string
  description: string
  period_from: string
  period_to: string
  days: string
  leave_type: string
  approver: string
  status: string
}

const EMPTY_FORM: FormState = {
  employee: '',
  reason: '',
  description: '',
  period_from: '',
  period_to: '',
  days: '',
  leave_type: '',
  approver: '',
  status: 'pending',
}

function calcDays(from: string, to: string): string {
  if (!from || !to) return ''
  const diff = (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24)
  const d = Math.round(diff) + 1
  return d > 0 ? String(d) : ''
}

interface LeaveModalProps {
  leave: ApiLeaveRequest | null
  onClose: () => void
  onSave: (data: CreateLeavePayload) => Promise<void>
  loading: boolean
}

function LeaveModal({ leave, onClose, onSave, loading }: LeaveModalProps) {
  const [form, setForm] = useState<FormState>(() => ({
    ...EMPTY_FORM,
    employee: leave ? String(leave.employee) : '',
    reason: leave?.reason ?? '',
    description: leave?.description ?? '',
    period_from: leave?.period_from ?? '',
    period_to: leave?.period_to ?? '',
    days: leave?.days != null ? String(leave.days) : '',
    leave_type: leave?.leave_type ?? '',
    approver: leave?.approver != null ? String(leave.approver) : '',
    status: leave?.status ?? 'pending',
  }))
  const [employees, setEmployees] = useState<ApiEmployee[]>([])

  useEffect(() => {
    getEmployees({ page: 1, page_size: 200 }).then(d => setEmployees(d.data ?? [])).catch(() => {})
  }, [])

  useEffect(() => {
    const auto = calcDays(form.period_from, form.period_to)
    if (auto) setForm(prev => ({ ...prev, days: auto }))
  }, [form.period_from, form.period_to])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: CreateLeavePayload = {
      employee: Number(form.employee),
      reason: form.reason,
      period_from: form.period_from,
      period_to: form.period_to,
    }
    if (form.description) payload.description = form.description
    if (form.days) payload.days = Number(form.days)
    if (form.leave_type) payload.leave_type = form.leave_type
    if (form.approver) payload.approver = Number(form.approver)
    if (form.status) payload.status = form.status
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

  const selectStyles = {
    label: labelStyle,
    input: {
      border: '1.5px solid var(--border-color, #e4e7ef)',
      borderRadius: 10, fontSize: 13.5,
      color: 'var(--text-primary, #2a2f3a)',
      background: 'var(--bg-subtle, #f9fafc)',
      fontFamily: 'inherit',
    },
  }

  const employeeOptions = employees.map(e => ({ value: String(e.id), label: e.full_name || `${e.first_name} ${e.last_name}` }))
  const canSubmit = form.employee && form.reason && form.period_from && form.period_to

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
        borderRadius: 20, width: 500,
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
              {leave ? "Izn so'rovini tahrirlash" : "Yangi izn so'rovi"}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
              {leave ? "Ma'lumotlarni yangilang" : "Izn so'rovi ma'lumotlarini kiriting"}
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
          <Select
            label="Xodim *"
            placeholder="Xodimni tanlang"
            data={employeeOptions}
            value={form.employee || null}
            onChange={v => set('employee', v ?? '')}
            required
            searchable
            comboboxProps={{ withinPortal: true, zIndex: 1001 }}
            styles={selectStyles}
          />

          <Select
            label="Sabab *"
            placeholder="Sababni tanlang"
            data={REASON_OPTIONS}
            value={form.reason || null}
            onChange={v => set('reason', v ?? '')}
            required
            comboboxProps={{ withinPortal: true, zIndex: 1001 }}
            styles={selectStyles}
          />

          <div>
            <label style={labelStyle}>Tavsif</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Izn sababi haqida qo'shimcha ma'lumot..."
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Boshlanish sanasi *</label>
              <input
                type="date"
                style={inputStyle}
                value={form.period_from}
                onChange={e => set('period_from', e.target.value)}
                required
                onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
              />
            </div>
            <div>
              <label style={labelStyle}>Tugash sanasi *</label>
              <input
                type="date"
                style={inputStyle}
                value={form.period_to}
                onChange={e => set('period_to', e.target.value)}
                required
                min={form.period_from || undefined}
                onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Kunlar soni</label>
              <input
                type="number"
                style={inputStyle}
                value={form.days}
                onChange={e => set('days', e.target.value)}
                min={0}
                max={32767}
                placeholder="Avtomatik hisoblanadi"
                onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
              />
            </div>
            <Select
              label="Turi"
              placeholder="Turini tanlang"
              data={LEAVE_TYPE_OPTIONS}
              value={form.leave_type || null}
              onChange={v => set('leave_type', v ?? '')}
              clearable
              comboboxProps={{ withinPortal: true, zIndex: 1001 }}
              styles={selectStyles}
            />
          </div>

          <Select
            label="Ma'qullovchi"
            placeholder="Ma'qullovchini tanlang (ixtiyoriy)"
            data={employeeOptions}
            value={form.approver || null}
            onChange={v => set('approver', v ?? '')}
            searchable
            clearable
            comboboxProps={{ withinPortal: true, zIndex: 1001 }}
            styles={selectStyles}
          />

          <Select
            label="Holat"
            placeholder="Holatni tanlang"
            data={STATUS_OPTIONS}
            value={form.status || null}
            onChange={v => set('status', v ?? '')}
            comboboxProps={{ withinPortal: true, zIndex: 1001 }}
            styles={selectStyles}
          />

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1, padding: '10px 0',
                border: '1.5px solid var(--border-color, #e4e7ef)',
                borderRadius: 10, background: 'transparent', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 600,
                color: 'var(--text-secondary, #5b6270)',
                fontFamily: 'inherit',
              }}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading || !canSubmit}
              style={{
                flex: 1, padding: '10px 0', border: 'none',
                borderRadius: 10,
                background: loading ? '#a5b4fc' : '#4f46e5',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13.5, fontWeight: 600, color: '#fff',
                fontFamily: 'inherit',
                opacity: !canSubmit ? 0.6 : 1,
              }}
            >
              {loading ? 'Yuklanmoqda...' : leave ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({
  leave,
  onClose,
  onConfirm,
  loading,
}: {
  leave: ApiLeaveRequest
  onClose: () => void
  onConfirm: () => Promise<void>
  loading: boolean
}) {
  const label = leave.employee_name || `Xodim #${leave.employee}`
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
          Izn so'rovini o'chirish
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--text-secondary, #5b6270)', lineHeight: 1.6, marginBottom: 24 }}>
          <strong>{label}</strong> ning izn so'rovini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1, padding: '10px 0',
              border: '1.5px solid var(--border-color, #e4e7ef)',
              borderRadius: 10, background: 'transparent', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 600,
              color: 'var(--text-secondary, #5b6270)',
              fontFamily: 'inherit',
            }}
          >
            Bekor qilish
          </button>
          <button
            onClick={() => void onConfirm()}
            disabled={loading}
            style={{
              flex: 1, padding: '10px 0', border: 'none',
              borderRadius: 10,
              background: loading ? '#fca5a5' : '#ef4444',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13.5, fontWeight: 600, color: '#fff',
              fontFamily: 'inherit',
            }}
          >
            {loading ? "O'chirilmoqda..." : "O'chirish"}
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status, display }: { status: string; display?: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    approved: { bg: '#dcfce7', text: '#16a34a' },
    pending: { bg: '#fef9c3', text: '#a16207' },
    rejected: { bg: '#fee2e2', text: '#dc2626' },
  }
  const c = colors[status] ?? { bg: 'var(--bg-subtle, #f4f5f7)', text: 'var(--text-secondary, #5b6270)' }
  const label = display || STATUS_OPTIONS.find(o => o.value === status)?.label || status
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      background: c.bg, color: c.text,
    }}>
      {label}
    </span>
  )
}

function PagerBtn({ children, onClick, active, disabled }: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 34, height: 34, borderRadius: 8,
        border: '1.5px solid',
        borderColor: active ? '#4f46e5' : 'var(--border-color, #e4e7ef)',
        background: active ? '#4f46e5' : 'var(--surface, #fff)',
        color: active ? '#fff' : disabled ? 'var(--text-muted, #9aa1ad)' : 'var(--text-primary, #2a2f3a)',
        fontSize: 13, fontWeight: active ? 700 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.45 : 1,
        transition: 'all .12s',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  )
}

function ActionBtn({ children, onClick, title, danger }: {
  children: React.ReactNode
  onClick: () => void
  title: string
  danger?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 30, height: 30, borderRadius: 7, border: 'none',
        background: hovered ? (danger ? '#fee2e2' : 'var(--bg-subtle, #f4f5f7)') : 'transparent',
        color: hovered ? (danger ? '#ef4444' : 'var(--text-primary, #2a2f3a)') : 'var(--text-secondary, #5b6270)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .12s, color .12s',
      }}
    >
      {children}
    </button>
  )
}

function formatDate(d: string) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return d
  }
}

function TableRow({ leave, index, onEdit, onDelete }: {
  leave: ApiLeaveRequest
  index: number
  onEdit: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const reasonLabel = REASON_OPTIONS.find(o => o.value === leave.reason)?.label ?? leave.reason_display ?? leave.reason
  const typeLabel = LEAVE_TYPE_OPTIONS.find(o => o.value === leave.leave_type)?.label ?? leave.leave_type_display ?? leave.leave_type

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: '1px solid var(--border-color, #ebedf1)',
        background: hovered ? 'var(--bg-subtle, #f9fafc)' : 'transparent',
        transition: 'background .1s',
      }}
    >
      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted, #9aa1ad)', fontWeight: 500 }}>
        {index}
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13.5, fontWeight: 600, color: 'var(--text-heading, #1a1f2e)', maxWidth: 160 }}>
        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {leave.employee_name || `#${leave.employee}`}
        </span>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13.5, color: 'var(--text-primary, #2a2f3a)' }}>
        {reasonLabel}
      </td>
      <td style={{ padding: '12px 16px', maxWidth: 200 }}>
        <span style={{
          display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontSize: 13, color: 'var(--text-secondary, #5b6270)',
        }}>
          {leave.description || '—'}
        </span>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary, #5b6270)', whiteSpace: 'nowrap' }}>
        {formatDate(leave.period_from)} – {formatDate(leave.period_to)}
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13.5, fontWeight: 600, color: 'var(--text-heading, #1a1f2e)' }}>
        {leave.days ?? '—'}
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary, #5b6270)' }}>
        {typeLabel || '—'}
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary, #5b6270)', maxWidth: 140 }}>
        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {leave.approver_name || '—'}
        </span>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <StatusBadge status={leave.status} display={leave.status_display} />
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
          <ActionBtn onClick={onEdit} title="Tahrirlash">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </ActionBtn>
          <ActionBtn onClick={onDelete} title="O'chirish" danger>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
          </ActionBtn>
        </div>
      </td>
    </tr>
  )
}

export function LeaveRequestsPage() {
  const [leaves, setLeaves] = useState<ApiLeaveRequest[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [modal, setModal] = useState<{ open: boolean; leave: ApiLeaveRequest | null }>({
    open: false, leave: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<ApiLeaveRequest | null>(null)

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current) }
  }, [search])

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getLeaves({ page: p, page_size: PAGE_SIZE, search: q || undefined })
      setLeaves(data.data ?? [])
      setTotal(data.total_elements ?? 0)
    } catch (e) {
      setError((e as Error).message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(page, debouncedSearch)
  }, [page, debouncedSearch, load])

  const handleSave = async (data: CreateLeavePayload) => {
    setSaving(true)
    try {
      if (modal.leave) {
        await updateLeave(modal.leave.id, data)
      } else {
        await createLeave(data)
      }
      await load(page, debouncedSearch)
      setModal({ open: false, leave: null })
    } catch (e) {
      alert((e as Error).message || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await deleteLeave(deleteTarget.id)
      setDeleteTarget(null)
      if (leaves.length === 1 && page > 1) {
        setPage(p => p - 1)
      } else {
        await load(page, debouncedSearch)
      }
    } catch (e) {
      alert((e as Error).message || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const pagerNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | '…')[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…')
      acc.push(p)
      return acc
    }, [])

  const HEADERS = ['#', 'Xodim', 'Sabab', 'Tavsif', 'Davr', 'Kun', 'Turi', "Ma'qullovchi", 'Holat', 'Amallar']

  return (
    <div style={{ padding: '18px 24px 40px', fontFamily: "'Public Sans', sans-serif" }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-heading, #1a1f2e)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Izn so'rovlari
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
            Jami {total} ta so'rov
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <svg
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-muted, #9aa1ad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Qidirish..."
              style={{
                height: 36, paddingLeft: 34, paddingRight: 12,
                border: '1.5px solid var(--border-color, #e4e7ef)',
                borderRadius: 9, fontSize: 13.5,
                color: 'var(--text-primary, #2a2f3a)',
                background: 'var(--surface, #fff)',
                outline: 'none', fontFamily: 'inherit', width: 220,
              }}
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>
          <button
            onClick={() => setModal({ open: true, leave: null })}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 10, border: 'none',
              background: '#4f46e5', color: '#fff', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(79,70,229,.25)',
              transition: 'background .12s, box-shadow .12s',
            }}
            onMouseEnter={e => {
              const b = e.currentTarget as HTMLButtonElement
              b.style.background = '#4338ca'
              b.style.boxShadow = '0 4px 14px rgba(79,70,229,.35)'
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement
              b.style.background = '#4f46e5'
              b.style.boxShadow = '0 2px 8px rgba(79,70,229,.25)'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Yaratish
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#ef4444', fontSize: 14 }}>
          <div style={{ marginBottom: 12 }}>{error}</div>
          <button
            onClick={() => void load(page, debouncedSearch)}
            style={{
              padding: '8px 20px', borderRadius: 9, border: 'none',
              background: '#4f46e5', color: '#fff', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
            }}
          >
            Qayta urinish
          </button>
        </div>
      ) : leaves.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted, #9aa1ad)', fontSize: 14 }}>
          {debouncedSearch ? "Qidiruv bo'yicha natija topilmadi" : "Izn so'rovlari mavjud emas"}
        </div>
      ) : (
        <>
          <div style={{
            background: 'var(--surface, #fff)',
            border: '1px solid var(--border-color, #ebedf1)',
            borderRadius: 14, overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Public Sans', sans-serif" }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle, #f9fafc)', borderBottom: '1px solid var(--border-color, #ebedf1)' }}>
                  {HEADERS.map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: '11px 16px',
                        textAlign: i === HEADERS.length - 1 ? 'right' : i === 5 ? 'center' : 'left',
                        fontSize: 11.5, fontWeight: 700,
                        color: 'var(--text-muted, #9aa1ad)',
                        textTransform: 'uppercase', letterSpacing: '.04em',
                        width: i === 0 ? 50 : i === 5 ? 60 : i === HEADERS.length - 1 ? 100 : undefined,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave, idx) => (
                  <TableRow
                    key={leave.id}
                    leave={leave}
                    index={(page - 1) * PAGE_SIZE + idx + 1}
                    onEdit={() => setModal({ open: true, leave })}
                    onDelete={() => setDeleteTarget(leave)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 28 }}>
              <PagerBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </PagerBtn>
              {pagerNums.map((p, i) =>
                p === '…' ? (
                  <span key={`e-${i}`} style={{ fontSize: 13, color: 'var(--text-muted)' }}>…</span>
                ) : (
                  <PagerBtn key={p} active={p === page} onClick={() => setPage(p as number)}>
                    {p}
                  </PagerBtn>
                )
              )}
              <PagerBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </PagerBtn>
            </div>
          )}
        </>
      )}

      {modal.open && (
        <LeaveModal
          leave={modal.leave}
          onClose={() => setModal({ open: false, leave: null })}
          onSave={handleSave}
          loading={saving}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          leave={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={saving}
        />
      )}
    </div>
  )
}
