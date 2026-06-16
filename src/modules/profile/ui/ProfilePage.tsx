import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@core/store/uiStore'

const ADMIN = {
  initials: 'TA',
  firstName: 'Timur',
  lastName: 'Aliyev',
  email: 'timur.aliyev@kpi.uz',
  phone: '+998 90 123 45 67',
  dob: 'Mar 12, 1985',
  gender: 'Erkak',
  hireDate: 'Jan 15, 2018',
  dept: 'IT & Administration',
  position: 'System administrator',
}

const RECENT_ACTIVITY = [
  { id: 1, icon: '👤', text: "Gulnora Tosheva profili tahrirlandi", time: '2 soat oldin' },
  { id: 2, icon: '📋', text: "Yuriy Mozjuxin attestatsiyasi tasdiqlandi", time: '5 soat oldin' },
  { id: 3, icon: '📅', text: "May 2026 smena jadvali yaratildi", time: 'Kecha, 14:30' },
  { id: 4, icon: '✅', text: "Aziz Rahimov ta'til arizasi tasdiqlandi", time: 'Kecha, 11:00' },
  { id: 5, icon: '➕', text: "Yangi xodim: Rustam To'xtayev qo'shildi", time: '2 kun oldin' },
]

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
      <span style={{ color: 'var(--text-muted)', fontWeight: 500, minWidth: 160 }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '20px 24px', ...style }}>
      {children}
    </div>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-color)' }}>
      {children}
    </div>
  )
}

export function ProfilePage() {
  const { t, i18n } = useTranslation('common')
  const { lang, setLang, colorMode, setColorMode } = useUIStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ firstName: ADMIN.firstName, lastName: ADMIN.lastName, email: ADMIN.email, phone: ADMIN.phone })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleLang = (code: 'uz' | 'en' | 'ru') => {
    setLang(code)
    void i18n.changeLanguage(code)
  }

  const LANGS = [
    { code: 'uz' as const, label: "O'zbekcha", flag: '🇺🇿' },
    { code: 'en' as const, label: 'English',   flag: '🇬🇧' },
    { code: 'ru' as const, label: 'Русский',   flag: '🇷🇺' },
  ]

  return (
    <div style={{ padding: '18px 24px 40px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-heading)', fontFamily: "'Plus Jakarta Sans'" }}>Profil</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Shaxsiy ma'lumotlar va sozlamalar</div>
      </div>

      {/* Avatar hero card */}
      <Card style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20, padding: '24px 28px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'var(--accent)', flexShrink: 0, border: '3px solid var(--accent)', boxShadow: '0 0 0 4px var(--accent-soft)' }}>
          {ADMIN.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', fontFamily: "'Plus Jakarta Sans'" }}>
            {form.firstName} {form.lastName}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{ADMIN.position}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-soft)', borderRadius: 8, padding: '3px 10px' }}>
              {ADMIN.dept}
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#22c55e', background: '#f0fdf4', borderRadius: 8, padding: '3px 10px' }}>
              Faol
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {saved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#22c55e', fontWeight: 600, padding: '8px 14px', background: '#f0fdf4', borderRadius: 9, border: '1px solid #bbf7d0' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Saqlandi
            </div>
          )}
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} style={{ padding: '8px 16px', fontSize: 13, borderRadius: 9, border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}>
                Bekor qilish
              </button>
              <button onClick={handleSave} style={{ padding: '8px 16px', fontSize: 13, borderRadius: 9, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                Saqlash
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, borderRadius: 9, border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Tahrirlash
            </button>
          )}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Personal info */}
          <Card>
            <CardTitle>Shaxsiy ma'lumotlar</CardTitle>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {([
                  { key: 'firstName', label: t('profile.nameF', { ns: 'employees' }) },
                  { key: 'lastName',  label: t('profile.surnameF', { ns: 'employees' }) },
                  { key: 'email',     label: t('profile.email', { ns: 'employees' }) },
                  { key: 'phone',     label: t('profile.phone', { ns: 'employees' }) },
                ] as const).map(({ key, label }) => (
                  <div key={key}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5 }}>{label}</div>
                    <input
                      value={form[key]}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                      style={{
                        width: '100%', padding: '9px 12px', fontSize: 13, borderRadius: 9,
                        border: '1.5px solid var(--accent)', outline: 'none',
                        background: 'var(--bg-subtle)', color: 'var(--text-primary)',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <InfoRow label={t('profile.nameF', { ns: 'employees' })}    value={form.firstName} />
                <InfoRow label={t('profile.surnameF', { ns: 'employees' })} value={form.lastName} />
                <InfoRow label={t('profile.email', { ns: 'employees' })}    value={form.email} />
                <InfoRow label={t('profile.phone', { ns: 'employees' })}    value={form.phone} />
                <InfoRow label={t('profile.dob', { ns: 'employees' })}      value={ADMIN.dob} />
                <InfoRow label={t('profile.gender', { ns: 'employees' })}   value={t(`gender.${ADMIN.gender}`)} />
              </>
            )}
          </Card>

          {/* Employment info */}
          <Card>
            <CardTitle>Ish ma'lumotlari</CardTitle>
            <InfoRow label={t('profile.deptF', { ns: 'employees' })}      value={ADMIN.dept} />
            <InfoRow label={t('profile.positionF', { ns: 'employees' })}  value={ADMIN.position} />
            <InfoRow label={t('profile.hireDate', { ns: 'employees' })}   value={ADMIN.hireDate} />
            <InfoRow label={t('profile.code', { ns: 'employees' })}       value="ADM-001" />
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Preferences */}
          <Card>
            <CardTitle>Sozlamalar</CardTitle>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10 }}>Til / Language</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {LANGS.map((l) => (
                  <div
                    key={l.code}
                    onClick={() => handleLang(l.code)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                      borderRadius: 9, cursor: 'pointer', fontSize: 13,
                      border: `1.5px solid ${lang === l.code ? 'var(--accent)' : 'var(--border-color)'}`,
                      background: lang === l.code ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                      color: lang === l.code ? 'var(--accent)' : 'var(--text-primary)',
                      fontWeight: lang === l.code ? 600 : 400,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{l.flag}</span>
                    <span style={{ flex: 1 }}>{l.label}</span>
                    {lang === l.code && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 18 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10 }}>Interfeys ko'rinishi</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['light', 'dark'] as const).map((mode) => (
                  <div
                    key={mode}
                    onClick={() => setColorMode(mode)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      padding: '9px 0', borderRadius: 9, cursor: 'pointer', fontSize: 13,
                      border: `1.5px solid ${colorMode === mode ? 'var(--accent)' : 'var(--border-color)'}`,
                      background: colorMode === mode ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                      color: colorMode === mode ? 'var(--accent)' : 'var(--text-primary)',
                      fontWeight: colorMode === mode ? 600 : 400,
                    }}
                  >
                    {mode === 'light' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    )}
                    {mode === 'light' ? 'Kunduzgi' : 'Tungi'}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardTitle>So'nggi faoliyat</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {RECENT_ACTIVITY.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border-color)', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.4 }}>{item.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
