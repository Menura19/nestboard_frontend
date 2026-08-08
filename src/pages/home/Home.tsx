import { HeroSection } from "./components/HeroSection"
import { PropertyList } from "./components/PropertyList"
import { SearchFilters } from "./components/SearchFilters"
import { useProperties } from "@/hooks/useProperties"

export function Home() {
  const {
    data: properties = [],
    isLoading,
    isError,
  } = useProperties()

  return (
    <>
      <HeroSection />
      <SearchFilters />

      {isLoading && (
        <div className="px-8 py-10 text-gray-500">
          Loading properties...
        </div>
      )}

      {isError && (
        <div className="px-8 py-10 text-red-400">
          Failed to load properties. Please try again.
        </div>
      )}

      {!isLoading && !isError && (
        <PropertyList properties={properties} />
      )}
    </>
  )
}