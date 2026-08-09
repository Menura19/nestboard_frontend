import { apiFetch } from "@/api/client"

export type RoomSeat = {
  seatIndex: number
  tenant: string | null
  tenantBio: string | null
}

export type AvailableRoom = {
  roomId: string
  roomName: string
  booking: RoomSeat[]
}

export type RoomAvailability = {
  id: string
  name: string
  pricePerMonth: number | string
  seatCapacity: number
  hasAC: boolean
  rooms: AvailableRoom[]
}

export type Booking = {
  id: string
  status: string
  startMonth: string
  durationMonths: number
  seatNumber: number
  totalPrice?: number | string
  room?: {
    roomLabel?: string
    roomType?: {
      name?: string
      property?: {
        id?: string
        title?: string
        address?: string
        city?: string
        imageUrl?: string
      }
    }
  }
}

async function readApiError(response: Response, fallback: string) {
  try {
    const body = await response.json()
    return body.message || body.error || fallback
  } catch {
    return fallback
  }
}

export async function fetchRoomAvailability(
  propertyId: string,
  roomTypeId: string,
  startMonth: string,
  durationMonths: number
): Promise<RoomAvailability> {
  const params = new URLSearchParams({
    startMonth,
    durationMonths: String(durationMonths),
  })

  const response = await apiFetch(
    `/properties/${encodeURIComponent(propertyId)}/room-types/${encodeURIComponent(roomTypeId)}?${params}`
  )

  if (!response.ok) {
    throw new Error(await readApiError(response, "Failed to load available rooms"))
  }

  return response.json()
}

export async function createConfirmedBooking(input: {
  roomId: string
  seatNumber: number
  startMonth: string
  durationMonths: number
}): Promise<Booking> {
  const response = await apiFetch("/bookings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, "Failed to create booking"))
  }

  return response.json()
}

export async function fetchMyBookings(): Promise<Booking[]> {
  const response = await apiFetch("/bookings/my")

  if (!response.ok) {
    throw new Error(await readApiError(response, "Failed to load bookings"))
  }

  const body = await response.json()
  return Array.isArray(body) ? body : body.data ?? []
}
