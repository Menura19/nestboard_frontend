import type { Property, PropertyDetail, Room } from "@/types/property"
import { apiFetch } from "@/api/client"

export type PropertySort =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "rating-asc"

export type PropertyQueryParams = {
  search?: string
  type?: Property["type"]
  city?: string
  minPrice?: string
  maxPrice?: string
  minRating?: string
  sort?: PropertySort
  page?: number
  limit?: number
}

export type PropertiesMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type PropertiesResponse = {
  data: Property[]
  meta: PropertiesMeta
}

type ApiPropertyDetail = {
  id: string
  title: string
  address: string
  city?: string
  rating: number | string
  amenities?: string[]
  available_seats?: number
  minStay?: string
  cost?: number | string
  imageUrl?: string
}

type ApiRoomType = {
  id: string
  name: string
  pricePerMonth: number | string
  seatCapacity: number
  freeSeats?: number
  hasAC: boolean
}

function buildPropertyQuery(params: PropertyQueryParams = {}) {
  const searchParams = new URLSearchParams()

  if (params.search?.trim()) searchParams.set("search", params.search.trim())
  if (params.type) searchParams.set("type", params.type)
  if (params.city?.trim()) searchParams.set("city", params.city.trim())
  if (params.minPrice?.trim()) searchParams.set("minPrice", params.minPrice.trim())
  if (params.maxPrice?.trim()) searchParams.set("maxPrice", params.maxPrice.trim())
  if (params.minRating?.trim()) searchParams.set("minRating", params.minRating.trim())
  if (params.sort) searchParams.set("sort", params.sort)
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))

  return searchParams.toString()
}

export async function fetchPropertiesPage(
  params: PropertyQueryParams = {}
): Promise<PropertiesResponse> {
  const query = buildPropertyQuery(params)
  const res = await apiFetch(`/properties${query ? `?${query}` : ""}`)

  if (!res.ok) throw new Error("Failed to fetch properties")
  return res.json()
}

export async function fetchProperties(
  params: PropertyQueryParams = {}
): Promise<Property[]> {
  const response = await fetchPropertiesPage(params)
  return response.data
}

export async function fetchPropertyDetail(id: string): Promise<PropertyDetail> {
  const encodedId = encodeURIComponent(id)
  const [propertyResponse, roomTypesResponse] = await Promise.all([
    apiFetch(`/properties/${encodedId}`),
    apiFetch(`/properties/${encodedId}/room-types`),
  ])

  if (!propertyResponse.ok) {
    throw new Error(`Failed to fetch property: ${id}`)
  }

  if (!roomTypesResponse.ok) {
    throw new Error("Failed to fetch room types")
  }

  const property: ApiPropertyDetail = await propertyResponse.json()
  const roomTypesBody = await roomTypesResponse.json()
  const roomTypes: ApiRoomType[] = Array.isArray(roomTypesBody)
    ? roomTypesBody
    : roomTypesBody.data ?? []

  const rooms: Room[] = roomTypes.map((room) => ({
    id: room.id,
    name: room.name,
    price: String(room.pricePerMonth),
    seatsTotal: room.seatCapacity,
    seatsFree: room.freeSeats ?? room.seatCapacity,
    hasAC: room.hasAC,
  }))

  return {
    id: property.id,
    title: property.title,
    address:
      property.city && !property.address.includes(property.city)
        ? `${property.address}, ${property.city}`
        : property.address,
    amenities: property.amenities ?? [],
    rating: Number(property.rating),
    seatsAvailable:
      property.available_seats ??
      rooms.reduce((total, room) => total + room.seatsFree, 0),
    minStay: property.minStay ?? "Contact property",
    startingPrice:
      property.cost != null
        ? String(property.cost)
        : rooms.length
          ? String(Math.min(...rooms.map((room) => Number(room.price))))
          : "N/A",
    image: property.imageUrl ?? "",
    rooms,
  }
}
