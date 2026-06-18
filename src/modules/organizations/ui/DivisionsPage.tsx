import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Division, DivisionPayload } from '../model/division.types'
import { getDivisions, createDivision, updateDivision, deleteDivision } from '../api/divisions'

const PAGE_SIZE = 12

const PRESET_COLORS = [
  '#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626',
  '#7c3aed', '#db2777', '#0284c7', '#65a30d', '#ea580c',
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

interface ModalProps {
  division: Division | null
  onClose: () => void
  onSave: (data: DivisionPayload) => Promise<void>
  loading: boolean
}

function DivisionModal({ division, onClose, onSave, loading }: ModalProps) {
  const { t } = useTranslation('common')
  const [form, setForm] = useState<DivisionPayload>(() => ({
    name_uz: division?.name_uz ?? '',
    name_en: division?.name_en ?? '',
    color: division?.color ?? PRESET_COLORS[0],
    order: division?.order ?? 0,
  }))

  const set = <K extends keyof DivisionPayload>(key: K, value: DivisionPayload[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void onSave(form)
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
        borderRadius: 20, width: 460,
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
              {division ? t('div.modal.editTitle') : t('div.modal.addTitle')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
              {division ? t('div.modal.editSub') : t('div.modal.addSub')}
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
            <label style={labelStyle}>{t('div.modal.nameUz')} *</label>
            <input
              style={inputStyle}
              value={form.name_uz}
              onChange={e => set('name_uz', e.target.value)}
              placeholder="Masalan: Shimoliy bo'linma"
              required
              autoFocus
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>

          <div>
            <label style={labelStyle}>{t('div.modal.nameEn')}</label>
            <input
              style={inputStyle}
              value={form.name_en ?? ''}
              onChange={e => set('name_en', e.target.value)}
              placeholder="e.g. North Branch"
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>

          <div>
            <label style={labelStyle}>{t('div.modal.colorLabel')}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('color', c)}
                  style={{
                    width: 28, height: 28, borderRadius: 8, border: 'none',
                    background: c, cursor: 'pointer',
                    outline: form.color === c ? `3px solid ${c}` : 'none',
                    outlineOffset: 2,
                    transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform .12s',
                  }}
                />
              ))}
              <input
                type="text"
                value={form.color ?? ''}
                onChange={e => set('color', e.target.value)}
                placeholder="#4f46e5"
                style={{ ...inputStyle, width: 110, padding: '6px 10px', fontSize: 12.5 }}
                onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t('div.modal.orderLabel')}</label>
            <input
              type="number"
              style={inputStyle}
              value={form.order ?? 0}
              onChange={e => set('order', Number(e.target.value))}
              min={0}
              max={32767}
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
              {t('div.modal.cancel')}
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
              {loading ? t('div.modal.loading') : division ? t('div.modal.save') : t('div.modal.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DepartmentsListModal({
  division,
  onClose,
}: {
  division: Division
  onClose: () => void
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
        borderRadius: 20, width: 480,
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,.18)',
        fontFamily: "'Public Sans', sans-serif",
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border-color, #ebedf1)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-heading, #1a1f2e)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: division.color || '#4f46e5', flexShrink: 0 }} />
              {division.name_uz}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
              {t('div.deptCount', { count: division.department_count })}
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

        <div style={{ overflowY: 'auto', padding: '12px 16px 20px' }}>
          {division.departments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted, #9aa1ad)', fontSize: 13.5 }}>
              {t('div.noDepts')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {division.departments.map(dept => (
                <div
                  key={dept.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--border-color, #ebedf1)',
                    background: 'var(--bg-subtle, #f9fafc)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-heading, #1a1f2e)' }}>
                      {dept.name_uz}
                    </div>
                    {dept.name_en && dept.name_en !== dept.name_uz && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 1 }}>
                        {dept.name_en}
                      </div>
                    )}
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: 'var(--text-secondary, #5b6270)',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span style={{ fontWeight: 600 }}>{dept.employee_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DeleteConfirm({
  division,
  onClose,
  onConfirm,
  loading,
}: {
  division: Division
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
          {t('div.delete.title')}
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--text-secondary, #5b6270)', lineHeight: 1.6, marginBottom: 24 }}>
          {t('div.delete.confirm', { name: division.name_uz })}
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
            {t('div.delete.cancel')}
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
            {loading ? t('div.delete.deleting') : t('div.delete.delete')}
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

export function DivisionsPage() {
  const { t } = useTranslation('common')
  const [divisions, setDivisions] = useState<Division[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [modal, setModal] = useState<{ open: boolean; division: Division | null }>({
    open: false, division: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<Division | null>(null)
  const [departmentsTarget, setDepartmentsTarget] = useState<Division | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDivisions(p, PAGE_SIZE, q || undefined)
      setDivisions(data.data ?? [])
      setTotal(data.total_elements ?? 0)
    } catch (e) {
      setError((e as Error).message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(page, search)
  }, [page, search, load])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchInput(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(val)
      setPage(1)
    }, 350)
  }

  const handleSave = async (data: DivisionPayload) => {
    setSaving(true)
    try {
      if (modal.division) {
        const updated = await updateDivision(modal.division.id, data)
        setDivisions(prev => prev.map(d => d.id === updated.id ? updated : d))
      } else {
        await createDivision(data)
        await load(page, search)
      }
      setModal({ open: false, division: null })
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
      await deleteDivision(deleteTarget.id)
      setDeleteTarget(null)
      if (divisions.length === 1 && page > 1) {
        setPage(p => p - 1)
      } else {
        await load(page, search)
      }
    } catch (e) {
      alert((e as Error).message || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '18px 24px 40px', fontFamily: "'Public Sans', sans-serif" }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div>
          <div style={{
            fontSize: 20, fontWeight: 800,
            color: 'var(--text-heading, #1a1f2e)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {t('div.title')}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
            {t('div.total', { count: total })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-muted, #9aa1ad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder={t('common:search')}
              style={{
                height: 36, paddingLeft: 32, paddingRight: 12,
                border: '1.5px solid var(--border-color, #e4e7ef)',
                borderRadius: 10, background: 'var(--surface, #fff)',
                fontSize: 13.5, color: 'var(--text-primary, #2a2f3a)',
                outline: 'none', fontFamily: 'inherit', width: 220,
                boxSizing: 'border-box', transition: 'border-color .15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>
        <button
          onClick={() => setModal({ open: true, division: null })}
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
          {t('div.addBtn')}
        </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#ef4444', fontSize: 14 }}>
          <div style={{ marginBottom: 12 }}>{error}</div>
          <button
            onClick={() => void load(page, search)}
            style={{
              padding: '8px 20px', borderRadius: 9, border: 'none',
              background: '#4f46e5', color: '#fff', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
            }}
          >
            {t('div.retry')}
          </button>
        </div>
      ) : divisions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted, #9aa1ad)', fontSize: 14 }}>
          {t('div.notFound')}
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
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted, #9aa1ad)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    {t('div.colName')}
                  </th>
                  <th style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted, #9aa1ad)', textTransform: 'uppercase', letterSpacing: '.04em', width: 80 }}>
                    {t('div.colColor')}
                  </th>
                  <th style={{ padding: '11px 16px', textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted, #9aa1ad)', textTransform: 'uppercase', letterSpacing: '.04em', width: 80 }}>
                    {t('div.colOrder')}
                  </th>
                  <th style={{ padding: '11px 16px', textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted, #9aa1ad)', textTransform: 'uppercase', letterSpacing: '.04em', width: 100 }}>
                    {t('div.colDepts')}
                  </th>
                  <th style={{ padding: '11px 16px', textAlign: 'right', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted, #9aa1ad)', textTransform: 'uppercase', letterSpacing: '.04em', width: 100 }}>
                    {t('div.colActions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {divisions.map((division, idx) => (
                  <TableRow
                    key={division.id}
                    division={division}
                    index={(page - 1) * PAGE_SIZE + idx + 1}
                    onEdit={() => setModal({ open: true, division })}
                    onDelete={() => setDeleteTarget(division)}
                    onShowDepartments={() => setDepartmentsTarget(division)}
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
        <DivisionModal
          division={modal.division}
          onClose={() => setModal({ open: false, division: null })}
          onSave={handleSave}
          loading={saving}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          division={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={saving}
        />
      )}

      {departmentsTarget && (
        <DepartmentsListModal
          division={departmentsTarget}
          onClose={() => setDepartmentsTarget(null)}
        />
      )}
    </div>
  )
}

function TableRow({
  division,
  index,
  onEdit,
  onDelete,
  onShowDepartments,
}: {
  division: Division
  index: number
  onEdit: () => void
  onDelete: () => void
  onShowDepartments: () => void
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: division.color || '#4f46e5',
            flexShrink: 0,
          }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-heading, #1a1f2e)' }}>
              {division.name_uz}
            </div>
            {division.name_en && (
              <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 1 }}>
                {division.name_en}
              </div>
            )}
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 20, height: 20, borderRadius: 5,
            background: division.color || '#4f46e5',
          }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', fontFamily: 'monospace' }}>
            {division.color || '—'}
          </span>
        </div>
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text-secondary, #5b6270)', fontWeight: 600 }}>
        {division.order}
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        <button
          onClick={division.department_count > 0 ? onShowDepartments : undefined}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: 24, height: 22, padding: '0 8px',
            borderRadius: 6, fontSize: 12.5, fontWeight: 600, border: 'none',
            background: division.department_count > 0 ? '#ede9fe' : 'var(--bg-subtle, #f4f5f7)',
            color: division.department_count > 0 ? '#4f46e5' : 'var(--text-muted, #9aa1ad)',
            cursor: division.department_count > 0 ? 'pointer' : 'default',
            transition: 'background .12s',
          }}
          onMouseEnter={e => {
            if (division.department_count > 0)
              (e.currentTarget as HTMLButtonElement).style.background = '#ddd6fe'
          }}
          onMouseLeave={e => {
            if (division.department_count > 0)
              (e.currentTarget as HTMLButtonElement).style.background = '#ede9fe'
          }}
        >
          {division.department_count}
        </button>
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
