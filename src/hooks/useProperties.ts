import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router"
import {
  fetchProperties,
  type PropertyQueryParams,
} from "@/api/properties"
import type { Property } from "@/types/property"

export function useProperties() {
  const [searchParams] = useSearchParams()

  const search = searchParams.get("search") ?? ""
  const type = searchParams.get("type") ?? ""
  const city = searchParams.get("city") ?? ""
  const minPrice = searchParams.get("minPrice") ?? ""
  const maxPrice = searchParams.get("maxPrice") ?? ""
  const minRating = searchParams.get("minRating") ?? ""
  const page = Number(searchParams.get("page") ?? "1")

  const params: PropertyQueryParams = {
    search: search || undefined,
    type: type
      ? (type as Property["type"])
      : undefined,
    city: city || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    minRating: minRating || undefined,
    page:
      Number.isInteger(page) && page > 0
        ? page
        : 1,
    limit: 10,
  }

  return useQuery({
    queryKey: [
      "properties",
      search,
      type,
      city,
      minPrice,
      maxPrice,
      minRating,
      page,
    ],
    queryFn: () => fetchProperties(params),
  })
}