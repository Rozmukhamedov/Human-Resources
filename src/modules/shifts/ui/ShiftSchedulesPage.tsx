import { useState, useEffect, useCallback, useRef } from 'react'
import { Select } from '@mantine/core'
import { useUIStore } from '@core/store/uiStore'
import { getDepartments } from '@modules/organizations/api/departments'
import type { Department } from '@modules/organizations/model/department.types'
import { getShifts, createShift, updateShift, deleteShift } from '../api/shifts'
import type { ShiftScheduleList, CreateShiftPayload, ShiftStatus } from '../model/shift.types'

const PAGE_SIZE = 12

const STATUS_OPTIONS: { value: ShiftStatus; label: string }[] = [
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'approved', label: 'Tasdiqlangan' },
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
  code: string
  department: string
  month: string
  status: ShiftStatus | ''
}

const EMPTY_FORM: FormState = {
  code: '',
  department: '',
  month: '',
  status: '',
}

interface ShiftModalProps {
  shift: ShiftScheduleList | null
  onClose: () => void
  onSave: (data: CreateShiftPayload) => Promise<void>
  loading: boolean
  userId: number
}

function ShiftModal({ shift, onClose, onSave, loading, userId }: ShiftModalProps) {
  const [form, setForm] = useState<FormState>(() => ({
    code: shift?.code ?? '',
    department: '',
    month: shift?.month ? shift.month.slice(0, 7) : '',
    status: shift?.status ?? '',
  }))
  const [depts, setDepts] = useState<Department[]>([])
  const [deptSearch, setDeptSearch] = useState('')

  useEffect(() => {
    getDepartments(1, 200).then(d => setDepts(d.data ?? [])).catch(() => {})
  }, [])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: CreateShiftPayload = {
      code: form.code,
      department: Number(form.department),
      month: form.month.length === 7 ? `${form.month}-01` : form.month,
      created_by: userId,
    }
    if (form.status) payload.status = form.status as ShiftStatus
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
        borderRadius: 20, width: 480,
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
              {shift ? "Smenani tahrirlash" : "Yangi smena qo'shish"}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
              {shift ? "Ma'lumotlarni yangilang" : "Smena ma'lumotlarini kiriting"}
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

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Kod *</label>
            <input
              style={inputStyle}
              value={form.code}
              onChange={e => set('code', e.target.value)}
              placeholder="Masalan: SH-001"
              required
              maxLength={20}
              minLength={1}
              autoFocus
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>

          <Select
            label="Bo'lim *"
            placeholder="Bo'limni tanlang"
            data={depts.map(d => ({ value: String(d.id), label: d.name_uz }))}
            value={form.department || null}
            onChange={v => set('department', v ?? '')}
            searchValue={deptSearch}
            onSearchChange={setDeptSearch}
            required
            searchable
            comboboxProps={{ withinPortal: true, zIndex: 1001 }}
            styles={selectStyles}
          />

          <div>
            <label style={labelStyle}>Oy *</label>
            <input
              type="month"
              style={inputStyle}
              value={form.month}
              onChange={e => set('month', e.target.value)}
              required
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>

          <Select
            label="Holat"
            placeholder="Holatni tanlang"
            data={STATUS_OPTIONS}
            value={form.status || null}
            onChange={v => set('status', (v as ShiftStatus) ?? '')}
            clearable
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
              disabled={loading || !form.code || !form.department || !form.month}
              style={{
                flex: 1, padding: '10px 0', border: 'none',
                borderRadius: 10,
                background: loading ? '#a5b4fc' : '#4f46e5',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13.5, fontWeight: 600, color: '#fff',
                fontFamily: 'inherit',
                opacity: (!form.code || !form.department || !form.month) ? 0.6 : 1,
              }}
            >
              {loading ? 'Yuklanmoqda...' : shift ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({
  shift,
  onClose,
  onConfirm,
  loading,
}: {
  shift: ShiftScheduleList
  onClose: () => void
  onConfirm: () => Promise<void>
  loading: boolean
}) {
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
          Smenani o'chirish
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--text-secondary, #5b6270)', lineHeight: 1.6, marginBottom: 24 }}>
          <strong>{shift.code}</strong> smenasini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
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

function StatusBadge({ status, display }: { status: string; display: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    approved: { bg: '#dcfce7', text: '#16a34a' },
    pending: { bg: '#fef9c3', text: '#a16207' },
  }
  const c = colors[status] ?? { bg: 'var(--bg-subtle, #f4f5f7)', text: 'var(--text-secondary, #5b6270)' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      background: c.bg, color: c.text,
    }}>
      {display}
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

function TableRow({ shift, index, onEdit, onDelete }: {
  shift: ShiftScheduleList
  index: number
  onEdit: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const formatMonth = (m: string) => {
    try {
      const d = new Date(m)
      return d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })
    } catch {
      return m
    }
  }

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
      <td style={{ padding: '12px 16px' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--text-heading, #1a1f2e)' }}>
          {shift.code}
        </span>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13.5, color: 'var(--text-primary, #2a2f3a)', fontWeight: 500, maxWidth: 240 }}>
        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {shift.department_name}
        </span>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13.5, color: 'var(--text-secondary, #5b6270)' }}>
        {formatMonth(shift.month)}
      </td>
      <td style={{ padding: '12px 16px' }}>
        <StatusBadge status={shift.status} display={shift.status_display || (shift.status === 'approved' ? 'Tasdiqlangan' : 'Kutilmoqda')} />
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13.5, color: 'var(--text-secondary, #5b6270)' }}>
        {shift.created_by_name}
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

