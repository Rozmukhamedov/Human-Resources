import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@core/store/uiStore'

const CREDENTIALS = { email: 'admin@kpi.uz', password: 'admin123' }

export function LoginPage() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const { login, lang, setLang, colorMode, setColorMode } = useUIStore()

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [remember, setRemember]   = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [emailFocus, setEmailFocus] = useState(false)
  const [passFocus,  setPassFocus]  = useState(false)

  const handleLang = (code: 'uz' | 'en' | 'ru') => {
    setLang(code)
    void i18n.changeLanguage(code)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError("Barcha maydonlarni to'ldiring"); return }
    if (email !== CREDENTIALS.email || password !== CREDENTIALS.password) {
      setError("Email yoki parol noto'g'ri")
      return
    }
    setLoading(true)
    setTimeout(() => { login(); navigate('/', { replace: true }) }, 700)
  }

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%', padding: '11px 14px', fontSize: 14, borderRadius: 10,
    border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--border-color)'}`,
    outline: 'none', background: 'var(--bg-subtle)', color: 'var(--text-primary)',
    boxSizing: 'border-box', transition: 'border-color .15s',
  })

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: "'Public Sans', sans-serif" }}>

      {/* ── Left panel (brand, always indigo) ── */}
      <div style={{
        width: '42%', flexShrink: 0, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #3730a3 0%, #4f46e5 50%, #6366f1 100%)',
        display: 'flex', flexDirection: 'column', padding: '40px 48px',
      }}>
        <div style={{ position: 'absolute', top: -80,   right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 17, color: '#fff', letterSpacing: '-.01em' }}>Human Resources</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>HR management system</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', marginBottom: 'auto', position: 'relative' }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 34, color: '#fff', lineHeight: 1.2, letterSpacing: '-.02em', marginBottom: 16 }}>
            Xodimlarni boshqarish<br />yangi darajada
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', lineHeight: 1.6, maxWidth: 320 }}>
            Kadrlar bo'limini boshqarish, hisobotlar va ko'p narsalar bir joyda.
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', position: 'relative' }}>
          © 2026 KPI Hospital · HR System v2.4
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, background: 'var(--bg-content)', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, padding: '20px 32px' }}>
          <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
            {(['uz', 'en', 'ru'] as const).map((code) => (
              <div
                key={code}
                onClick={() => handleLang(code)}
                style={{ padding: '6px 12px', fontSize: 12, fontWeight: lang === code ? 700 : 500, cursor: 'pointer', background: lang === code ? 'var(--accent)' : 'transparent', color: lang === code ? '#fff' : 'var(--text-secondary)', transition: 'all .15s' }}
              >
                {code.toUpperCase()}
              </div>
            ))}
          </div>

          <div
            onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}
            style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--surface)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            {colorMode === 'dark'
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </div>
        </div>

        {/* Form area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px 60px' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 26, color: 'var(--text-heading)', letterSpacing: '-.02em' }}>Xush kelibsiz 👋</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>Tizimga kirish uchun ma'lumotlaringizni kiriting</div>
            </div>

            {/* Demo hint */}
            <div style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-ring)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12.5, color: 'var(--accent)' }}>
              <span style={{ fontWeight: 700 }}>Demo:</span> admin@kpi.uz / admin123
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>Email</label>
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)} onBlur={() => setEmailFocus(false)}
                  placeholder="admin@kpi.uz"
                  style={inputStyle(emailFocus)}
                  autoComplete="email"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Parol</label>
                  <span style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}>Parolni unutdingizmi?</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPassFocus(true)} onBlur={() => setPassFocus(false)}
                    placeholder="••••••••"
                    style={{ ...inputStyle(passFocus), paddingRight: 42 }}
                    autoComplete="current-password"
                  />
                  <div
                    onClick={() => setShowPass((v) => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                  >
                    {showPass
                      ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </div>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                <div
                  onClick={() => setRemember((v) => !v)}
                  style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${remember ? 'var(--accent)' : 'var(--border-color)'}`, background: remember ? 'var(--accent)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}
                >
                  {remember && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Eslab qolish</span>
              </label>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '12px', fontSize: 14, fontWeight: 700,
                  borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? 'var(--accent-ring)' : 'var(--accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity .15s', opacity: loading ? 0.7 : 1, marginTop: 4,
                }}
              >
                {loading
                  ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Kirish...</>
                  : 'Kirish'
                }
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
