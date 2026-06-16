import type { ReactNode } from 'react'
import { useTheme } from './useTheme'

export function AppThemeProvider({ children }: { children: ReactNode }) {
  useTheme()
  return <>{children}</>
}
