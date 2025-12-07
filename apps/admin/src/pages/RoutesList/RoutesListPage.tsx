import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Button } from "@/components/ui/button.tsx"
import { MapPin, Clock, Route, Edit, Eye, EyeOff, Plus, Grid3x3, List } from "lucide-react"
import type { RoutesObjectType } from "@/types/RoutesType.tsx"
import { getPaths } from "@/lib/api-client.ts"

// Mock data - w prawdziwej aplikacji dane będą z API
const mockRoutes: RoutesObjectType[] = [
  {
    pathId: "1",
    title: "Trasa po Warszawie",
    shortDescription: "Piękna trasa po stolicy",
    longDescription: "Szczegółowy opis trasy po Warszawie...",
    category: "walking",
    totalTimeMinutes: 120,
    difficulty: "easy",
    distanceMeters: 5000,
    thumbnailUrl: "",
    isPublished: true,
    stylePreset: "modern",
    makerIconUrl: "",
    createBy: "admin",
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
    stops: [
      { stop_id: 1, name: "Punkt 1", map_marker: { display_name: "Punkt 1", address: "Warszawa", coordinates: { latitude: 52.2297, longitude: 21.0122 } }, place_description: "Opis", voice_over_text: "Dialog" },
      { stop_id: 2, name: "Punkt 2", map_marker: { display_name: "Punkt 2", address: "Warszawa", coordinates: { latitude: 52.2297, longitude: 21.0122 } }, place_description: "Opis", voice_over_text: "Dialog" },
    ]
  },
  {
    pathId: "2",
    title: "Szlak górski Beskidy",
    shortDescription: "Trasa górska dla zaawansowanych",
    longDescription: "Szczegółowy opis trasy górskiej...",
    category: "hiking",
    totalTimeMinutes: 300,
    difficulty: "hard",
    distanceMeters: 15000,
    thumbnailUrl: "",
    isPublished: false,
    stylePreset: "classic",
    makerIconUrl: "",
    createBy: "admin",
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 1,
    stops: [
      { stop_id: 1, name: "Punkt 1", map_marker: { display_name: "Punkt 1", address: "Beskidy", coordinates: { latitude: 49.5, longitude: 19.0 } }, place_description: "Opis", voice_over_text: "Dialog" },
    ]
  },
  {
    pathId: "3",
    title: "Wycieczka rowerowa",
    shortDescription: "Trasa rowerowa po okolicy",
    longDescription: "Szczegółowy opis trasy rowerowej...",
    category: "cycling",
    totalTimeMinutes: 90,
    difficulty: "medium",
    distanceMeters: 20000,
    thumbnailUrl: "",
    isPublished: true,
    stylePreset: "colorful",
    makerIconUrl: "",
    createBy: "admin",
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000,
    stops: [
      { stop_id: 1, name: "Punkt 1", map_marker: { display_name: "Punkt 1", address: "Okolica", coordinates: { latitude: 52.0, longitude: 21.0 } }, place_description: "Opis", voice_over_text: "Dialog" },
      { stop_id: 2, name: "Punkt 2", map_marker: { display_name: "Punkt 2", address: "Okolica", coordinates: { latitude: 52.0, longitude: 21.0 } }, place_description: "Opis", voice_over_text: "Dialog" },
      { stop_id: 3, name: "Punkt 3", map_marker: { display_name: "Punkt 3", address: "Okolica", coordinates: { latitude: 52.0, longitude: 21.0 } }, place_description: "Opis", voice_over_text: "Dialog" },
    ]
  },
]

const ITEMS_PER_PAGE = 6

type ViewMode = "grid" | "list"

