import { getStatusColors } from '@shared/utils/pillStyles'

interface Props {
  statusKey: string
  label: string
}

export function StatusBadge({ statusKey, label }: Props) {
  const { color, bg } = getStatusColors(statusKey)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, fontWeight: 600, color, background: bg,
      borderRadius: 8, padding: '4px 10px', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}
