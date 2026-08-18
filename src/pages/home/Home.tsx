import { useEffect, useMemo, useRef } from "react"
import { HeroSection } from "./components/HeroSection"
import { PropertyList } from "./components/PropertyList"
import { SearchFilters } from "./components/SearchFilters"
import { useProperties } from "@/hooks/useProperties"

export function Home() {
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProperties()

  const properties = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  )

  const total = data?.pages[0]?.meta.total ?? 0

  useEffect(() => {
    const target = loadMoreRef.current

    if (!target || !hasNextPage) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]

        if (
          firstEntry?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          void fetchNextPage()
        }
      },
      {
        rootMargin: "200px",
      }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ])

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
        <>
          <PropertyList
            properties={properties}
            total={total}
          />

          <div
            ref={loadMoreRef}
            className="flex min-h-16 items-center justify-center pb-10"
          >
            {isFetchingNextPage && (
              <p className="text-sm text-gray-500">
                Loading more properties...
              </p>
            )}

            {!hasNextPage && properties.length > 0 && (
              <p className="text-sm text-gray-400">
                You have reached the end.
              </p>
            )}
          </div>
        </>
      )}
    </>
  )
}