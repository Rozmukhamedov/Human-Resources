import { Suspense, useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@core/store/uiStore'
import { SectionHeader } from '@shared/ui/SectionHeader/SectionHeader'

function NavItem({ label, path, badge }: { label: string; path: string; badge?: number }) {
  const navigate = useNavigate()
  const location = useLocation()
  const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => navigate(path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 11px',
        borderRadius: 10, fontSize: 13.5, cursor: 'pointer', marginBottom: 1,
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--accent)' : hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: active ? 'var(--accent-soft)' : hovered ? 'var(--bg-subtle)' : 'transparent',
        transition: 'background .12s, color .12s',
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: active ? 'var(--accent)' : hovered ? 'var(--text-secondary)' : 'var(--border-color)',
        transition: 'background .12s',
      }} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge ? <span style={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, borderRadius: 8, padding: '1px 7px' }}>{badge}</span> : null}
    </div>
  )
}

function NavPanel() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useUIStore()
  const [profileHovered, setProfileHovered] = useState(false)
  const [logoutHovered, setLogoutHovered] = useState(false)
  const profileActive = location.pathname === '/profile'

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation()
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ width: 264, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>

      {/* Brand — same 58px height as TopBar */}
      <div style={{ height: 58, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 15, color: 'var(--text-heading)', letterSpacing: '-.01em', lineHeight: 1.2 }}>{t('brand')}</div>
          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.2 }}>{t('brandSub')}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px 20px' }}>
        <div style={{ marginTop: 10 }}>
          <SectionHeader label={t('sec.dash')} />
          <NavItem label={t('nav.workSchedule')} path="/" />
        </div>
        <div style={{ marginTop: 10 }}>
          <SectionHeader label={t('sec.company')} />
          <NavItem label={t('nav.employees')} path="/employees" />
          <NavItem label={t('nav.departments')} path="/departments" />
          <NavItem label={t('nav.organizations')} path="/organizations" />
          <NavItem label={t('nav.supervisorStruct')} path="/org/supervisor" />
          <NavItem label={t('nav.orgStruct')} path="/org/structure" />
        </div>
        <div style={{ marginTop: 10 }}>
          <SectionHeader label={t('sec.eval')} />
          <NavItem label={t('nav.shifts')} path="/shifts" />
          <NavItem label={t('nav.leave')} path="/leave" />
          <NavItem label={t('nav.attendance')} path="/attendance" />
          <NavItem label={t('nav.assessments')} path="/assessments" />
        </div>
      </div>

      {/* Profile footer */}
      <div
        onClick={() => navigate('/profile')}
        onMouseEnter={() => setProfileHovered(true)}
        onMouseLeave={() => setProfileHovered(false)}
        style={{
          padding: '12px 14px', borderTop: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          background: profileActive ? 'var(--accent-soft)' : profileHovered ? 'var(--bg-subtle)' : 'transparent',
          transition: 'background .12s',
        }}
      >
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: profileActive ? 'var(--accent)' : 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: profileActive ? '#fff' : 'var(--accent)', fontSize: 13, flexShrink: 0, transition: 'background .12s, color .12s' }}>{t('adminInitials')}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: profileActive ? 'var(--accent)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('adminName')}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('adminRole')}</div>
        </div>
        <div
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
          title="Chiqish"
          style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: logoutHovered ? '#fee2e2' : 'transparent', color: logoutHovered ? '#ef4444' : 'var(--text-muted)', transition: 'background .12s, color .12s' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </div>
      </div>
    </div>
  )
}

const LANGS = [
  { code: 'uz', label: 'O\'zbekcha', flag: '🇺🇿' },
  { code: 'en', label: 'English',   flag: '🇬🇧' },
  { code: 'ru', label: 'Русский',   flag: '🇷🇺' },
] as const

