import { useState, type FormEvent } from "react"
import { Navigate, useLocation, useNavigate } from "react-router"
import { login, register } from "@/api/auth"
import { useAuthStore } from "@/stores/authStore"

export function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const [mode, setMode] = useState<"login" | "register">("login")
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      if (mode === "login") await login(email, password)
      else await register(displayName, email, password)
      const destination =
        (location.state as { from?: string } | null)?.from ?? "/dashboard"
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-gray-500">
          {mode === "login"
            ? "Sign in with your NestBoard account."
            : "Register directly with the NestBoard API."}
        </p>

        {mode === "register" && (
          <label className="mt-6 block text-sm font-medium text-gray-700">
            Display name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              minLength={2}
              maxLength={80}
              required
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
            />
          </label>
        )}

        <label className="mt-5 block text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
          />
        </label>

        <label className="mt-5 block text-sm font-medium text-gray-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={mode === "register" ? 8 : undefined}
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {submitting
            ? "Please wait..."
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login")
            setError("")
          }}
          className="mt-4 w-full text-sm font-medium text-orange-700"
        >
          {mode === "login"
            ? "New to NestBoard? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  )
}