const RoutesListPage = () => {
  const [routes, setRoutes] = useState<RoutesObjectType[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch routes from API
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
            id: path.id, // Store numeric ID for API calls
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
            stops: [], // Stops will be loaded when editing a specific route
            pointsCount: path.pointsCount || 0, // Number of points from API
          }))
          setRoutes(mappedRoutes)
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

  const totalPages = Math.ceil(routes.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentRoutes = routes.slice(startIndex, endIndex)

  const handleTogglePublish = async (route: RoutesObjectType) => {
    // Backend uses pathId (string), not numeric id
    const routeId = route.pathId

    if (!routeId) {
      setError("Nie można znaleźć ID trasy")
      return
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:8080"
      const response = await fetch(`${API_BASE_URL}/admin/paths/${routeId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      })

      const result = await response.json()
      
      if (result.success && result.data) {
        // Update local state with new publication status
        setRoutes(routes.map(r => 
          r.id === route.id || (r.id === undefined && r.pathId === route.pathId)
            ? { ...r, isPublished: result.data.isPublished }
            : r
        ))
        setError(null) // Clear any previous errors
      } else {
        setError(result.error || "Nie udało się zmienić statusu publikacji")
      }
    } catch (err: any) {
      console.error("Error toggling publish status:", err)
      setError(err?.message || "Wystąpił błąd podczas zmiany statusu publikacji")
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    }
    return `${meters} m`
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lista tras</h1>
          <p className="text-muted-foreground">Zarządzaj wszystkimi trasami</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Link to="/routes/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              Nowa trasa
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Route className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Ładowanie tras...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Route className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Spróbuj ponownie
            </Button>
          </CardContent>
        </Card>
      ) : routes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Route className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Brak tras. Stwórz pierwszą trasę!</p>
            <Link to="/routes/create">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                Stwórz trasę
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={viewMode === "grid" 
            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" 
            : "space-y-4"
          }>
            {currentRoutes.map((route) => (
              <Card key={route.pathId} className={`hover:shadow-lg transition-shadow ${
                viewMode === "list" ? "flex" : ""
              }`}>
                {viewMode === "list" && (
                  <div className="w-48 h-48 bg-gray-100 rounded-l-lg flex items-center justify-center flex-shrink-0">
                    <Route className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className={viewMode === "list" ? "flex-1 flex flex-col" : ""}>
                  <CardHeader>
                    <div className={`flex items-start justify-between ${viewMode === "list" ? "flex-row" : ""}`}>
                      <div className="flex-1">
                        <CardTitle className={`${viewMode === "list" ? "text-xl" : "text-lg"} mb-2`}>
                          {route.title}
                        </CardTitle>
                        <p className={`text-sm text-muted-foreground ${viewMode === "list" ? "" : "line-clamp-2"}`}>
                          {route.shortDescription}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ml-2 ${
                        route.isPublished 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {route.isPublished ? "Opublikowana" : "Szkic"}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className={`${viewMode === "list" ? "flex-1 flex flex-col justify-between" : "space-y-4"}`}>
                    <div className={viewMode === "list" 
                      ? "flex items-center gap-6 flex-wrap" 
                      : "grid grid-cols-2 gap-3"
                    }>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-muted-foreground">
                          {route.pointsCount ?? route.stops.length} {(route.pointsCount ?? route.stops.length) === 1 ? "punkt" : (route.pointsCount ?? route.stops.length) < 5 ? "punkty" : "punktów"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Route className="h-4 w-4 text-blue-600" />
                        <span className="text-muted-foreground">
                          {formatDistance(route.distanceMeters)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-muted-foreground">
                          {formatTime(route.totalTimeMinutes)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground capitalize">
                          {route.difficulty}
                        </span>
                      </div>
                    </div>

                    {route.updatedAt && (
                      <div className={`text-xs text-muted-foreground ${viewMode === "list" ? "mt-2" : "border-t pt-3"}`}>
                        Ostatnia edycja: {formatDate(route.updatedAt)}
                      </div>
                    )}

                    <div className={`flex gap-2 ${viewMode === "list" ? "mt-4" : "pt-2"}`}>
                      <Button
                        variant={route.isPublished ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleTogglePublish(route)}
                        className={`${viewMode === "list" ? "flex-1" : "flex-1"} gap-2 ${
                          route.isPublished 
                            ? "border-red-200 text-red-700 hover:bg-red-50" 
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {route.isPublished ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Zdejmij
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Opublikuj
                          </>
                        )}
                      </Button>
                      <Link to={`/routes/create?edit=${route.pathId}`} className={viewMode === "list" ? "flex-1" : "flex-1"}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                          Edytuj
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          {/* Paginacja */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Poprzednia
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Następna
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default RoutesListPage
