import { useAuthStore } from "@/stores/authStore"

export function Dashboard() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold text-gray-900">
          Welcome, {user?.displayName || "User"}!
        </h1>
        <p className="mt-2 text-gray-600">
          This is your dashboard where you can manage your properties, view your
          saved listings, and see your recent activity. We're working on adding
          more features soon, so stay tuned!
        </p>
      </div>
    </div>
  )
}
