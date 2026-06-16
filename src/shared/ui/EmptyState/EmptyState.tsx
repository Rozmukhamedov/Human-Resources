interface Props {
  message: string
}

export function EmptyState({ message }: Props) {
  return (
    <div style={{ padding: '48px', textAlign: 'center', color: '#a3a9b4', fontSize: 14 }}>
      {message}
    </div>
  )
}
