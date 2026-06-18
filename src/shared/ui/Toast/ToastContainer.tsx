import { useEffect, useState } from 'react'
import { useToastStore, type Toast, type ToastType } from '@core/store/toastStore'

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  error:   { bg: '#fef2f2', border: '#fca5a5', icon: '#ef4444' },
  success: { bg: '#f0fdf4', border: '#86efac', icon: '#22c55e' },
  warning: { bg: '#fffbeb', border: '#fcd34d', icon: '#f59e0b' },
  info:    { bg: '#eff6ff', border: '#93c5fd', icon: '#3b82f6' },
}

const ICONS: Record<ToastType, React.ReactNode> = {
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [visible, setVisible] = useState(false)
  const colors = COLORS[toast.type]

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 10,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        boxShadow: '0 4px 16px rgba(0,0,0,.1)',
        minWidth: 280,
        maxWidth: 380,
        transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 24px))',
        opacity: visible ? 1 : 0,
        transition: 'transform .25s ease, opacity .25s ease',
      }}
    >
      <div style={{ color: colors.icon, flexShrink: 0, marginTop: 1 }}>{ICONS[toast.type]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{toast.title}</div>
        {toast.message && (
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{toast.message}</div>
        )}
      </div>
      <div
        onClick={handleClose}
        style={{ cursor: 'pointer', color: '#9ca3af', flexShrink: 0, marginTop: 1 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}
