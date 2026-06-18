import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { Holiday, HolidayPayload } from '../model/holiday.types'
import { getHolidays, createHoliday, updateHoliday, deleteHoliday } from '../api/holidays'

const PAGE_SIZE = 12

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

interface ModalProps {
  holiday: Holiday | null
  onClose: () => void
  onSave: (data: HolidayPayload) => Promise<void>
  loading: boolean
}

function HolidayModal({ holiday, onClose, onSave, loading }: ModalProps) {
  const { t } = useTranslation('common')
  const [form, setForm] = useState<HolidayPayload>({
    date: holiday?.date ?? '',
    name: holiday?.name ?? '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void onSave(form)
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
        borderRadius: 20, width: 440,
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
              {holiday ? t('holidays.modal.editTitle') : t('holidays.modal.addTitle')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
              {holiday ? t('holidays.modal.editSub') : t('holidays.modal.addSub')}
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
            <label style={labelStyle}>{t('holidays.modal.dateLabel')} *</label>
            <input
              type="date"
              style={inputStyle}
              value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              required
              autoFocus
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>

          <div>
            <label style={labelStyle}>{t('holidays.modal.nameLabel')} *</label>
            <input
              type="text"
              style={inputStyle}
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder={t('holidays.modal.namePlaceholder')}
              required
              maxLength={255}
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>

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
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-subtle, #f4f5f7)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
            >
              {t('holidays.modal.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
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
              {loading ? t('holidays.modal.loading') : holiday ? t('holidays.modal.save') : t('holidays.modal.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({
  holiday,
  onClose,
  onConfirm,
  loading,
}: {
  holiday: Holiday
  onClose: () => void
  onConfirm: () => Promise<void>
  loading: boolean
}) {
  const { t } = useTranslation('common')
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
          {t('holidays.delete.title')}
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--text-secondary, #5b6270)', lineHeight: 1.6, marginBottom: 24 }}>
          {t('holidays.delete.confirm', { name: holiday.name })}
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
            {t('holidays.delete.cancel')}
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
            {loading ? t('holidays.delete.deleting') : t('holidays.delete.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

function PagerBtn({
  children,
  onClick,
  active,
  disabled,
}: {
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

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function TableRow({
  holiday,
  index,
  onEdit,
  onDelete,
}: {
  holiday: Holiday
  index: number
  onEdit: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-heading, #1a1f2e)', fontFamily: 'monospace' }}>
            {formatDate(holiday.date)}
          </span>
        </div>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13.5, color: 'var(--text-primary, #2a2f3a)', fontWeight: 500 }}>
        {holiday.name}
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
          <ActionBtn onClick={onEdit} title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </ActionBtn>
          <ActionBtn onClick={onDelete} title="Delete" danger>
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

function ActionBtn({
  children,
  onClick,
  title,
  danger,
}: {
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
        background: hovered
          ? danger ? '#fee2e2' : 'var(--bg-subtle, #f4f5f7)'
          : 'transparent',
        color: hovered
          ? danger ? '#ef4444' : 'var(--text-primary, #2a2f3a)'
          : 'var(--text-secondary, #5b6270)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .12s, color .12s',
      }}
    >
      {children}
    </button>
  )
}

const MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12]
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

export function HolidaysPage() {
  const { t } = useTranslation('common')
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined)
  const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined)

  const [modal, setModal] = useState<{ open: boolean; holiday: Holiday | null }>({ open: false, holiday: null })
  const [deleteTarget, setDeleteTarget] = useState<Holiday | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const load = useCallback(async (p: number, year?: number, month?: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getHolidays(p, PAGE_SIZE, year, month)
      setHolidays(data.data ?? [])
      setTotal(data.total_elements ?? 0)
    } catch (e) {
      setError((e as Error).message || t('error'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(page, filterYear, filterMonth)
  }, [page, filterYear, filterMonth, load])

  const handleFilterYear = (val: number | undefined) => {
    setFilterYear(val)
    setPage(1)
  }

  const handleFilterMonth = (val: number | undefined) => {
    setFilterMonth(val)
    setPage(1)
  }

  const handleSave = async (data: HolidayPayload) => {
    setSaving(true)
    try {
      if (modal.holiday) {
        const updated = await updateHoliday(modal.holiday.id, data)
        setHolidays(prev => prev.map(h => h.id === updated.id ? updated : h))
      } else {
        await createHoliday(data)
        await load(page, filterYear, filterMonth)
      }
      setModal({ open: false, holiday: null })
    } catch (e) {
      alert((e as Error).message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await deleteHoliday(deleteTarget.id)
      setDeleteTarget(null)
      if (holidays.length === 1 && page > 1) {
        setPage(p => p - 1)
      } else {
        await load(page, filterYear, filterMonth)
      }
    } catch (e) {
      alert((e as Error).message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '18px 24px 40px', fontFamily: "'Public Sans', sans-serif" }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, gap: 16, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{
            fontSize: 20, fontWeight: 800,
            color: 'var(--text-heading, #1a1f2e)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {t('holidays.title')}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
            {t('holidays.total', { count: total })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <select
            value={filterYear ?? ''}
            onChange={e => handleFilterYear(e.target.value ? Number(e.target.value) : undefined)}
            style={{
              padding: '8px 12px', borderRadius: 9, fontSize: 13,
              border: '1.5px solid var(--border-color, #e4e7ef)',
              background: 'var(--surface, #fff)', color: 'var(--text-primary, #2a2f3a)',
              fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">{t('holidays.filterYearAll')}</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select
            value={filterMonth ?? ''}
            onChange={e => handleFilterMonth(e.target.value ? Number(e.target.value) : undefined)}
            style={{
              padding: '8px 12px', borderRadius: 9, fontSize: 13,
              border: '1.5px solid var(--border-color, #e4e7ef)',
              background: 'var(--surface, #fff)', color: 'var(--text-primary, #2a2f3a)',
              fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">{t('holidays.filterMonthAll')}</option>
            {MONTHS.map(m => <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>)}
          </select>
        </div>

        <button
          onClick={() => setModal({ open: true, holiday: null })}
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
          {t('holidays.addBtn')}
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#ef4444', fontSize: 14 }}>
          <div style={{ marginBottom: 12 }}>{error}</div>
          <button
            onClick={() => void load(page, filterYear, filterMonth)}
            style={{
              padding: '8px 20px', borderRadius: 9, border: 'none',
              background: '#4f46e5', color: '#fff', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
            }}
          >
            {t('holidays.retry')}
          </button>
        </div>
      ) : holidays.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted, #9aa1ad)', fontSize: 14 }}>
          {t('holidays.notFound')}
        </div>
      ) : (
        <>
          <div style={{
            background: 'var(--surface, #fff)',
            border: '1px solid var(--border-color, #ebedf1)',
            borderRadius: 14,
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Public Sans', sans-serif" }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle, #f9fafc)', borderBottom: '1px solid var(--border-color, #ebedf1)' }}>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted, #9aa1ad)', textTransform: 'uppercase', letterSpacing: '.04em', width: 50 }}>
                    #
                  </th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted, #9aa1ad)', textTransform: 'uppercase', letterSpacing: '.04em', width: 180 }}>
                    {t('holidays.colDate')}
                  </th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted, #9aa1ad)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    {t('holidays.colName')}
                  </th>
                  <th style={{ padding: '11px 16px', textAlign: 'right', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted, #9aa1ad)', textTransform: 'uppercase', letterSpacing: '.04em', width: 100 }}>
                    {t('holidays.colActions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday, idx) => (
                  <TableRow
                    key={holiday.id}
                    holiday={holiday}
                    index={(page - 1) * PAGE_SIZE + idx + 1}
                    onEdit={() => setModal({ open: true, holiday })}
                    onDelete={() => setDeleteTarget(holiday)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, marginTop: 28,
            }}>
              <PagerBtn
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </PagerBtn>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '…')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} style={{ fontSize: 13, color: 'var(--text-muted)' }}>…</span>
                  ) : (
                    <PagerBtn
                      key={p}
                      active={p === page}
                      onClick={() => setPage(p as number)}
                    >
                      {p}
                    </PagerBtn>
                  )
                )}

              <PagerBtn
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </PagerBtn>
            </div>
          )}
        </>
      )}

      {modal.open && (
        <HolidayModal
          holiday={modal.holiday}
          onClose={() => setModal({ open: false, holiday: null })}
          onSave={handleSave}
          loading={saving}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          holiday={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={saving}
        />
      )}
    </div>
  )
}
