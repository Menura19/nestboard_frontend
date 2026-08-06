import { apiFetch, API_BASE_URL } from "@/api/client"
import { useAuthStore, type ApiUser } from "@/stores/authStore"

type TokenPair = { accessToken: string; refreshToken: string }

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; error?: string }
    return body.message ?? body.error ?? "Request failed"
  } catch {
    return "Request failed"
  }
}

async function acceptTokens(response: Response): Promise<ApiUser> {
  if (!response.ok) throw new Error(await readError(response))
  const tokens = (await response.json()) as TokenPair
  useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken)
  return getCurrentUser()
}

export async function login(email: string, password: string): Promise<ApiUser> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  return acceptTokens(response)
}

export async function register(
  displayName: string,
  email: string,
  password: string
): Promise<ApiUser> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName, email, password }),
  })
  return acceptTokens(response)
}

export async function getCurrentUser(): Promise<ApiUser> {
  const response = await apiFetch("/auth/me")
  if (!response.ok) throw new Error(await readError(response))
  const user = (await response.json()) as ApiUser
  useAuthStore.getState().setUser(user)
  return user
}

export async function initializeAuth(): Promise<void> {
  const store = useAuthStore.getState()
  if (!store.refreshToken) {
    store.setInitialized(true)
    return
  }
  try {
    await getCurrentUser()
  } catch {
    store.logout()
  } finally {
    useAuthStore.getState().setInitialized(true)
  }
}
