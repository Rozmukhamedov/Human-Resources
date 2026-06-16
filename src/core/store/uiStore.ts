import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeName } from '@core/theme/themes'

type Lang = 'uz' | 'en' | 'ru'
export type ColorMode = 'light' | 'dark'
type ProfileTab = 'profile' | 'leave' | 'activities' | 'assess' | 'incidents'

interface UIState {
  lang: Lang
  themeName: ThemeName
  colorMode: ColorMode
  isAuthenticated: boolean
  selectedEmployeeId: string | null
  profileTab: ProfileTab
  orgLevel: number
  setLang: (lang: Lang) => void
  setTheme: (name: ThemeName) => void
  setColorMode: (mode: ColorMode) => void
  login: () => void
  logout: () => void
  setSelectedEmployee: (id: string | null) => void
  setProfileTab: (tab: ProfileTab) => void
  setOrgLevel: (level: number) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      lang: 'uz',
      themeName: 'indigo',
      colorMode: 'light',
      isAuthenticated: false,
      selectedEmployeeId: null,
      profileTab: 'profile',
      orgLevel: 2,
      setLang: (lang) => set({ lang }),
      setTheme: (themeName) => set({ themeName }),
      setColorMode: (colorMode) => set({ colorMode }),
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),
      setSelectedEmployee: (id) => set({ selectedEmployeeId: id, profileTab: 'profile' }),
      setProfileTab: (tab) => set({ profileTab: tab }),
      setOrgLevel: (orgLevel) => set({ orgLevel }),
    }),
    { name: 'hr-ui', partialize: (s) => ({ lang: s.lang, themeName: s.themeName, colorMode: s.colorMode, isAuthenticated: s.isAuthenticated }) }
  )
)
