import { tokenStorage } from './tokenStorage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

type FetchOptions = RequestInit & { _retry?: boolean }

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) return null

  const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })

  if (!res.ok) {
    tokenStorage.clear()
    return null
  }

  const data = (await res.json()) as { access: string }
  tokenStorage.setTokens(data.access, refresh)
  return data.access
}

export async function apiRequest<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const access = tokenStorage.getAccess()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (access) headers['Authorization'] = `Bearer ${access}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401 && !options._retry) {
    const newAccess = await refreshAccessToken()
    if (newAccess) {
      headers['Authorization'] = `Bearer ${newAccess}`
      const retryRes = await fetch(`${BASE_URL}${path}`, { ...options, headers, _retry: true } as FetchOptions)
      if (!retryRes.ok) throw new Error(`HTTP ${retryRes.status}`)
      return retryRes.json() as Promise<T>
    }
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
