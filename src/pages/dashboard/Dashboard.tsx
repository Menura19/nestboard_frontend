import { useQuery } from "@tanstack/react-query"
import { fetchMyBookings } from "@/api/bookings"
import { Card } from "@/components/ui/card"
import { useAuthStore } from "@/stores/authStore"

export function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const isTenant = user?.role === "USER"

  const bookings = useQuery({
    queryKey: ["my-bookings"],
    queryFn: fetchMyBookings,
    enabled: isTenant,
  })

  return (
    <div className="min-h-screen bg-gray-50 px-6 pb-12 pt-28">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold text-gray-900">
          Welcome, {user?.displayName || "User"}!
        </h1>

        {!isTenant ? (
          <Card className="mt-6 rounded-2xl p-6">
            <h2 className="text-xl font-bold">Admin dashboard</h2>
            <p className="mt-1 text-gray-600">
              Use the admin area to manage properties and rooms.
            </p>
          </Card>
        ) : (
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>

            {bookings.isLoading && (
              <p className="mt-4 text-gray-500">Loading bookings...</p>
            )}

            {bookings.isError && (
              <p className="mt-4 text-red-600">
                {bookings.error instanceof Error
                  ? bookings.error.message
                  : "Could not load bookings"}
              </p>
            )}

            {bookings.data?.length === 0 && (
              <Card className="mt-4 rounded-2xl p-6 text-gray-600">
                You have no bookings yet. Open a property to reserve a seat.
              </Card>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {bookings.data?.map((booking) => {
                const property = booking.room?.roomType?.property

                return (
                  <Card key={booking.id} className="overflow-hidden rounded-2xl p-0">
                    {property?.imageUrl && (
                      <img
                        className="h-40 w-full object-cover"
                        src={property.imageUrl}
                        alt={property.title ?? "Booked property"}
                      />
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          {property?.title ?? "NestBoard booking"}
                        </h3>
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          {booking.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {booking.room?.roomType?.name ?? "Room"} ·{" "}
                        {booking.room?.roomLabel ?? "Assigned room"} · Seat{" "}
                        {booking.seatNumber}
                      </p>
                      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="text-gray-400">Start month</dt>
                          <dd className="font-semibold">{booking.startMonth.slice(0, 7)}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-400">Duration</dt>
                          <dd className="font-semibold">
                            {booking.durationMonths}{" "}
                            {booking.durationMonths === 1 ? "month" : "months"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
