import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Button } from "@/components/ui/button.tsx"
import { MapPin, Clock, Route, Edit, Eye, EyeOff, Plus, Grid3x3, List } from "lucide-react"
import type { RoutesObjectType } from "@/types/RoutesType.tsx"

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
      {
        stop_id: 1,
        name: "Punkt 1",
        map_marker: {
          display_name: "Punkt 1",
          address: "Warszawa",
          coordinates: { latitude: 52.2297, longitude: 21.0122 },
        },
        place_description: "Opis",
        voice_over_text: "Dialog",
      },
      {
        stop_id: 2,
        name: "Punkt 2",
        map_marker: {
          display_name: "Punkt 2",
          address: "Warszawa",
          coordinates: { latitude: 52.2297, longitude: 21.0122 },
        },
        place_description: "Opis",
        voice_over_text: "Dialog",
      },
    ],
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
      {
        stop_id: 1,
        name: "Punkt 1",
        map_marker: {
          display_name: "Punkt 1",
          address: "Beskidy",
          coordinates: { latitude: 49.5, longitude: 19.0 },
        },
        place_description: "Opis",
        voice_over_text: "Dialog",
      },
    ],
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
      {
        stop_id: 1,
        name: "Punkt 1",
        map_marker: {
          display_name: "Punkt 1",
          address: "Okolica",
          coordinates: { latitude: 52.0, longitude: 21.0 },
        },
        place_description: "Opis",
        voice_over_text: "Dialog",
      },
      {
        stop_id: 2,
        name: "Punkt 2",
        map_marker: {
          display_name: "Punkt 2",
          address: "Okolica",
          coordinates: { latitude: 52.0, longitude: 21.0 },
        },
        place_description: "Opis",
        voice_over_text: "Dialog",
      },
      {
        stop_id: 3,
        name: "Punkt 3",
        map_marker: {
          display_name: "Punkt 3",
          address: "Okolica",
          coordinates: { latitude: 52.0, longitude: 21.0 },
        },
        place_description: "Opis",
        voice_over_text: "Dialog",
      },
    ],
  },
]

const ITEMS_PER_PAGE = 6

type ViewMode = "grid" | "list"

const RoutesListPage = () => {
  const [routes, setRoutes] = useState<RoutesObjectType[]>(mockRoutes)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const totalPages = Math.ceil(routes.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentRoutes = routes.slice(startIndex, endIndex)

  const handleTogglePublish = (pathId: string) => {
    setRoutes(
      routes.map((route) =>
        route.pathId === pathId ? { ...route, isPublished: !route.isPublished } : route,
      ),
    )
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
              className={
                viewMode === "grid"
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : ""
              }
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={
                viewMode === "list"
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : ""
              }
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Link to="/routes/create">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              Nowa trasa
            </Button>
          </Link>
        </div>
      </div>

      {routes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Route className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Brak tras. Stwórz pierwszą trasę!</p>
            <Link to="/routes/create">
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                Stwórz trasę
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
            }
          >
            {currentRoutes.map((route) => (
              <Card
                key={route.pathId}
                className={`hover:shadow-lg transition-shadow ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                {viewMode === "list" && (
                  <div className="w-48 h-48 bg-muted rounded-l-lg flex items-center justify-center flex-shrink-0">
                    <Route className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className={viewMode === "list" ? "flex-1 flex flex-col" : ""}>
                  <CardHeader>
                    <div
                      className={`flex items-start justify-between ${
                        viewMode === "list" ? "flex-row" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <CardTitle
                          className={`${
                            viewMode === "list" ? "text-xl" : "text-lg"
                          } mb-2`}
                        >
                          {route.title}
                        </CardTitle>
                        <p
                          className={`text-sm text-muted-foreground ${
                            viewMode === "list" ? "" : "line-clamp-2"
                          }`}
                        >
                          {route.shortDescription}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ml-2 ${
                          route.isPublished
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {route.isPublished ? "Opublikowana" : "Szkic"}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent
                    className={`${
                      viewMode === "list"
                        ? "flex-1 flex flex-col justify-between"
                        : "space-y-4"
                    }`}
                  >
                    <div
                      className={
                        viewMode === "list"
                          ? "flex items-center gap-6 flex-wrap"
                          : "grid grid-cols-2 gap-3"
                      }
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          {route.stops.length}{" "}
                          {route.stops.length === 1
                            ? "punkt"
                            : route.stops.length < 5
                            ? "punkty"
                            : "punktów"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Route className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          {formatDistance(route.distanceMeters)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary" />
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
                      <div
                        className={`text-xs text-muted-foreground ${
                          viewMode === "list" ? "mt-2" : "border-t pt-3"
                        }`}
                      >
                        Ostatnia edycja: {formatDate(route.updatedAt)}
                      </div>
                    )}

                    <div
                      className={`flex gap-2 ${
                        viewMode === "list" ? "mt-4" : "pt-2"
                      }`}
                    >
                      <Button
                        variant={route.isPublished ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleTogglePublish(route.pathId)}
                        className={`flex-1 gap-2 ${
                          route.isPublished
                            ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                            : "bg-primary hover:bg-primary/90 text-primary-foreground"
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
                      <Link
                        to={`/routes/create?edit=${route.pathId}`}
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 border-border text-foreground hover:bg-muted"
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Poprzednia
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : ""
                      }
                    >
                      {page}
                    </Button>
                  ),
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
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
