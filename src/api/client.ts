import { useAuthStore } from "@/stores/authStore"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api"

let refreshRequest: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState()
  if (!refreshToken) throw new Error("No refresh token")

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    logout()
    throw new Error("Session expired")
  }

  const tokens = (await response.json()) as {
    accessToken: string
    refreshToken: string
  }
  setTokens(tokens.accessToken, tokens.refreshToken)
  return tokens.accessToken
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  retry = true
): Promise<Response> {
  const accessToken = useAuthStore.getState().accessToken
  const headers = new Headers(init.headers)
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json")
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  if (response.status !== 401 || !retry) return response

  try {
    refreshRequest ??= refreshAccessToken().finally(() => {
      refreshRequest = null
    })
    const token = await refreshRequest
    headers.set("Authorization", `Bearer ${token}`)
    return fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch {
    return response
  }
}

export { API_BASE_URL }
