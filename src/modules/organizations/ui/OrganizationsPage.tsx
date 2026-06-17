import { useState } from 'react'

interface Organization {
  id: number
  name: string
  head: string
  status: 'filled' | 'unfilled'
  employees: number
  rating: number
  trend: number
  iconBg: string
  iconColor: string
}

const INITIAL_ORGS: Organization[] = [
  { id: 1,  name: "Nevrologiya bo'limi",             head: 'Dilshod Rahmonov',  status: 'filled',   employees: 28,  rating: 98.4, trend: 2.1,  iconBg: '#ede9fe', iconColor: '#7c3aed' },
  { id: 2,  name: "Otorinolaringologiya bo'limi",    head: 'Otabek Nazarov',    status: 'filled',   employees: 126, rating: 97.2, trend: 1.4,  iconBg: '#d1fae5', iconColor: '#059669' },
  { id: 3,  name: "2-jarroxlik bo'limi",             head: 'Bekzod Qodirov',   status: 'filled',   employees: 60,  rating: 96.8, trend: -0.6, iconBg: '#fef3c7', iconColor: '#d97706' },
  { id: 4,  name: "Gepatologiya bo'limi",            head: 'Dilshod Rahmonov',  status: 'filled',   employees: 46,  rating: 99.1, trend: 3.0,  iconBg: '#ede9fe', iconColor: '#7c3aed' },
  { id: 5,  name: "Chaqaloqlar patologiyasi bo'limi",head: 'Dilshod Rahmonov',  status: 'filled',   employees: 34,  rating: 95.5, trend: 0.8,  iconBg: '#d1fae5', iconColor: '#059669' },
  { id: 6,  name: "Jarroxlik reanimatsiya bo'limi",  head: 'Nodira Saidova',   status: 'filled',   employees: 31,  rating: 98.0, trend: 1.2,  iconBg: '#fce7f3', iconColor: '#db2777' },
  { id: 7,  name: "Gastroenterologiya bo'limi",      head: 'Gulnora Tosheva',  status: 'filled',   employees: 30,  rating: 97.6, trend: 0.4,  iconBg: '#fef3c7', iconColor: '#d97706' },
  { id: 8,  name: "Radiologiya bo'limi",             head: 'Otabek Nazarov',    status: 'unfilled', employees: 23,  rating: 96.0, trend: -1.1, iconBg: '#d1fae5', iconColor: '#059669' },
  { id: 9,  name: "Fizioterapiya bo'limi",           head: 'Dilshod Rahmonov',  status: 'unfilled', employees: 17,  rating: 94.2, trend: 0.2,  iconBg: '#fef3c7', iconColor: '#d97706' },
  { id: 10, name: "Kardiorevmotologiya bo'limi",     head: 'Aziz Karimov',     status: 'filled',   employees: 42,  rating: 96.5, trend: 1.8,  iconBg: '#fce7f3', iconColor: '#db2777' },
  { id: 11, name: "Allergologiya bo'limi",           head: 'Malika Yusupova',  status: 'filled',   employees: 19,  rating: 95.8, trend: 0.5,  iconBg: '#dbeafe', iconColor: '#2563eb' },
  { id: 12, name: "Dorixona",                        head: 'Sarvar Xolmatov',  status: 'unfilled', employees: 11,  rating: 93.0, trend: -0.3, iconBg: '#dbeafe', iconColor: '#2563eb' },
]

const ICON_BG_OPTIONS = [
  { bg: '#ede9fe', color: '#7c3aed' },
  { bg: '#d1fae5', color: '#059669' },
  { bg: '#fef3c7', color: '#d97706' },
  { bg: '#fce7f3', color: '#db2777' },
  { bg: '#dbeafe', color: '#2563eb' },
  { bg: '#fee2e2', color: '#dc2626' },
]

function BuildingIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M9 22V12h6v10"/>
      <path d="M9 7h1M14 7h1M9 12h1M14 12h1"/>
    </svg>
  )
}

