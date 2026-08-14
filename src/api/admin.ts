import { apiFetch } from "@/api/client"

export type AdminRoom = {
  id: string
  roomTypeId: string
  roomLabel: string
  isAvailable: boolean
}

export type AdminRoomType = {
  id: string
  propertyId: string
  name: string
  pricePerMonth: string
  seatCapacity: number
  hasAC: boolean
  isAvailable: boolean
  rooms: AdminRoom[]
}

export type AdminProperty = {
  id: string
  title: string
  description: string
  address: string
  city: string
  type: "HOUSE" | "VILLA" | "APARTMENT" | "HOTEL"
  amenities: string[]
  latitude: number
  longitude: number
  imageUrl: string
  minStay: string
  isActive: boolean
  roomTypes: AdminRoomType[]
}

export type AdminSummary = {
  properties: number
  rooms: number
  bookings: number
  activeBookings: number
  totalSeats: number
  occupancyPercent: number
  confirmedRevenue: number
}

export type AdminBooking = {
  id: string
  seatNumber: number
  leaseStart: string
  leaseEnd: string
  durationMonths: number
  totalAmount: string
  paymentStatus: "PENDING" | "PAID" | "FAILED"
  bookingStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED"
  tenant: { id: string; displayName: string; email: string }
  room: {
    id: string
    roomLabel: string
    roomType: {
      id: string
      name: string
      property: { id: string; title: string }
    }
  }
}

export type PropertyInput = Omit<AdminProperty, "id" | "roomTypes">
export type RoomTypeInput = Omit<AdminRoomType, "id" | "propertyId" | "rooms" | "pricePerMonth"> & {
  pricePerMonth: number
}
export type RoomInput = Pick<AdminRoom, "roomLabel" | "isAvailable">

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init)
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? body?.error ?? `Request failed (${response.status})`)
  }
  return response.status === 204 ? (undefined as T) : response.json()
}

export const AdminAPI = {
  summary: () => request<AdminSummary>("/admin/summary"),
  bookings: () => request<AdminBooking[]>("/admin/bookings"),
  properties: () => request<AdminProperty[]>("/admin/properties"),
  createProperty: (input: PropertyInput) =>
    request<AdminProperty>("/admin/properties", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateProperty: (id: string, input: Partial<PropertyInput>) =>
    request<AdminProperty>(`/admin/properties/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteProperty: (id: string) =>
    request<void>(`/admin/properties/${encodeURIComponent(id)}`, { method: "DELETE" }),
  createRoomType: (propertyId: string, input: RoomTypeInput) =>
    request<AdminRoomType>(`/admin/properties/${encodeURIComponent(propertyId)}/room-types`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateRoomType: (id: string, input: Partial<RoomTypeInput>) =>
    request<AdminRoomType>(`/admin/room-types/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteRoomType: (id: string) =>
    request<void>(`/admin/room-types/${encodeURIComponent(id)}`, { method: "DELETE" }),
  createRoom: (roomTypeId: string, input: RoomInput) =>
    request<AdminRoom>(`/admin/room-types/${encodeURIComponent(roomTypeId)}/rooms`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateRoom: (id: string, input: Partial<RoomInput>) =>
    request<AdminRoom>(`/admin/rooms/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteRoom: (id: string) =>
    request<void>(`/admin/rooms/${encodeURIComponent(id)}`, { method: "DELETE" }),
}
