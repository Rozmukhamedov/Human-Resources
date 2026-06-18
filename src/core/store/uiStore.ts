import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeName } from '@core/theme/themes'
import type { AuthUser } from '@core/api/auth'
import { logoutApi } from '@core/api/auth'
import { tokenStorage } from '@core/api/tokenStorage'

type Lang = 'uz' | 'en' | 'ru'
export type ColorMode = 'light' | 'dark'
type ProfileTab = 'profile' | 'leave' | 'activities' | 'assess' | 'incidents'

interface UIState {
  lang: Lang
  themeName: ThemeName
  colorMode: ColorMode
  isAuthenticated: boolean
  user: AuthUser | null
  selectedEmployeeId: string | null
  profileTab: ProfileTab
  orgLevel: number
  setLang: (lang: Lang) => void
  setTheme: (name: ThemeName) => void
  setColorMode: (mode: ColorMode) => void
  login: (user: AuthUser) => void
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
      // derive initial auth state from cookie — not from persisted store
      isAuthenticated: tokenStorage.hasToken(),
      user: null,
      selectedEmployeeId: null,
      profileTab: 'profile',
      orgLevel: 2,
      setLang: (lang) => set({ lang }),
      setTheme: (themeName) => set({ themeName }),
      setColorMode: (colorMode) => set({ colorMode }),
      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => { logoutApi(); set({ isAuthenticated: false, user: null }) },
      setSelectedEmployee: (id) => set({ selectedEmployeeId: id, profileTab: 'profile' }),
      setProfileTab: (tab) => set({ profileTab: tab }),
      setOrgLevel: (orgLevel) => set({ orgLevel }),
    }),
    {
      name: 'hr-ui',
      // isAuthenticated is NOT persisted — derived from cookie on every load
      partialize: (s) => ({
        lang: s.lang,
        themeName: s.themeName,
        colorMode: s.colorMode,
        user: s.user,
      }),
    }
  )
)
