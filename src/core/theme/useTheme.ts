import { useEffect } from 'react'
import { useUIStore } from '@core/store/uiStore'
import { THEME_PRESETS } from './themes'

export function useTheme() {
  const themeName = useUIStore((s) => s.themeName)
  const colorMode = useUIStore((s) => s.colorMode)
  const preset = THEME_PRESETS[themeName]

  useEffect(() => {
    document.documentElement.classList.toggle('dark', colorMode === 'dark')
  }, [colorMode])

  return { preset, colorMode }
}