function OrgCard({ org, onEdit }: { org: Organization; onEdit: (org: Organization) => void }) {
  const trendPositive = org.trend >= 0

  return (
    <div
      style={{
        background: 'var(--surface, #fff)',
        border: '1px solid var(--border-color, #ebedf1)',
        borderRadius: 16,
        padding: '18px 20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        cursor: 'pointer',
        transition: 'box-shadow .15s, border-color .15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = '0 6px 20px rgba(0,0,0,.09)'
        el.style.borderColor = '#c8cdd8'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = ''
        el.style.borderColor = 'var(--border-color, #ebedf1)'
      }}
      onClick={() => onEdit(org)}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: org.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <BuildingIcon color={org.iconColor} />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading, #1a1f2e)', lineHeight: 1.3 }}>
              {org.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
              {org.head}
            </div>
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px',
          background: org.status === 'filled' ? '#d1fae5' : '#fef3c7',
          color: org.status === 'filled' ? '#059669' : '#d97706',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {org.status === 'filled' ? "To'ldirilgan" : "To'ldirilmagan"}
        </span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-heading, #1a1f2e)', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-.02em', lineHeight: 1.1 }}>
                {org.employees}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted, #9aa1ad)', marginTop: 3 }}>Xodimlar</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#4f46e5', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-.02em', lineHeight: 1.1 }}>
                {org.rating.toFixed(1)}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted, #9aa1ad)', marginTop: 3 }}>O'rtacha baho</div>
            </div>
          </div>
        </div>
        <div style={{
          fontSize: 12.5, fontWeight: 700,
          color: trendPositive ? '#059669' : '#dc2626',
        }}>
          {trendPositive ? '↑' : '↓'} {trendPositive ? '+' : ''}{org.trend.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}

interface ModalProps {
  org: Organization | null
  onClose: () => void
  onSave: (org: Organization) => void
  isNew: boolean
}

function OrgModal({ org, onClose, onSave, isNew }: ModalProps) {
  const [form, setForm] = useState<Omit<Organization, 'id'>>(() => org
    ? { name: org.name, head: org.head, status: org.status, employees: org.employees, rating: org.rating, trend: org.trend, iconBg: org.iconBg, iconColor: org.iconColor }
    : { name: '', head: '', status: 'filled', employees: 0, rating: 0, trend: 0, iconBg: ICON_BG_OPTIONS[0].bg, iconColor: ICON_BG_OPTIONS[0].color }
  )

  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.head.trim()) return
    onSave({ id: org?.id ?? Date.now(), ...form })
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
    fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #5b6270)',
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
        borderRadius: 20,
        width: 520,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,.18)',
        fontFamily: "'Public Sans', sans-serif",
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border-color, #ebedf1)',
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-heading, #1a1f2e)' }}>
              {isNew ? "Yangi tashkilot qo'shish" : "Tashkilotni tahrirlash"}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
              {isNew ? "Bo'lim ma'lumotlarini kiriting" : "Ma'lumotlarni yangilang"}
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>Bo'lim nomi *</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Masalan: Kardiologiya bo'limi"
              required
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>

          {/* Head */}
          <div>
            <label style={labelStyle}>Bo'lim rahbari *</label>
            <input
              style={inputStyle}
              value={form.head}
              onChange={e => set('head', e.target.value)}
              placeholder="Ism va familiya"
              required
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
            />
          </div>

          {/* Employees + Rating */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Xodimlar soni</label>
              <input
                style={inputStyle}
                type="number" min={0}
                value={form.employees}
                onChange={e => set('employees', Number(e.target.value))}
                onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
              />
            </div>
            <div>
              <label style={labelStyle}>O'rtacha baho</label>
              <input
                style={inputStyle}
                type="number" min={0} max={100} step={0.1}
                value={form.rating}
                onChange={e => set('rating', Number(e.target.value))}
                onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
              />
            </div>
          </div>

          {/* Trend + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Trend (%)</label>
              <input
                style={inputStyle}
                type="number" step={0.1}
                value={form.trend}
                onChange={e => set('trend', Number(e.target.value))}
                placeholder="Masalan: 2.1"
                onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
              />
            </div>
            <div>
              <label style={labelStyle}>Holat</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.status}
                onChange={e => set('status', e.target.value as 'filled' | 'unfilled')}
                onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
              >
                <option value="filled">To'ldirilgan</option>
                <option value="unfilled">To'ldirilmagan</option>
              </select>
            </div>
          </div>

          {/* Icon color */}
          <div>
            <label style={labelStyle}>Rang</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {ICON_BG_OPTIONS.map(opt => (
                <button
                  key={opt.bg}
                  type="button"
                  onClick={() => { set('iconBg', opt.bg); set('iconColor', opt.color) }}
                  style={{
                    width: 34, height: 34, borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    outline: form.iconBg === opt.bg ? `2.5px solid ${opt.color}` : '2.5px solid transparent',
                    outlineOffset: 2,
                    transition: 'outline .1s',
                  }}
                >
                  <BuildingIcon color={opt.color} />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '10px 0', border: '1.5px solid var(--border-color, #e4e7ef)',
                borderRadius: 10, background: 'transparent', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary, #5b6270)',
                fontFamily: 'inherit', transition: 'background .12s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-subtle, #f4f5f7)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              style={{
                flex: 1, padding: '10px 0', border: 'none',
                borderRadius: 10, background: '#4f46e5', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 600, color: '#fff',
                fontFamily: 'inherit', transition: 'background .12s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#4338ca')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#4f46e5')}
            >
              {isNew ? "Qo'shish" : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>(INITIAL_ORGS)
  const [modalState, setModalState] = useState<{ open: boolean; org: Organization | null; isNew: boolean }>({
    open: false, org: null, isNew: true,
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'filled' | 'unfilled'>('all')

  const filtered = orgs.filter(o => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.head.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleSave = (org: Organization) => {
    if (modalState.isNew) {
      setOrgs(prev => [...prev, org])
    } else {
      setOrgs(prev => prev.map(o => o.id === org.id ? org : o))
    }
    setModalState({ open: false, org: null, isNew: true })
  }

  return (
    <div style={{ padding: '18px 24px 40px', fontFamily: "'Public Sans', sans-serif" }}>
      {/* Page header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-heading, #1a1f2e)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Tashkilotlar
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted, #9aa1ad)', marginTop: 2 }}>
            Jami {orgs.length} ta bo'lim
          </div>
        </div>
        <button
          onClick={() => setModalState({ open: true, org: null, isNew: true })}
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Yaratish
        </button>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{
          position: 'relative', flex: '1 1 240px', maxWidth: 340,
        }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9aa1ad', pointerEvents: 'none' }}
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            style={{
              width: '100%', boxSizing: 'border-box',
              border: '1.5px solid var(--border-color, #e4e7ef)', borderRadius: 10,
              padding: '9px 13px 9px 34px', fontSize: 13.5,
              color: 'var(--text-primary, #2a2f3a)', background: 'var(--surface, #fff)',
              outline: 'none', fontFamily: 'inherit',
            }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Qidirish..."
            onFocus={e => (e.target.style.borderColor = '#4f46e5')}
            onBlur={e => (e.target.style.borderColor = 'var(--border-color, #e4e7ef)')}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'filled', 'unfilled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                padding: '8px 14px', borderRadius: 9, border: '1.5px solid',
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                borderColor: statusFilter === f ? '#4f46e5' : 'var(--border-color, #e4e7ef)',
                background: statusFilter === f ? '#ede9fe' : 'var(--surface, #fff)',
                color: statusFilter === f ? '#4f46e5' : 'var(--text-secondary, #5b6270)',
                transition: 'all .12s',
              }}
            >
              {f === 'all' ? "Barchasi" : f === 'filled' ? "To'ldirilgan" : "To'ldirilmagan"}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted, #9aa1ad)', fontSize: 14 }}>
          Natija topilmadi
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {filtered.map(org => (
            <OrgCard
              key={org.id}
              org={org}
              onEdit={o => setModalState({ open: true, org: o, isNew: false })}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalState.open && (
        <OrgModal
          org={modalState.org}
          isNew={modalState.isNew}
          onClose={() => setModalState({ open: false, org: null, isNew: true })}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