function LangSelect() {
  const { i18n } = useTranslation()
  const { lang, setLang } = useUIStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0]

  const handleSelect = (code: 'uz' | 'en' | 'ru') => {
    setLang(code)
    void i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
          borderRadius: 9, cursor: 'pointer', userSelect: 'none',
          background: 'var(--bg-subtle)', border: '1px solid var(--border-color)',
          fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
        }}
      >
        <span style={{ fontSize: 15 }}>{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}><polyline points="6 9 12 15 18 9"/></svg>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200,
          background: 'var(--surface)', border: '1px solid var(--border-color)',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 150, overflow: 'hidden',
        }}>
          {LANGS.map((l) => (
            <div
              key={l.code}
              onClick={() => handleSelect(l.code)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '9px 14px',
                cursor: 'pointer', fontSize: 13, fontWeight: l.code === lang ? 600 : 400,
                color: l.code === lang ? 'var(--accent)' : 'var(--text-primary)',
                background: l.code === lang ? 'var(--accent-soft)' : 'transparent',
              }}
              onMouseEnter={(e) => { if (l.code !== lang) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-subtle)' }}
              onMouseLeave={(e) => { if (l.code !== lang) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
            >
              <span style={{ fontSize: 16 }}>{l.flag}</span>
              <span>{l.label}</span>
              {l.code === lang && (
                <svg style={{ marginLeft: 'auto' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const NOTIFICATIONS = [
  { id: 1, type: 'leave',   title: "Yangi ta'til so'rovi",     body: 'Gulnora Tosheva — 3 kun',    time: '5 min oldin',   unread: true  },
  { id: 2, type: 'assess',  title: 'Attestatsiya yakunlandi',   body: 'Yuriy Mozjuxin — 87 ball',   time: '1 soat oldin',  unread: true  },
  { id: 3, type: 'hire',    title: "Yangi xodim qo'shildi",     body: 'Aziz Rahimov — Jarrohlik',   time: '3 soat oldin',  unread: false },
  { id: 4, type: 'leave',   title: "Ta'til tasdiqlandi",         body: 'Malika Yusupova — 7 kun',    time: 'Kecha',         unread: false },
  { id: 5, type: 'system',  title: 'Tizim yangilandi',           body: 'v2.4.1 muvaffaqiyatli',      time: '2 kun oldin',   unread: false },
]

const NOTIF_ICON: Record<string, React.ReactNode> = {
  leave:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  assess: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  hire:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  system: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
}

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(NOTIFICATIONS)
  const ref = useRef<HTMLDivElement>(null)
  const unreadCount = items.filter((n) => n.unread).length

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })))

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', background: open ? 'var(--bg-subtle)' : 'transparent', position: 'relative' }}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '2px solid var(--surface)' }} />
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200,
          background: 'var(--surface)', border: '1px solid var(--border-color)',
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,.14)', width: 320,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)' }}>Bildirishnomalar</span>
              {unreadCount > 0 && (
                <span style={{ background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '1px 6px' }}>{unreadCount}</span>
              )}
            </div>
            {unreadCount > 0 && (
              <span onClick={markAllRead} style={{ fontSize: 11, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Barchasini o'qildi</span>
            )}
          </div>

          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {items.map((notif) => (
              <div
                key={notif.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  background: notif.unread ? 'var(--accent-soft)' : 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => setItems((prev) => prev.map((n) => n.id === notif.id ? { ...n, unread: false } : n))}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>
                  {NOTIF_ICON[notif.type] ?? NOTIF_ICON.system}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.title}</span>
                    {notif.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.body}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{notif.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '10px 16px', textAlign: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Barchasini ko'rish</span>
          </div>
        </div>
      )}
    </div>
  )
}

function DarkModeToggle() {
  const { colorMode, setColorMode } = useUIStore()
  const dark = colorMode === 'dark'

  return (
    <div
      onClick={() => setColorMode(dark ? 'light' : 'dark')}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', background: 'var(--bg-subtle)' }}
    >
      {dark ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </div>
  )
}

function TopBar() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const buildTabs = (): { label: string; path: string; closable: boolean }[] => {
    const p = location.pathname
    if (p === '/') return [{ label: t('titles.dashboard'), path: '/', closable: false }]
    if (p.startsWith('/employees/') && params.id) return [
      { label: t('titles.employees'), path: '/employees', closable: false },
      { label: params.id, path: p, closable: true },
    ]
    if (p.startsWith('/assessments/') && params.id) return [
      { label: t('titles.assessments'), path: '/assessments', closable: false },
      { label: t('titles.assessmentDetail'), path: p, closable: true },
    ]
    if (p === '/employees')       return [{ label: t('titles.employees'),       path: p, closable: false }]
    if (p === '/leave')           return [{ label: t('titles.leave'),            path: p, closable: false }]
    if (p === '/shifts')          return [{ label: t('titles.shifts'),           path: p, closable: false }]
    if (p === '/attendance')      return [{ label: t('titles.attendance'),       path: p, closable: false }]
    if (p === '/assessments')     return [{ label: t('titles.assessments'),      path: p, closable: false }]
    if (p === '/org/supervisor')  return [{ label: t('titles.supervisorStruct'), path: p, closable: false }]
    if (p === '/org/structure')   return [{ label: t('titles.orgStruct'),        path: p, closable: false }]
    if (p === '/organizations')   return [{ label: t('titles.organizations'),    path: p, closable: false }]
    if (p === '/departments')     return [{ label: t('titles.departments'),      path: p, closable: false }]
    if (p === '/profile')         return [{ label: t('adminName'),               path: p, closable: false }]
    return [{ label: t('titles.dashboard'), path: '/', closable: false }]
  }

  const tabs = buildTabs()

  return (
    <div style={{ height: 58, flexShrink: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 18px 0 8px', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: '100%', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {tabs.map((tab) => (
          <div
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex', alignItems: 'center', padding: '0 14px', height: '100%',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', borderBottom: '2px solid',
              borderColor: location.pathname === tab.path || (!tab.closable && tab.path !== '/' && location.pathname.startsWith(tab.path)) ? 'var(--accent,#4f46e5)' : 'transparent',
              color: location.pathname === tab.path || (!tab.closable && tab.path !== '/' && location.pathname.startsWith(tab.path)) ? 'var(--accent,#4f46e5)' : 'var(--text-secondary)',
            }}
          >
            <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
            {tab.closable && (
              <span onClick={(e) => { e.stopPropagation(); navigate('/') }} style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: 15, lineHeight: 1, cursor: 'pointer' }}>×</span>
            )}
          </div>
        ))}
      </div>

      <LangSelect />
      <DarkModeToggle />
      <div style={{ width: 1, height: 24, background: 'var(--border-color)', margin: '0 2px' }} />
      <NotificationBell />
    </div>
  )
}

export function AppLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: 'var(--bg-base)', fontFamily: "'Public Sans', sans-serif" }}>
      <NavPanel />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-content)' }}>
        <TopBar />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Yuklanmoqda...</div>}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
