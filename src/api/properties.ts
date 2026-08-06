import type { Property, PropertyDetail } from "@/types/property"

type PropertiesResponse = {
  data: Property[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function fetchProperties(): Promise<Property[]> {
  const res = await fetch("http://localhost:3001/api/properties")

  if (!res.ok) {
    throw new Error("Failed to fetch properties")
  }

  const response: PropertiesResponse = await res.json()
  return response.data
}

export async function fetchPropertyDetail(
  id: string
): Promise<PropertyDetail> {
  const res = await fetch(`http://localhost:3001/api/properties/${id}`)

  if (!res.ok) {
    throw new Error(`Failed to fetch property: ${id}`)
  }

  return res.json()
}