export function ShiftSchedulesPage() {
  const user = useUIStore(s => s.user)
  const [shifts, setShifts] = useState<ShiftScheduleList[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [modal, setModal] = useState<{ open: boolean; shift: ShiftScheduleList | null }>({
    open: false, shift: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<ShiftScheduleList | null>(null)

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
      const data = await getShifts({ page: p, page_size: PAGE_SIZE, search: q || undefined })
      setShifts(data.data ?? [])
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

  const handleSave = async (data: CreateShiftPayload) => {
    setSaving(true)
    try {
      if (modal.shift) {
        await updateShift(modal.shift.id, data)
      } else {
        await createShift(data)
      }
      await load(page, debouncedSearch)
      setModal({ open: false, shift: null })
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
      await deleteShift(deleteTarget.id)
      setDeleteTarget(null)
      if (shifts.length === 1 && page > 1) {
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

  return (
    <div style={{ padding: '18px 24px 40px', fontFamily: "'Public Sans', sans-serif" }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-heading, #1a1f2e)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Smena jadvallari
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
            Jami {total} ta smena
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
            onClick={() => setModal({ open: true, shift: null })}
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
      ) : shifts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted, #9aa1ad)', fontSize: 14 }}>
          {debouncedSearch ? 'Qidiruv bo\'yicha natija topilmadi' : 'Smena jadvallari mavjud emas'}
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
                  {['#', 'Kod', "Bo'lim", 'Oy', 'Holat', 'Yaratuvchi', 'Amallar'].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: '11px 16px',
                        textAlign: i === 6 ? 'right' : 'left',
                        fontSize: 11.5, fontWeight: 700,
                        color: 'var(--text-muted, #9aa1ad)',
                        textTransform: 'uppercase', letterSpacing: '.04em',
                        width: i === 0 ? 50 : i === 1 ? 120 : i === 4 ? 140 : i === 6 ? 100 : undefined,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift, idx) => (
                  <TableRow
                    key={shift.id}
                    shift={shift}
                    index={(page - 1) * PAGE_SIZE + idx + 1}
                    onEdit={() => setModal({ open: true, shift })}
                    onDelete={() => setDeleteTarget(shift)}
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
        <ShiftModal
          shift={modal.shift}
          onClose={() => setModal({ open: false, shift: null })}
          onSave={handleSave}
          loading={saving}
          userId={user?.id ?? 0}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          shift={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={saving}
        />
      )}
    </div>
  )
}
