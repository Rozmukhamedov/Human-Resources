import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function IncidentsTab() {
  const { t } = useTranslation(['employees', 'common'])
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
        {t('profile.incidents')}
      </div>
      <div style={{ padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-heading)', marginBottom: 6 }}>
            {t('common:noResults')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 280 }}>
            {t('profile.incidents')} — {t('common:noResults').toLowerCase()}
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
          {t('common:actions.create')}
        </button>
      </div>
    </div>
  )
}
