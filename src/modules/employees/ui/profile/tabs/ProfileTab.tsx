import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { employees } from '@data/employees'

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-heading)', marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  )
}

function LinkRow({ icon, label, value, href }: { icon: 'email' | 'phone'; label: string; value: string; href: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
        {icon === 'email' ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.1 12 19.79 19.79 0 0 1 1.07 3.18 2 2 0 0 1 3.04 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 5.99 5.99l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
        <a href={href} style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>{value}</a>
      </div>
    </div>
  )
}

export function ProfileTab() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('employees')
  const emp = employees.find(e => e.id === id) ?? employees[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <InfoCard title={t('profile.links')}>
        <LinkRow icon="email" label={t('profile.email')} value={emp.email}  href={`mailto:${emp.email}`} />
        <LinkRow icon="phone" label={t('profile.phone')} value={emp.phone}  href={`tel:${emp.phone}`} />
      </InfoCard>
    </div>
  )
}
