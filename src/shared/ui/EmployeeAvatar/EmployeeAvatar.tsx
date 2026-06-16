import { getAvatarColors } from '@shared/utils/avatarUtils'

interface Props {
  initials: string
  size?: number
  fontSize?: number
}

export function EmployeeAvatar({ initials, size = 34, fontSize = 12 }: Props) {
  const { bg, color } = getAvatarColors(initials)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 700,
    }}>
      {initials}
    </div>
  )
}
