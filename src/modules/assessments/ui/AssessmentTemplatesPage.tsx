import { useState, useEffect, useCallback } from 'react'
import type { AssessmentTemplate, AssessmentTemplatePayload } from '../model/assessmentTemplate.types'
import {
  getAssessmentTemplates,
  createAssessmentTemplate,
  updateAssessmentTemplate,
  deleteAssessmentTemplate,
} from '../api/assessmentTemplates'

const PAGE_SIZE = 20

const COLORS = [
  { bg: '#ede9fe', color: '#7c3aed' },
  { bg: '#d1fae5', color: '#059669' },
  { bg: '#fef3c7', color: '#d97706' },
  { bg: '#fce7f3', color: '#db2777' },
  { bg: '#dbeafe', color: '#2563eb' },
  { bg: '#fee2e2', color: '#dc2626' },
]

const getColor = (id: number) => COLORS[Math.abs(id) % COLORS.length]

function TemplateIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

function TemplateCard({
  template,
  onEdit,
  onDelete,
}: {
  template: AssessmentTemplate
  onEdit: (t: AssessmentTemplate) => void
  onDelete: (t: AssessmentTemplate) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const c = getColor(template.id)

  return (
    <div
      style={{
        background: 'var(--surface, #fff)',
        border: '1px solid var(--border-color, #ebedf1)',
        borderRadius: 16,
        padding: '18px 20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'box-shadow .15s, border-color .15s',
        boxShadow: hovered ? '0 6px 20px rgba(0,0,0,.09)' : 'none',
        borderColor: hovered ? '#c8cdd8' : 'var(--border-color, #ebedf1)',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: c.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <TemplateIcon color={c.color} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 13.5, fontWeight: 700,
              color: 'var(--text-heading, #1a1f2e)', lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {template.name_uz}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {template.name_en || '—'}
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{
              width: 28, height: 28, borderRadius: 7, border: 'none',
              background: menuOpen ? 'var(--bg-subtle, #f4f5f7)' : 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--text-secondary, #5b6270)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 50,
              background: 'var(--surface, #fff)', border: '1px solid var(--border-color, #ebedf1)',
              borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 130, overflow: 'hidden',
            }}>
              <div
                onClick={() => { setMenuOpen(false); onEdit(template) }}
                style={{
                  padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                  color: 'var(--text-primary, #2a2f3a)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle, #f4f5f7)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Tahrirlash
              </div>
              <div
                onClick={() => { setMenuOpen(false); onDelete(template) }}
                style={{
                  padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                  color: '#ef4444',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                </svg>
                O'chirish
              </div>
            </div>
          )}
        </div>
      </div>

      {template.description && (
        <div style={{
          fontSize: 12.5, color: 'var(--text-secondary, #5b6270)',
          lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {template.description}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: c.bg, borderRadius: 7, padding: '4px 9px',
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: c.color }}>
            {template.competencies.length}
          </span>
          <span style={{ fontSize: 11.5, color: c.color }}>kompetensiya</span>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted, #9aa1ad)' }}>
          {formatDate(template.created_at)}
        </div>
      </div>
    </div>
  )
}

interface ModalProps {
  template: AssessmentTemplate | null
  onClose: () => void
  onSave: (data: AssessmentTemplatePayload) => Promise<void>
  loading: boolean
}

function TemplateModal({ template, onClose, onSave, loading }: ModalProps) {
  const [form, setForm] = useState<AssessmentTemplatePayload>(() =>
    template
      ? { name_uz: template.name_uz, name_en: template.name_en, description: template.description }
      : { name_uz: '', name_en: '', description: '' }
  )

  const set = <K extends keyof AssessmentTemplatePayload>(key: K, value: AssessmentTemplatePayload[K]) =>
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
              {template ? 'Shablonni tahrirlash' : 'Yangi shablon qo\'shish'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
              {template ? 'Ma\'lumotlarni yangilang' : 'Shablon ma\'lumotlarini kiriting'}
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
            <label style={labelStyle}>Nomi (UZ) *</label>
            <input
              style={inputStyle}
              value={form.name_uz}
              onChange={e => set('name_uz', e.target.value)}
              placeholder="Masalan: Rahbarlik kompetensiyalari"
              required
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>

          <div>
            <label style={labelStyle}>Nomi (EN)</label>
            <input
              style={inputStyle}
              value={form.name_en}
              onChange={e => set('name_en', e.target.value)}
              placeholder="e.g. Leadership Competencies"
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>

          <div>
            <label style={labelStyle}>Tavsif</label>
            <textarea
              style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Shablon haqida qisqacha ma'lumot..."
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
                fontFamily: 'inherit', transition: 'background .12s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-subtle, #f4f5f7)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
            >
              Bekor qilish
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
                fontFamily: 'inherit', transition: 'background .12s',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#4338ca' }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#4f46e5' }}
            >
              {loading ? 'Yuklanmoqda...' : template ? 'Saqlash' : 'Qo\'shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({
  template,
  onClose,
  onConfirm,
  loading,
}: {
  template: AssessmentTemplate
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
          Shablonni o'chirish
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--text-secondary, #5b6270)', lineHeight: 1.6, marginBottom: 24 }}>
          <strong>{template.name_uz}</strong> shablonini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
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
            {loading ? 'O\'chirilmoqda...' : 'O\'chirish'}
          </button>
        </div>
      </div>
    </div>
  )
}

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

export function AssessmentTemplatesPage() {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [modal, setModal] = useState<{ open: boolean; template: AssessmentTemplate | null }>({
    open: false, template: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<AssessmentTemplate | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const load = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAssessmentTemplates(p, PAGE_SIZE)
      setTemplates(data.data ?? [])
      setTotal(data.total_elements ?? 0)
    } catch (e) {
      setError((e as Error).message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(page)
  }, [page, load])

  const handleSave = async (data: AssessmentTemplatePayload) => {
    setSaving(true)
    try {
      if (modal.template) {
        const updated = await updateAssessmentTemplate(modal.template.id, data)
        setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t))
      } else {
        await createAssessmentTemplate(data)
        await load(page)
      }
      setModal({ open: false, template: null })
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
      await deleteAssessmentTemplate(deleteTarget.id)
      setDeleteTarget(null)
      if (templates.length === 1 && page > 1) {
        setPage(p => p - 1)
      } else {
        await load(page)
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
            Baholash shablonlari
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
            Jami {total} ta shablon
          </div>
        </div>
        <button
          onClick={() => setModal({ open: true, template: null })}
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

      {loading ? (
        <Spinner />
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#ef4444', fontSize: 14 }}>
          <div style={{ marginBottom: 12 }}>{error}</div>
          <button
            onClick={() => void load(page)}
            style={{
              padding: '8px 20px', borderRadius: 9, border: 'none',
              background: '#4f46e5', color: '#fff', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
            }}
          >
            Qayta urinish
          </button>
        </div>
      ) : templates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted, #9aa1ad)', fontSize: 14 }}>
          Shablonlar topilmadi
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}>
            {templates.map(t => (
              <TemplateCard
                key={t.id}
                template={t}
                onEdit={tmpl => setModal({ open: true, template: tmpl })}
                onDelete={tmpl => setDeleteTarget(tmpl)}
              />
            ))}
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
        <TemplateModal
          template={modal.template}
          onClose={() => setModal({ open: false, template: null })}
          onSave={handleSave}
          loading={saving}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          template={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={saving}
        />
      )}
    </div>
  )
}
