import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { createConfirmedBooking, fetchRoomAvailability } from "@/api/bookings"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuthStore } from "@/stores/authStore"
import type { Room } from "@/types/property"

type BookingPanelProps = {
  propertyId: string
  roomType: Room | null
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export function BookingPanel({ propertyId, roomType }: BookingPanelProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const [startMonth, setStartMonth] = useState(currentMonth())
  const [durationMonths, setDurationMonths] = useState(1)
  const [selectedSeat, setSelectedSeat] = useState<{
    roomId: string
    roomName: string
    seatNumber: number
  } | null>(null)

  const availability = useQuery({
    queryKey: ["room-availability", propertyId, roomType?.id, startMonth, durationMonths],
    queryFn: () =>
      fetchRoomAvailability(propertyId, roomType!.id, startMonth, durationMonths),
    enabled: Boolean(roomType?.id && startMonth),
  })

  const availableSeats = useMemo(
    () =>
      availability.data?.rooms.flatMap((room) =>
        room.booking
          .filter((seat) => !seat.tenant)
          .map((seat) => ({
            roomId: room.roomId,
            roomName: room.roomName,
            seatNumber: seat.seatIndex,
          }))
      ) ?? [],
    [availability.data]
  )

  const booking = useMutation({
    mutationFn: createConfirmedBooking,
    onSuccess: async () => {
      setSelectedSeat(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["room-availability"] }),
        queryClient.invalidateQueries({ queryKey: ["my-bookings"] }),
      ])
    },
  })

  if (!roomType) {
    return null
  }

  const confirmBooking = () => {
    if (!user) {
      navigate("/sign-in", { state: { from: window.location.pathname } })
      return
    }

    if (!selectedSeat) {
      return
    }

    booking.mutate({
      roomId: selectedSeat.roomId,
      seatNumber: selectedSeat.seatNumber,
      startMonth,
      durationMonths,
    })
  }

  return (
    <Card className="mt-5 gap-5 rounded-3xl p-6 shadow-sm ring-0">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Book {roomType.name}</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose your lease month, duration, room and seat.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">
          Start month
          <input
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            type="month"
            min={currentMonth()}
            value={startMonth}
            onChange={(event) => {
              setStartMonth(event.target.value)
              setSelectedSeat(null)
            }}
          />
        </label>

        <label className="text-sm font-medium text-gray-700">
          Duration
          <select
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            value={durationMonths}
            onChange={(event) => {
              setDurationMonths(Number(event.target.value))
              setSelectedSeat(null)
            }}
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
              <option key={month} value={month}>
                {month} {month === 1 ? "month" : "months"}
              </option>
            ))}
          </select>
        </label>
      </div>

      {availability.isLoading && (
        <p className="text-sm text-gray-500">Checking availability...</p>
      )}

      {availability.isError && (
        <p className="text-sm text-red-600">
          {availability.error instanceof Error
            ? availability.error.message
            : "Could not load availability"}
        </p>
      )}

      {!availability.isLoading && !availability.isError && availableSeats.length === 0 && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          No seats are available for this lease period.
        </p>
      )}

      {availableSeats.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Available seats</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {availableSeats.map((seat) => {
              const selected =
                selectedSeat?.roomId === seat.roomId &&
                selectedSeat.seatNumber === seat.seatNumber

              return (
                <button
                  key={`${seat.roomId}-${seat.seatNumber}`}
                  type="button"
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 hover:border-primary"
                  }`}
                  onClick={() => setSelectedSeat(seat)}
                >
                  <span className="block font-semibold">{seat.roomName}</span>
                  <span>Seat {seat.seatNumber}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {booking.isError && (
        <p className="text-sm text-red-600">
          {booking.error instanceof Error
            ? booking.error.message
            : "Booking failed"}
        </p>
      )}

      {booking.isSuccess && (
        <div className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
          Booking confirmed.{" "}
          <button
            className="font-semibold underline"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            View My Bookings
          </button>
        </div>
      )}

      <Button
        className="w-full rounded-xl"
        size="lg"
        disabled={!selectedSeat || booking.isPending}
        onClick={confirmBooking}
      >
        {booking.isPending ? "Confirming..." : user ? "Confirm booking" : "Sign in to book"}
      </Button>
    </Card>
  )
}
