import { useInfiniteQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router"

import {
  fetchPropertiesPage,
  type PropertyQueryParams,
  type PropertySort,
} from "@/api/properties"

import type { Property } from "@/types/property"

const VALID_SORTS: PropertySort[] = [
  "newest",
  "oldest",
  "price-asc",
  "price-desc",
  "rating-desc",
  "rating-asc",
]

function getSort(value: string | null): PropertySort {
  if (
    value &&
    VALID_SORTS.includes(value as PropertySort)
  ) {
    return value as PropertySort
  }

  return "newest"
}

export function useProperties() {
  const [searchParams] = useSearchParams()

  const search = searchParams.get("search") ?? ""
  const type = searchParams.get("type") ?? ""
  const city = searchParams.get("city") ?? ""
  const minPrice = searchParams.get("minPrice") ?? ""
  const maxPrice = searchParams.get("maxPrice") ?? ""
  const minRating = searchParams.get("minRating") ?? ""
  const sort = getSort(searchParams.get("sort"))

  const baseParams: Omit<PropertyQueryParams, "page"> = {
    search: search || undefined,

    type: type
      ? (type as Property["type"])
      : undefined,

    city: city || undefined,

    minPrice: minPrice || undefined,

    maxPrice: maxPrice || undefined,

    minRating: minRating || undefined,

    sort,

    limit: 10,
  }

  return useInfiniteQuery({
    queryKey: [
      "properties",
      search,
      type,
      city,
      minPrice,
      maxPrice,
      minRating,
      sort,
    ],

    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      fetchPropertiesPage({
        ...baseParams,
        page: pageParam,
      }),

    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage
        ? lastPage.meta.page + 1
        : undefined,
  })
}