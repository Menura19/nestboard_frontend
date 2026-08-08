import type { Property, PropertyDetail } from "@/types/property"
import { apiFetch } from "@/api/client"

export type PropertyQueryParams = {
  search?: string
  type?: Property["type"]
  city?: string
  minPrice?: string
  maxPrice?: string
  minRating?: string
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

function buildPropertyQuery(params: PropertyQueryParams = {}) {
  const searchParams = new URLSearchParams()

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim())
  }

  if (params.type) {
    searchParams.set("type", params.type)
  }

  if (params.city?.trim()) {
    searchParams.set("city", params.city.trim())
  }

  if (params.minPrice?.trim()) {
    searchParams.set("minPrice", params.minPrice.trim())
  }

  if (params.maxPrice?.trim()) {
    searchParams.set("maxPrice", params.maxPrice.trim())
  }

  if (params.minRating?.trim()) {
    searchParams.set("minRating", params.minRating.trim())
  }

  if (params.page) {
    searchParams.set("page", String(params.page))
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit))
  }

  return searchParams.toString()
}

export async function fetchPropertiesPage(
  params: PropertyQueryParams = {}
): Promise<PropertiesResponse> {
  const query = buildPropertyQuery(params)

  const res = await apiFetch(
    `/properties${query ? `?${query}` : ""}`
  )

  if (!res.ok) {
    throw new Error("Failed to fetch properties")
  }

  return res.json()
}

export async function fetchProperties(
  params: PropertyQueryParams = {}
): Promise<Property[]> {
  const response = await fetchPropertiesPage(params)
  return response.data
}

export async function fetchPropertyDetail(
  id: string
): Promise<PropertyDetail> {
  const res = await apiFetch(
    `/properties/${encodeURIComponent(id)}`
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch property: ${id}`)
  }

  return res.json()
}