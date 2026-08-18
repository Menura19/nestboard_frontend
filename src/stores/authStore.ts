import { create } from "zustand"

export type ApiUser = {
  id: string
  email: string
  displayName: string
  role: "USER" | "ADMIN"
  avatarUrl: string | null
  bioTag: string | null
}

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: ApiUser | null
  initialized: boolean
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: ApiUser | null) => void
  setInitialized: (initialized: boolean) => void
  logout: () => void
}

const storedRefreshToken = localStorage.getItem("nestboard_refresh_token")

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: storedRefreshToken,
  user: null,
  initialized: false,
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("nestboard_refresh_token", refreshToken)
    set({ accessToken, refreshToken })
  },
  setUser: (user) => set({ user }),
  setInitialized: (initialized) => set({ initialized }),
  logout: () => {
    localStorage.removeItem("nestboard_refresh_token")
    set({ accessToken: null, refreshToken: null, user: null })
  },
}))
