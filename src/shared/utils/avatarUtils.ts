const PALETTE: [string, string][] = [
  ['#eef2ff', '#4f46e5'],
  ['#e7f7ee', '#0f9d58'],
  ['#fdf3e3', '#d97706'],
  ['#fdeaea', '#dc2626'],
  ['#f5f1ff', '#7c3aed'],
  ['#eef4ff', '#2563eb'],
  ['#effcf9', '#0d9488'],
  ['#eef0f3', '#5b6270'],
  ['#fff0f9', '#db2777'],
  ['#fff7ed', '#ea580c'],
]

export function getAvatarColors(initials: string): { bg: string; color: string } {
  const idx = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % PALETTE.length
  const [bg, color] = PALETTE[idx]
  return { bg, color }
}
