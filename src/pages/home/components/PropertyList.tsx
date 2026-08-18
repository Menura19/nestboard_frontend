import { PropertyCard } from "@/components/common/PropertyCard"
import { Button } from "@/components/ui/button"
import type { Property } from "@/types/property"

interface PropertyListProps {
  properties: Property[]
  total?: number
  page?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  onPageChange?: (page: number) => void
}

export function PropertyList({
  properties,
  total = properties.length,
  page = 1,
  totalPages = 1,
  hasNextPage = false,
  hasPreviousPage = false,
  onPageChange,
}: PropertyListProps) {
  return (
    <section className="mt-6 px-8 pb-10">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Property Listings
        </h2>

        <p className="mt-0.5 text-md text-gray-500">
          {total} {total === 1 ? "property" : "properties"} found
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No properties found
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Try changing or clearing your search filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
            />
          ))}
        </div>
      )}

      {onPageChange && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={!hasPreviousPage}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>

          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            disabled={!hasNextPage}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  )
}