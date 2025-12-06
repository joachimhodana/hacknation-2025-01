import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Textarea } from "@/components/ui/textarea.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import {Save, Plus, GripVertical, Trash2, Edit2, MapPin, Settings, ArrowLeft, ArrowRight, CheckCircle2} from "lucide-react"
import MapComponent from "../MapComponent.tsx"
import InformationCard from "@/components/shared/CustomCards/InformationCard/InformationCard.tsx";
import GeneralRouteForm from "./components/GeneralRouteForm/GeneralRouteForm.tsx";

interface RoutePoint {
  id: string
  name: string
  description: string
  lat: number
  lng: number
  order: number
  hasCustomAudio: boolean
  characterName: string
  dialog: string
}


// Mock data dla postaci
const characterOptions = [
  { value: "historian", label: "Historyk" },
  { value: "guide", label: "Przewodnik" },
  { value: "local", label: "Mieszkaniec" },
  { value: "artist", label: "Artysta" },
  { value: "scientist", label: "Naukowiec" },
  { value: "writer", label: "Pisarz" },
  { value: "explorer", label: "Odkrywca" },
];

const RouteCreatorPage =() => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [points, setPoints] = useState<RoutePoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isFormValid, setIsFormValid] = useState(false)
  const formRef = useRef<ReturnType<typeof useForm<any>> | null>(null)

  useEffect(() => {
    // Opóźnij montowanie mapy, aby uniknąć problemów z inicjalizacją
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleMapClick = (lat: number, lng: number) => {
    // Blokuj tworzenie punktów w kroku 1
    if (currentStep === 1) return;
    
    const newPoint: RoutePoint = {
      id: Date.now().toString(),
      name: `Punkt ${points.length + 1}`,
      description: "",
      lat,
      lng,
      order: points.length + 1,
      hasCustomAudio: false,
      characterName: "",
      dialog: "",
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
    setValidationError(null) // Wyczyść błąd po zapisaniu punktu
  }

  // Walidacja punktów - sprawdza czy wszystkie wymagane pola są wypełnione
  const validatePoints = (): boolean => {
    setValidationError(null)
    
    if (points.length === 0) {
      setValidationError("Musisz dodać przynajmniej jeden punkt")
      return false
    }

    for (const point of points) {
      if (!point.name || point.name.trim() === "") {
        setValidationError(`Punkt ${point.order} nie ma wypełnionej nazwy`)
        // Zaznacz punkt, który ma błąd
        setSelectedPoint(point)
        setIsEditing(true)
        return false
      }
      if (!point.description || point.description.trim() === "") {
        setValidationError(`Punkt ${point.order} nie ma wypełnionego opisu`)
        setSelectedPoint(point)
        setIsEditing(true)
        return false
      }
      if (!point.characterName || point.characterName.trim() === "") {
        setValidationError(`Punkt ${point.order} nie ma wybranej postaci`)
        setSelectedPoint(point)
        setIsEditing(true)
        return false
      }
      if (!point.dialog || point.dialog.trim() === "") {
        setValidationError(`Punkt ${point.order} nie ma wypełnionego dialogu`)
        setSelectedPoint(point)
        setIsEditing(true)
        return false
      }
    }

    return true
  }

  // Obsługa przejścia do kroku 2 z walidacją
  const handleNextStep = async () => {
    setValidationError(null)
    
    if (!formRef.current) {
      setValidationError("Formularz nie jest jeszcze gotowy")
      return
    }

    // Sprawdź walidację formularza
    const isValid = await formRef.current.trigger()
    
    if (!isValid) {
      setValidationError("Proszę wypełnić wszystkie wymagane pola w ustawieniach ogólnych. Sprawdź komunikaty błędów pod polami.")
      return
    }

    setCurrentStep(2)
  }

  const handleSaveRoute = async () => {
    setValidationError(null)
    
    // Walidacja punktów
    if (!validatePoints()) {
      return
    }

    // Walidacja formularza ustawień ogólnych
    if (!formRef.current) {
      setValidationError("Formularz ustawień ogólnych nie jest jeszcze gotowy")
      return
    }

    const isFormValid = await formRef.current.trigger()
    if (!isFormValid) {
      setValidationError("Proszę wypełnić wszystkie wymagane pola w ustawieniach ogólnych. Sprawdź komunikaty błędów pod polami.")
      setCurrentStep(1) // Przejdź do kroku 1, aby pokazać błędy
      return
    }

    // Pobierz dane z formularza ustawień ogólnych
    const formValues = formRef.current.getValues()
    const generalData: any = {};
    
    Object.keys(formValues).forEach((key) => {
      const value = formValues[key];
      if (value instanceof File) {
        generalData[key] = {
          name: value.name,
          size: value.size,
          type: value.type,
          // W rzeczywistej aplikacji trzeba by przesłać plik do serwera
        };
      } else {
        generalData[key] = value;
      }
    });

    const routeData = {
      ...generalData,
      points: points.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        lat: p.lat,
        lng: p.lng,
        order: p.order,
        hasCustomAudio: p.hasCustomAudio,
        characterName: p.characterName,
        dialog: p.dialog,
      })),
      createdAt: new Date().toISOString(),
    }
    console.log(routeData)
    // localStorage.setItem(`route_preview_${Date.now()}`, JSON.stringify(routeData, null, 2));
    //TODO stworzyć fetch post
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
      {/*Lewa strona - Mapa*/}
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


      {/* Prawa strona - Panel kroków */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Header z krokami */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Kreator trasy</h2>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${currentStep === 1 ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-600'}`}>
                <CheckCircle2 className={`h-4 w-4 ${currentStep === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">Krok 1</span>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${currentStep === 2 ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-600'}`}>
                <CheckCircle2 className={`h-4 w-4 ${currentStep === 2 ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">Krok 2</span>
              </div>
            </div>
          </div>

          {currentStep === 1 ? (
            /* Krok 1 - Ustawienia ogólne */
            <div className="space-y-4">
              <InformationCard
                title="Krok 1: Ustawienia ogólne"
                description="Wypełnij podstawowe informacje o trasie. Po ukończeniu przejdź do kroku 2, aby dodać punkty."
                icon={<Settings className="h-5 w-5 text-blue-600"/>}
              />
              {validationError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{validationError}</p>
                </div>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>Ustawienia ogólne</CardTitle>
                </CardHeader>
                <CardContent>
                  <GeneralRouteForm 
                    onFormReady={(form) => { formRef.current = form }} 
                    onValidationChange={(isValid) => setIsFormValid(isValid)}
                  />
                </CardContent>
              </Card>
              <Button 
                onClick={handleNextStep} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
                disabled={!isFormValid}
              >
                Przejdź do kroku 2
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              {!isFormValid && (
                <p className="text-sm text-muted-foreground text-center">
                  Wypełnij wszystkie wymagane pola, aby przejść do następnego kroku
                </p>
              )}
            </div>
          ) : (
            /* Krok 2 - Punkty trasy */
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Powrót do kroku 1
                </Button>
              </div>
              <InformationCard
                title="Krok 2: Punkty trasy"
                description="Kliknij na mapie, aby dodać punkty trasy. Następnie kliknij na punkt w liście, aby go edytować."
                icon={<MapPin className="h-5 w-5 text-blue-600"/>}
              />

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
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="point-has-custom-audio"
                        checked={selectedPoint.hasCustomAudio}
                        onChange={(e) =>
                          setSelectedPoint({ ...selectedPoint, hasCustomAudio: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="point-has-custom-audio" className="text-sm font-medium">
                        Własne audio dla tego punktu
                      </Label>
                    </div>
                    {selectedPoint.hasCustomAudio && (
                      <div className="bg-blue-50  border border-blue-200  rounded-lg p-3">
                        <p className="text-xs text-blue-800 ">
                          Możesz wgrać własne audio dla tego punktu. Format: MP3, WAV, OGG
                        </p>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="point-character">Postać</Label>
                      <select
                        id="point-character"
                        value={selectedPoint.characterName}
                        onChange={(e) =>
                          setSelectedPoint({ ...selectedPoint, characterName: e.target.value })
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Wybierz postać...</option>
                        {characterOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="point-dialog">Dialog</Label>
                      <Textarea
                        id="point-dialog"
                        value={selectedPoint.dialog}
                        onChange={(e) =>
                          setSelectedPoint({ ...selectedPoint, dialog: e.target.value })
                        }
                        rows={3}
                        placeholder="Wprowadź dialog dla tego punktu..."
                        className="bg-background"
                      />
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

              {validationError && (
                <div className="bg-red-50  border border-red-200  rounded-lg p-3">
                  <p className="text-sm text-red-800">{validationError}</p>
                </div>
              )}
              <Button 
                onClick={handleSaveRoute} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                size="lg"
                disabled={points.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Zapisz trasę
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default RouteCreatorPage