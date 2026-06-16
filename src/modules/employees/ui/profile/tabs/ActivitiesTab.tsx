import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function ActivitiesTab() {
  const { t } = useTranslation('employees')
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border-color)',
      borderRadius: 16, overflow: 'hidden',
    }}>
      <div style={{
        padding: '15px 20px', borderBottom: '1px solid var(--border-color)',
        fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 16,
        color: 'var(--text-heading)', letterSpacing: '-.01em',
      }}>
        {t('profile.activities')}
      </div>
      <div style={{ padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-heading)', marginBottom: 6 }}>
            {t('profile.actEmptyTitle')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 280 }}>
            {t('profile.actEmptySub')}
          </div>
        </div>
        <button
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 10,
            background: 'var(--accent)', color: '#fff',
            fontSize: 13, fontWeight: 600, border: 'none',
            cursor: 'pointer', marginTop: 4,
            opacity: hovered ? 0.85 : 1, transition: 'opacity .12s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {t('profile.actBtn')}
        </button>
      </div>
    </div>
  )
}
