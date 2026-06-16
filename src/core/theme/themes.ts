export type ThemeName = 'indigo'

export interface ThemePreset {
  name: ThemeName
  label: string
  accent: string
  accentSoft: string
  accentRing: string
  accentDark: string
  accentSoftDark: string
  accentRingDark: string
}

export const THEME_PRESETS: Record<ThemeName, ThemePreset> = {
  indigo: {
    name: 'indigo', label: 'Indigo',
    accent: '#4f46e5', accentSoft: '#eef2ff', accentRing: 'rgba(79,70,229,.32)',
    accentDark: '#6366f1', accentSoftDark: '#1e1f3e', accentRingDark: 'rgba(99,102,241,.35)',
  },
}

export const THEME_LIST = Object.values(THEME_PRESETS)
