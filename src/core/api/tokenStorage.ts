const KEYS = { access: 'hr_access', refresh: 'hr_refresh' } as const

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`
}

export const tokenStorage = {
  getAccess: () => getCookie(KEYS.access),
  getRefresh: () => getCookie(KEYS.refresh),
  setTokens: (access: string, refresh: string) => {
    setCookie(KEYS.access, access, 1)    // 1 day
    setCookie(KEYS.refresh, refresh, 7)  // 7 days
  },
  clear: () => {
    deleteCookie(KEYS.access)
    deleteCookie(KEYS.refresh)
  },
  hasToken: () => !!getCookie(KEYS.access) || !!getCookie(KEYS.refresh),
}
