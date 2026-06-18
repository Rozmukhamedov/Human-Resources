import { tokenStorage } from './tokenStorage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export interface AuthUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_superuser: boolean
}

export interface LoginResponse {
  access: string
  refresh: string
  user: AuthUser
}

export async function loginApi(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
    const message =
      (data['detail'] as string) ||
      (data['non_field_errors'] as string[])?.join(', ') ||
      "Login yoki parol noto'g'ri"
    throw new Error(message)
  }

  const data = (await res.json()) as LoginResponse
  tokenStorage.setTokens(data.access, data.refresh)
  return data
}

export function logoutApi() {
  tokenStorage.clear()
}
