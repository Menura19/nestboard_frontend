import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import {
  Search,
  SlidersHorizontal,
  Home,
  Building2,
  Warehouse,
  Hotel,
  X,
  ArrowUpDown,
  type LucideIcon,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Property } from "@/types/property"
import type { PropertySort } from "@/api/properties"

interface Category {
  label: Property["type"] | "All"
  icon: LucideIcon | null
}

const categories: Category[] = [
  { label: "All", icon: null },
  { label: "House", icon: Home },
  { label: "Villa", icon: Warehouse },
  { label: "Apartment", icon: Building2 },
  { label: "Hotel", icon: Hotel },
]

const validSorts: PropertySort[] = [
  "newest",
  "oldest",
  "price-asc",
  "price-desc",
  "rating-desc",
  "rating-asc",
]

function getCurrentSort(value: string | null): PropertySort {
  if (
    value &&
    validSorts.includes(value as PropertySort)
  ) {
    return value as PropertySort
  }

  return "newest"
}

export function SearchFilters() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const currentSearch = searchParams.get("search") ?? ""
  const currentType = searchParams.get("type") ?? ""
  const currentCity = searchParams.get("city") ?? ""
  const currentMinPrice = searchParams.get("minPrice") ?? ""
  const currentMaxPrice = searchParams.get("maxPrice") ?? ""
  const currentMinRating = searchParams.get("minRating") ?? ""
  const currentSort = getCurrentSort(
    searchParams.get("sort")
  )

  const [search, setSearch] = useState(currentSearch)
  const [city, setCity] = useState(currentCity)
  const [minPrice, setMinPrice] = useState(currentMinPrice)
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice)
  const [minRating, setMinRating] =
    useState(currentMinRating)

  useEffect(() => {
    setSearch(currentSearch)
    setCity(currentCity)
    setMinPrice(currentMinPrice)
    setMaxPrice(currentMaxPrice)
    setMinRating(currentMinRating)
  }, [
    currentSearch,
    currentCity,
    currentMinPrice,
    currentMaxPrice,
    currentMinRating,
  ])

  const activeCategory: Property["type"] | "All" =
    currentType === "House" ||
    currentType === "Villa" ||
    currentType === "Apartment" ||
    currentType === "Hotel"
      ? currentType
      : "All"

  function setParam(
    params: URLSearchParams,
    key: string,
    value: string
  ) {
    if (value.trim()) {
      params.set(key, value.trim())
    } else {
      params.delete(key)
    }
  }

  function applyFilters() {
    const nextParams = new URLSearchParams(searchParams)

    setParam(nextParams, "search", search)
    setParam(nextParams, "city", city)
    setParam(nextParams, "minPrice", minPrice)
    setParam(nextParams, "maxPrice", maxPrice)
    setParam(nextParams, "minRating", minRating)

    nextParams.delete("page")

    setSearchParams(nextParams)
  }

  function handleCategoryChange(
    category: Property["type"] | "All"
  ) {
    const nextParams = new URLSearchParams(searchParams)

    if (category === "All") {
      nextParams.delete("type")
    } else {
      nextParams.set("type", category)
    }

    nextParams.delete("page")

    setSearchParams(nextParams)
  }

  function handleSortChange(value: string) {
    const sort = getCurrentSort(value)
    const nextParams = new URLSearchParams(searchParams)

    if (sort === "newest") {
      nextParams.delete("sort")
    } else {
      nextParams.set("sort", sort)
    }

    nextParams.delete("page")

    setSearchParams(nextParams)
  }

  function clearAdvancedFilters() {
    setCity("")
    setMinPrice("")
    setMaxPrice("")
    setMinRating("")

    const nextParams = new URLSearchParams(searchParams)

    nextParams.delete("city")
    nextParams.delete("minPrice")
    nextParams.delete("maxPrice")
    nextParams.delete("minRating")
    nextParams.delete("page")

    setSearchParams(nextParams)
  }

  function clearAllFilters() {
    setSearch("")
    setCity("")
    setMinPrice("")
    setMaxPrice("")
    setMinRating("")

    setSearchParams({})
  }

  return (
    <div className="relative z-20 -mt-7 px-4">
      <div className="rounded-2xl bg-white p-8 shadow-xl">
        {/* Search row */}
        <div className="mb-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              placeholder="Search by property name or city..."
              className="h-10 rounded-xl border-gray-200 pl-9"
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters()
                }
              }}
            />
          </div>

          <Button
            type="button"
            className="h-10 rounded-xl"
            onClick={applyFilters}
          >
            Search
          </Button>

          <Button
            type="button"
            variant={filtersOpen ? "default" : "ghost"}
            className="h-10 gap-1.5 rounded-xl"
            onClick={() =>
              setFiltersOpen((current) => !current)
            }
          >
            {filtersOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <SlidersHorizontal className="h-4 w-4" />
            )}

            Filters
          </Button>
        </div>

        {/* Categories + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map(({ label, icon: Icon }) => (
              <Button
                key={label}
                type="button"
                size="sm"
                variant={
                  activeCategory === label
                    ? "default"
                    : "outline"
                }
                className="gap-1.5 rounded-full"
                onClick={() =>
                  handleCategoryChange(label)
                }
              >
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-500" />

            <label
              htmlFor="property-sort"
              className="text-sm font-medium text-gray-600"
            >
              Sort
            </label>

            <select
              id="property-sort"
              value={currentSort}
              onChange={(e) =>
                handleSortChange(e.target.value)
              }
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"
            >
              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="price-asc">
                Price: Low to High
              </option>

              <option value="price-desc">
                Price: High to Low
              </option>

              <option value="rating-desc">
                Rating: High to Low
              </option>

              <option value="rating-asc">
                Rating: Low to High
              </option>
            </select>
          </div>
        </div>

        {/* Advanced filters */}
        {filtersOpen && (
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Advanced Filters
                </h3>

                <p className="text-sm text-gray-500">
                  Filter properties by city, price and rating.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAdvancedFilters}
                >
                  Clear
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  Reset All
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* City */}
              <div>
                <label
                  htmlFor="city-filter"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  City
                </label>

                <Input
                  id="city-filter"
                  value={city}
                  placeholder="e.g. Colombo"
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                />
              </div>

              {/* Minimum price */}
              <div>
                <label
                  htmlFor="min-price-filter"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Minimum Price
                </label>

                <Input
                  id="min-price-filter"
                  type="number"
                  min="0"
                  value={minPrice}
                  placeholder="Min price"
                  onChange={(e) =>
                    setMinPrice(e.target.value)
                  }
                />
              </div>

              {/* Maximum price */}
              <div>
                <label
                  htmlFor="max-price-filter"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Maximum Price
                </label>

                <Input
                  id="max-price-filter"
                  type="number"
                  min="0"
                  value={maxPrice}
                  placeholder="Max price"
                  onChange={(e) =>
                    setMaxPrice(e.target.value)
                  }
                />
              </div>

              {/* Minimum rating */}
              <div>
                <label
                  htmlFor="rating-filter"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Minimum Rating
                </label>

                <select
                  id="rating-filter"
                  value={minRating}
                  onChange={(e) =>
                    setMinRating(e.target.value)
                  }
                  className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  <option value="">
                    Any rating
                  </option>
                  <option value="1">
                    1+ stars
                  </option>
                  <option value="2">
                    2+ stars
                  </option>
                  <option value="3">
                    3+ stars
                  </option>
                  <option value="4">
                    4+ stars
                  </option>
                  <option value="4.5">
                    4.5+ stars
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                onClick={applyFilters}
                className="rounded-xl"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}