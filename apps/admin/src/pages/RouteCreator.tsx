import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Plus, GripVertical, Trash2, Edit2, MapPin } from "lucide-react"
import MapComponent from "./MapComponent"

interface RoutePoint {
  id: string
  name: string
  description: string
  lat: number
  lng: number
  order: number
}


export function RouteCreator() {
  const [routeName, setRouteName] = useState("")
  const [points, setPoints] = useState<RoutePoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Opóźnij montowanie mapy, aby uniknąć problemów z inicjalizacją
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleMapClick = (lat: number, lng: number) => {
    const newPoint: RoutePoint = {
      id: Date.now().toString(),
      name: `Punkt ${points.length + 1}`,
      description: "",
      lat,
      lng,
      order: points.length + 1,
    }
    setPoints([...points, newPoint])
    setSelectedPoint(newPoint)
    setIsEditing(true)
  }

  const handleDeletePoint = (id: string) => {
    const newPoints = points.filter((p) => p.id !== id).map((p, index) => ({
      ...p,
      order: index + 1,
    }))
    setPoints(newPoints)
    if (selectedPoint?.id === id) {
      setSelectedPoint(null)
      setIsEditing(false)
    }
  }

  const handleMovePoint = (id: string, direction: "up" | "down") => {
    const index = points.findIndex((p) => p.id === id)
    if (index === -1) return

    const newPoints = [...points]
    if (direction === "up" && index > 0) {
      ;[newPoints[index - 1], newPoints[index]] = [newPoints[index], newPoints[index - 1]]
      newPoints[index - 1].order = index
      newPoints[index].order = index + 1
    } else if (direction === "down" && index < points.length - 1) {
      ;[newPoints[index], newPoints[index + 1]] = [newPoints[index + 1], newPoints[index]]
      newPoints[index].order = index + 1
      newPoints[index + 1].order = index + 2
    }
    setPoints(newPoints)
  }

  const handleSavePoint = () => {
    if (!selectedPoint) return
    const updatedPoints = points.map((p) =>
      p.id === selectedPoint.id ? selectedPoint : p
    )
    setPoints(updatedPoints)
    setIsEditing(false)
  }

  const handleSaveRoute = () => {
    if (!routeName.trim()) {
      alert("Proszę podać nazwę trasy")
      return
    }
    if (points.length === 0) {
      alert("Proszę dodać przynajmniej jeden punkt")
      return
    }
    // Tutaj będzie zapis do localStorage lub API
    const routeData = {
      name: routeName,
      points: points,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(`route_${Date.now()}`, JSON.stringify(routeData))
    alert("Trasa została zapisana!")
    setRouteName("")
    setPoints([])
    setSelectedPoint(null)
    setIsEditing(false)
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Ładowanie kreatora...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Lewa strona - Panel nawigacji i edycji */}
      <div className="w-1/3 border-r bg-card overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Instrukcja
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Kliknij na mapie po prawej stronie, aby dodać punkt trasy. Następnie kliknij na punkt w liście, aby go edytować.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Nazwa trasy</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="Wprowadź nazwę trasy"
                className="bg-background"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Punkty trasy ({points.length})</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const centerLat = 52.2297
                    const centerLng = 21.0122
                    handleMapClick(centerLat, centerLng)
                  }}
                  className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 border-blue-200 dark:border-blue-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj punkt
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {points.length === 0 ? (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                    Brak punktów
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    Kliknij na mapie, aby dodać pierwszy punkt
                  </p>
                </div>
              ) : (
                points
                  .sort((a, b) => a.order - b.order)
                  .map((point) => (
                    <div
                      key={point.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedPoint?.id === point.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-200 dark:ring-blue-800"
                          : "hover:bg-blue-50/50 dark:hover:bg-blue-950/10 border-border"
                      }`}
                      onClick={() => {
                        setSelectedPoint(point)
                        setIsEditing(true)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">{point.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMovePoint(point.id, "up")
                            }}
                            disabled={point.order === 1}
                            className="h-8 w-8"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMovePoint(point.id, "down")
                            }}
                            disabled={point.order === points.length}
                            className="h-8 w-8"
                          >
                            ↓
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePoint(point.id)
                            }}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>

          {/* Panel edycji punktu */}
          {selectedPoint && isEditing && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Edit2 className="h-4 w-4" />
                  Edycja punktu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="point-name">Nazwa</Label>
                  <Input
                    id="point-name"
                    value={selectedPoint.name}
                    onChange={(e) =>
                      setSelectedPoint({ ...selectedPoint, name: e.target.value })
                    }
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="point-description">Opis</Label>
                  <Textarea
                    id="point-description"
                    value={selectedPoint.description}
                    onChange={(e) =>
                      setSelectedPoint({ ...selectedPoint, description: e.target.value })
                    }
                    rows={4}
                    className="bg-background"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="point-lat">Szerokość geograficzna</Label>
                    <Input
                      id="point-lat"
                      type="number"
                      step="any"
                      value={selectedPoint.lat}
                      onChange={(e) =>
                        setSelectedPoint({
                          ...selectedPoint,
                          lat: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="point-lng">Długość geograficzna</Label>
                    <Input
                      id="point-lng"
                      type="number"
                      step="any"
                      value={selectedPoint.lng}
                      onChange={(e) =>
                        setSelectedPoint({
                          ...selectedPoint,
                          lng: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="bg-background"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleSavePoint} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Zapisz zmiany
                </Button>
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={handleSaveRoute} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
            size="lg"
            disabled={!routeName.trim() || points.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Zapisz trasę
          </Button>
        </div>
      </div>

      {/* Prawa strona - Mapa */}
      <div className="flex-1 relative">
        {mounted ? (
          <MapComponent points={points} onMapClick={handleMapClick} />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Ładowanie mapy...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
