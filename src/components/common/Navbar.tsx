import { Heart, Building2, LogOut, MessageCircle, UserCircle } from "lucide-react"
import { NavLink, useNavigate } from "react-router"
import { useAuthStore } from "@/stores/authStore"

export type NavbarLink = { label: string; to: string }
type NavbarProps = { links: NavbarLink[] }

export function Navbar({ links }: NavbarProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isAdmin = user?.role === "ADMIN"

  return (
    <div className="absolute top-0 right-0 left-0 z-50 px-4 pt-4">
      <nav
        className={`flex items-center justify-between rounded-full px-5 py-3 ${
          isAdmin ? "bg-blue-500/50" : "bg-orange-500/50"
        }`}
      >
        <NavLink to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg tracking-wide text-white">NestBoard</span>
        </NavLink>

        <div className="flex items-center gap-1">
          {links.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "text-md rounded-full px-4 py-1.5 transition-all duration-200",
                  isActive
                    ? "bg-primary text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className="rounded-full px-4 py-1.5 text-white">
              Admin
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3.5">
          <Heart className="h-5 w-5 text-white/80" />
          <MessageCircle className="h-5 w-5 text-white/80" />
          {!user ? (
            <NavLink
              to="/sign-in"
              className="text-md rounded-full bg-white px-4 py-1.5 text-gray-800"
            >
              Sign in
            </NavLink>
          ) : (
            <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5">
              <UserCircle className="h-5 w-5 text-gray-700" />
              <span className="max-w-28 truncate text-sm text-gray-800">
                {user.displayName}
              </span>
              <button
                type="button"
                aria-label="Sign out"
                onClick={() => {
                  logout()
                  navigate("/")
                }}
              >
                <LogOut className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
