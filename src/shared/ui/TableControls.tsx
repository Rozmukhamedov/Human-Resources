import { useState } from 'react'

export function CreateButton({ label, onClick }: { label: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 36, padding: '0 15px', borderRadius: 10,
        background: 'var(--accent)', color: '#fff',
        fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
        opacity: hovered ? 0.85 : 1, transition: 'opacity .12s',
        letterSpacing: '-.01em', flexShrink: 0,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      {label}
    </button>
  )
}

export function ActionButton({ label, onClick }: { label: string; onClick?: (e: React.MouseEvent) => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center',
        fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
        color: hovered ? 'var(--accent)' : 'var(--text-secondary)',
        cursor: 'pointer',
        border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border-color)'}`,
        borderRadius: 7, padding: '4px 11px',
        background: hovered ? 'var(--accent-soft)' : 'transparent',
        transition: 'color .12s, border-color .12s, background .12s',
      }}
    >
      {label}
    </span>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  width = 220,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  width?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      background: 'var(--bg-subtle)',
      border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--border-color)'}`,
      borderRadius: 10, padding: '0 11px',
      transition: 'border-color .15s', height: 36,
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          border: 'none', outline: 'none', background: 'transparent',
          fontSize: 13, color: 'var(--text-primary)', width,
        }}
      />
      {value && (
        <span
          onClick={() => onChange('')}
          style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0 }}
        >
          ×
        </span>
      )}
    </div>
  )
}
