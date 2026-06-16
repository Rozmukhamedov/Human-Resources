interface Props {
  label: string
}

export function SectionHeader({ label }: Props) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em',
      color: 'var(--text-muted)', padding: '6px 10px', textTransform: 'uppercase',
    }}>
      {label}
    </div>
  )
}
