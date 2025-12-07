import { useState, useEffect } from "react"
import type { RoutesObjectType } from "@/types/RoutesType.tsx"
import DashboardCustomStatsCard from "@/pages/Dashboard/components/DashboardCustomStatsCard/DashboardCustomStatsCard.tsx"
import { getPaths, getPath } from "@/lib/api-client.ts"

const DashboardRoutes = () => {
  const [routes, setRoutes] = useState<RoutesObjectType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await getPaths()
        
        if (response.success && response.data) {
          // Map API response to frontend format
          const mappedRoutes: RoutesObjectType[] = response.data.map((path: any) => ({
            pathId: path.pathId || path.id?.toString() || "",
            title: path.title || "",
            shortDescription: path.shortDescription || "",
            longDescription: path.longDescription || "",
            category: path.category || "",
            totalTimeMinutes: path.totalTimeMinutes || 0,
            difficulty: path.difficulty || "",
            distanceMeters: path.distanceMeters || 0,
            thumbnailUrl: path.thumbnailUrl || "",
            isPublished: path.isPublished || false,
            stylePreset: path.stylePreset || "",
            makerIconUrl: path.markerIconUrl || "",
            createBy: path.createdBy || "",
            createdAt: path.createdAt ? new Date(path.createdAt).getTime() : Date.now(),
            updatedAt: path.updatedAt ? new Date(path.updatedAt).getTime() : Date.now(),
            stops: [], // Will be loaded separately
          }))
          
          // Fetch full data (with points) for each route to get stops count
          // Limit to first 9 routes to avoid too many requests
          const routesToFetch = mappedRoutes.slice(0, 9)
          const routesWithStops = await Promise.all(
            routesToFetch.map(async (route) => {
              try {
                const pathResponse = await getPath(route.pathId)
                if (pathResponse.success && pathResponse.data?.points) {
                  const points = pathResponse.data.points
                  return {
                    ...route,
                    stops: points.map((pointData: any, index: number) => {
                      const point = pointData.point || pointData
                      return {
                        stop_id: point.id || index + 1,
                        name: point.locationLabel || `Punkt ${index + 1}`,
                        map_marker: {
                          display_name: point.locationLabel || `Punkt ${index + 1}`,
                          address: "",
                          coordinates: {
                            latitude: point.latitude,
                            longitude: point.longitude,
                          },
                        },
                        place_description: point.narrationText || "",
                        voice_over_text: point.narrationText || "",
                      }
                    }),
                  }
                }
              } catch (err) {
                console.error(`Error fetching route ${route.pathId}:`, err)
              }
              return route
            })
          )
          
          // Combine routes with stops and routes without (for routes beyond first 9)
          const allRoutes = [...routesWithStops, ...mappedRoutes.slice(9)]
          setRoutes(allRoutes)
        } else {
          setError(response.error || "Nie udało się załadować tras")
        }
      } catch (err: any) {
        console.error("Error fetching routes:", err)
        setError(err?.message || "Wystąpił błąd podczas ładowania tras")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoutes()
  }, [])

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Projekty tras</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Projekty tras</h2>
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  if (routes.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Projekty tras</h2>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center">
          <p className="text-primary">Brak tras. Stwórz pierwszą trasę!</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Projekty tras</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route: RoutesObjectType) => (
          <DashboardCustomStatsCard route={route} key={route.pathId} />
        ))}
      </div>
    </div>
  )
}

export default DashboardRoutes
