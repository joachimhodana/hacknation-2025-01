import { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Icon } from "@iconify/react"
import MapComponent from "@/components/shared/MapComponent/MapComponent.tsx"
import InformationCard from "@/components/shared/CustomCards/InformationCard/InformationCard.tsx"
import GeneralRouteForm from "./components/GeneralRouteForm/GeneralRouteForm.tsx"
import RouteStepsHeader from "./components/RouteStepsHeader/RouteStepsHeader.tsx"
import RouteStatisticsOverlay from "./components/RouteStatisticsOverlay/RouteStatisticsOverlay.tsx"
import PointsList, { type RoutePoint } from "./components/PointsList/PointsList.tsx"
import PointEditPanel from "./components/PointEditPanel/PointEditPanel.tsx"
import { calculateEstimatedTime, formatTime } from "@/lib/route-utils.ts"
import { createPath, getPath } from "@/lib/api-client.ts"
import { getBackendImageUrl } from "@/lib/image-utils.ts"
import { getCharacters as getCharactersFromApi } from "@/services/charactersApi.ts"
import type { CharacterType } from "@/types/CharactersType.tsx"

type RouteFormData = {
  title: string
  shortDescription: string
  longDescription: string
  category: string
  difficulty: string
  thumbnailFile: File | null
  stylePreset: string
  makerIconFile: File | null
}

const RoutesCreatorPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const editPathId = searchParams.get("edit")
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [points, setPoints] = useState<RoutePoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isFormValid, setIsFormValid] = useState(false)
  const [markerIconUrl, setMarkerIconUrl] = useState<string | null>(null)
  const [routeDistance, setRouteDistance] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [characters, setCharacters] = useState<CharacterType[]>([])
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false)
  const formRef = useRef<ReturnType<typeof useForm<RouteFormData>> | null>(null)
  const [initialFormValues, setInitialFormValues] = useState<Partial<RouteFormData> | null>(null)
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null)
  const [existingMarkerIconUrl, setExistingMarkerIconUrl] = useState<string | null>(null)

  useEffect(() => {
    if (editPathId) {
      const loadRouteData = async () => {
        try {
          setIsLoading(true)
          const response = await getPath(editPathId)

          if (response.success && response.data) {
            const route = response.data

            if (route.points && Array.isArray(route.points)) {
              if (route.points.length > 0) {
                const convertedPoints: RoutePoint[] = route.points.map((pointData: unknown, index: number) => {
                  type PointDataWithOrder = {
                    point?: {
                      id?: number
                      latitude: number
                      longitude: number
                      locationLabel?: string | null
                      narrationText?: string | null
                      audioUrl?: string | null
                      characterId?: number | null
                    }
                    orderIndex?: number
                  }
                  
                  type PointDataDirect = {
                    id?: number
                    latitude: number
                    longitude: number
                    locationLabel?: string | null
                    narrationText?: string | null
                    audioUrl?: string | null
                    characterId?: number | null
                  }

                  const data = pointData as PointDataWithOrder | PointDataDirect
                  const point = 'point' in data && data.point ? data.point : (data as PointDataDirect)
                  const orderIndex = 'orderIndex' in data ? data.orderIndex : undefined

                  if (!point || typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
                    console.warn('Invalid point data:', pointData)
                    return null
                  }

                  return {
                    id: point.id?.toString() || `point_${index}`,
                    name: point.locationLabel || `Punkt ${index + 1}`,
                    description: point.narrationText || "",
                    lat: point.latitude,
                    lng: point.longitude,
                    order: orderIndex !== undefined ? orderIndex + 1 : index + 1,
                    hasCustomAudio: !!point.audioUrl,
                    audioFile: null,
                    characterId: point.characterId || null,
                    dialog: point.narrationText || "",
                  }
                }).filter((p: RoutePoint | null): p is RoutePoint => p !== null)

                setPoints(convertedPoints)
              } else {
                setPoints([])
              }
            } else {
              setPoints([])
            }

            setExistingThumbnailUrl(route.thumbnailUrl || null)
            setExistingMarkerIconUrl(route.markerIconUrl || null)
            if (route.markerIconUrl) {
              const fullMarkerIconUrl = getBackendImageUrl(route.markerIconUrl)
              if (fullMarkerIconUrl) {
                setMarkerIconUrl(fullMarkerIconUrl)
              }
            }

            const formValues = {
              title: route.title || "",
              shortDescription: route.shortDescription || "",
              longDescription: route.longDescription || "",
              category: route.category || "",
              difficulty: route.difficulty || "",
              thumbnailFile: null,
              stylePreset: route.stylePreset || "",
              makerIconFile: null,
            }

            setInitialFormValues(formValues)
            setCurrentStep(1)
            setIsLoading(false)
          } else {
            setValidationError(response.error || "Nie udało się załadować trasy")
            setIsLoading(false)
          }
        } catch (err) {
          console.error("Error loading route:", err)
          const errorMessage = err instanceof Error ? err.message : "Wystąpił błąd podczas ładowania trasy"
          setValidationError(errorMessage)
          setIsLoading(false)
        }
      }
      
      loadRouteData()
    }
  }, [editPathId])

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setIsLoadingCharacters(true)
        const charactersData = await getCharactersFromApi()
        setCharacters(charactersData)
      } catch (error) {
        console.error("Failed to load characters:", error)
      } finally {
        setIsLoadingCharacters(false)
      }
    }

    loadCharacters()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!formRef.current) return

    const checkMarkerIcon = () => {
      const formValues = formRef.current?.getValues()
      if (formValues?.makerIconFile instanceof File) {
        const file = formValues.makerIconFile
        setMarkerIconUrl((prevUrl) => {
          if (prevUrl && prevUrl.startsWith('blob:')) {
            URL.revokeObjectURL(prevUrl)
          }
          return URL.createObjectURL(file)
        })
      } else if (!formValues?.makerIconFile) {
        if (existingMarkerIconUrl) {
          const fullUrl = getBackendImageUrl(existingMarkerIconUrl)
          if (fullUrl) {
            setMarkerIconUrl((prevUrl) => {
              if (prevUrl && prevUrl.startsWith('blob:')) {
                URL.revokeObjectURL(prevUrl)
              }
              return fullUrl
            })
          } else {
            setMarkerIconUrl((prevUrl) => {
              if (prevUrl && prevUrl.startsWith('blob:')) {
                URL.revokeObjectURL(prevUrl)
              }
              return null
            })
          }
        } else {
          setMarkerIconUrl((prevUrl) => {
            if (prevUrl && prevUrl.startsWith('blob:')) {
              URL.revokeObjectURL(prevUrl)
            }
            return null
          })
        }
      }
    }

    checkMarkerIcon()

    const subscription = formRef.current.watch(() => {
      checkMarkerIcon()
    })

    return () => {
      subscription.unsubscribe()
      setMarkerIconUrl((prevUrl) => {
        if (prevUrl && prevUrl.startsWith('blob:')) {
          URL.revokeObjectURL(prevUrl)
        }
        return null
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormValid, existingMarkerIconUrl])

  const estimatedTimeHours = calculateEstimatedTime(routeDistance, 3)
  const formattedTime = formatTime(estimatedTimeHours)

  const handleMapClick = (lat: number, lng: number) => {
    if (currentStep === 1) return

    const newPoint: RoutePoint = {
      id: Date.now().toString(),
      name: `Punkt ${points.length + 1}`,
      description: "",
      lat,
      lng,
      order: points.length + 1,
      hasCustomAudio: false,
      audioFile: null,
      characterId: null,
      dialog: "",
    }
    setPoints([...points, newPoint])
    setSelectedPoint(newPoint)
    setIsEditing(true)
  }

  const handleDeletePoint = (id: string) => {
    const newPoints = points.filter((p: RoutePoint) => p.id !== id).map((p: RoutePoint, index: number) => ({
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
    setValidationError(null)
  }

  const handleMarkerMove = (pointId: string, lat: number, lng: number) => {
    const updatedPoints = points.map((p) =>
      p.id === pointId ? { ...p, lat, lng } : p
    )
    setPoints(updatedPoints)

    if (selectedPoint?.id === pointId) {
      setSelectedPoint({ ...selectedPoint, lat, lng })
    }
  }

  const validatePoints = (): boolean => {
    setValidationError(null)

    if (points.length === 0) {
      setValidationError("Musisz dodać przynajmniej jeden punkt")
      return false
    }

    for (const point of points) {
      if (!point.name || point.name.trim() === "") {
        setValidationError(`Punkt ${point.order} nie ma wypełnionej nazwy`)
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

  const handleNextStep = async () => {
    if (editPathId) {
      return
    }

    setValidationError(null)

    if (!formRef.current) {
      setValidationError("Formularz nie jest jeszcze gotowy")
      return
    }

    const isValid = await formRef.current.trigger()

    if (!isValid) {
      setValidationError("Proszę wypełnić wszystkie wymagane pola w ustawieniach ogólnych. Sprawdź komunikaty błędów pod polami.")
      return
    }

    setCurrentStep(2)
  }

  const handleSaveRoute = async () => {
    setValidationError(null)
    setIsSaving(true)

    try {
      if (!editPathId || currentStep === 2) {
        if (!validatePoints()) {
          setIsSaving(false)
          return
        }
      }

      if (!formRef.current) {
        setValidationError("Formularz ustawień ogólnych nie jest jeszcze gotowy")
        setIsSaving(false)
        return
      }

      const isFormValid = await formRef.current.trigger()
      if (!isFormValid) {
        setValidationError("Proszę wypełnić wszystkie wymagane pola w ustawieniach ogólnych. Sprawdź komunikaty błędów pod polami.")
        setCurrentStep(1)
        setIsSaving(false)
        return
      }

      await formRef.current.trigger()
      const formValues = formRef.current.getValues()

      const estimatedTimeHours = calculateEstimatedTime(routeDistance, 3)
      const totalTimeMinutes = Math.round(estimatedTimeHours * 60)
      const distanceMeters = Math.round(routeDistance * 1000)

      const API_BASE_URL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:8080"

      if (editPathId) {
        const formData = new FormData()
        
        formData.append('title', formValues.title || '')
        formData.append('shortDescription', formValues.shortDescription || '')
        formData.append('longDescription', formValues.longDescription || '')
        formData.append('category', formValues.category || '')
        formData.append('difficulty', formValues.difficulty || '')
        formData.append('totalTimeMinutes', totalTimeMinutes.toString())
        formData.append('distanceMeters', distanceMeters.toString())

        if (formValues.stylePreset !== undefined) {
          formData.append('stylePreset', formValues.stylePreset || '')
        }

        if (formValues.thumbnailFile instanceof File) {
          formData.append('thumbnailFile', formValues.thumbnailFile)
        }

        if (formValues.makerIconFile instanceof File) {
          formData.append('markerIconFile', formValues.makerIconFile)
        }

        if (currentStep === 2) {
          formData.append('points', JSON.stringify([]))
        }

        const pathResponse = await fetch(`${API_BASE_URL}/admin/paths/${editPathId}`, {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: formData,
        })

        const pathResult = await pathResponse.json()

        if (!pathResult.success || !pathResult.data) {
          setValidationError(pathResult.error || "Nie udało się zaktualizować trasy")
          setIsSaving(false)
          return
        }

        if (currentStep === 1) {
          navigate("/routes")
          return
        }

        const pathNumericId = pathResult.data.id
        const sortedPoints = [...points].sort((a, b) => a.order - b.order)
        
        for (let index = 0; index < sortedPoints.length; index++) {
          const point = sortedPoints[index]
          const isExistingPoint = point.id && !isNaN(Number(point.id))
          const pointId = isExistingPoint ? Number(point.id) : null

          const pointFormData = new FormData()
          pointFormData.append('latitude', point.lat.toString())
          pointFormData.append('longitude', point.lng.toString())
          pointFormData.append('radiusMeters', '50')
          pointFormData.append('locationLabel', point.name)
          pointFormData.append('narrationText', point.dialog || point.description || "")
          
          if (point.characterId) {
            pointFormData.append('characterId', point.characterId.toString())
          }

          if (point.hasCustomAudio && point.audioFile) {
            pointFormData.append('audioFile', point.audioFile)
          }

          let savedPointId: number

          if (isExistingPoint && pointId) {
            const patchResponse = await fetch(`${API_BASE_URL}/admin/points/${pointId}`, {
              method: 'PATCH',
              headers: {
                'Accept': 'application/json',
              },
              credentials: 'include',
              body: pointFormData,
            })

            const patchResult = await patchResponse.json()
            if (!patchResult.success || !patchResult.data) {
              throw new Error(patchResult.error || `Nie udało się zaktualizować punktu ${index + 1}`)
            }
            savedPointId = patchResult.data.id
          } else {
            const newPointFormData = new FormData()
            newPointFormData.append('points', JSON.stringify([{
              latitude: point.lat,
              longitude: point.lng,
              radiusMeters: 50,
              locationLabel: point.name,
              narrationText: point.dialog || point.description || "",
              characterId: point.characterId ? Number(point.characterId) : null,
            }]))
            
            if (point.hasCustomAudio && point.audioFile) {
              newPointFormData.append('audioFile_0', point.audioFile)
            }

            const createPointResponse = await fetch(`${API_BASE_URL}/admin/paths/${editPathId}`, {
              method: 'PATCH',
              headers: {
                'Accept': 'application/json',
              },
              credentials: 'include',
              body: newPointFormData,
            })

            const createPointResult = await createPointResponse.json()
            if (!createPointResult.success) {
              throw new Error(createPointResult.error || `Nie udało się utworzyć punktu ${index + 1}`)
            }

            const getPathResponse = await fetch(`${API_BASE_URL}/admin/paths/${editPathId}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
              credentials: 'include',
            })

            const getPathResult = await getPathResponse.json()
            if (!getPathResult.success || !getPathResult.data?.points) {
              throw new Error("Nie udało się pobrać ID nowego punktu")
            }

            const pathPoints = getPathResult.data.points
            const newPoint = pathPoints[pathPoints.length - 1]
            savedPointId = newPoint.point?.id || newPoint.id

            const updateNewPointResponse = await fetch(`${API_BASE_URL}/admin/points/${savedPointId}`, {
              method: 'PATCH',
              headers: {
                'Accept': 'application/json',
              },
              credentials: 'include',
              body: pointFormData,
            })

            const updateNewPointResult = await updateNewPointResponse.json()
            if (!updateNewPointResult.success || !updateNewPointResult.data) {
              throw new Error(updateNewPointResult.error || `Nie udało się zaktualizować nowego punktu ${index + 1}`)
            }
          }

          await fetch(`${API_BASE_URL}/admin/points/${savedPointId}/remove-from-path/${pathNumericId}`, {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
            },
            credentials: 'include',
          })

          const addToPathResponse = await fetch(`${API_BASE_URL}/admin/points/${savedPointId}/add-to-path/${pathNumericId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ orderIndex: index }),
          })

          const addToPathResult = await addToPathResponse.json()
          if (!addToPathResult.success) {
            throw new Error(addToPathResult.error || `Nie udało się dodać punktu ${index + 1} do trasy`)
          }
        }

        navigate("/routes")
      } else {
        if (!existingThumbnailUrl && (!formValues.thumbnailFile || !(formValues.thumbnailFile instanceof File))) {
          setValidationError("Miniatura jest wymagana")
          setCurrentStep(1)
          setIsSaving(false)
          return
        }

        if (!formValues.thumbnailFile || !(formValues.thumbnailFile instanceof File)) {
          setValidationError("Miniatura jest wymagana")
          setCurrentStep(1)
          setIsSaving(false)
          return
        }

        const thumbnailFile = formValues.thumbnailFile

        const pathId = `route_${Date.now()}`

        const sortedPoints = [...points].sort((a, b) => a.order - b.order)
        const pointsData = sortedPoints.map((point) => ({
          latitude: point.lat,
          longitude: point.lng,
          radiusMeters: 50,
          locationLabel: point.name,
          narrationText: point.dialog || point.description,
          characterId: point.characterId ? Number(point.characterId) : undefined,
          audioFile: point.hasCustomAudio && point.audioFile ? point.audioFile : undefined,
        }))

      const pathResponse = await createPath({
        pathId,
        title: formValues.title,
        shortDescription: formValues.shortDescription,
        longDescription: formValues.longDescription || undefined,
        category: formValues.category,
        difficulty: formValues.difficulty,
        totalTimeMinutes,
        distanceMeters,
        thumbnailFile,
        markerIconFile: formValues.makerIconFile instanceof File ? formValues.makerIconFile : undefined,
        stylePreset: formValues.stylePreset || undefined,
        points: pointsData,
      })

      if (!pathResponse.success || !pathResponse.data) {
        setValidationError(pathResponse.error || "Nie udało się utworzyć trasy")
        setIsSaving(false)
        return
      }

      navigate("/routes")
      }

    } catch (error) {
      console.error("Error saving route:", error)
      const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas zapisywania trasy"
      setValidationError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <Icon icon="solar:map-point-bold-duotone" className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Ładowanie kreatora...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="flex-1 relative overflow-hidden isolate">
        {mounted ? (
          <>
            <div className="w-full h-full relative">
              <MapComponent
                points={points}
                onMapClick={handleMapClick}
                markerIconUrl={markerIconUrl}
                onRouteDistanceChange={setRouteDistance}
                onMarkerMove={handleMarkerMove}
                onMarkerDelete={handleDeletePoint}
                selectedPointId={selectedPoint?.id || null}
              />
              {currentStep === 1 && (
                <>
                  <div className="absolute inset-0 bg-background/60 z-[50] pointer-events-none" style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
                  <div className="absolute inset-0 z-[51] flex items-center justify-center pointer-events-none">
                    <div className="bg-background/95 backdrop-blur-md rounded-lg p-6 shadow-lg border border-border max-w-md mx-4 text-center">
                      <Icon icon="solar:map-point-bold-duotone" className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-lg font-semibold mb-2">Przejdź do kroku 2</h3>
                      <p className="text-sm text-muted-foreground">
                        Aby dodać punkty na mapie, najpierw wypełnij podstawowe informacje o trasie i przejdź do kroku 2.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <div className="text-center">
              <Icon icon="solar:map-point-bold-duotone" className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Ładowanie mapy...</p>
            </div>
          </div>
        )}

        {points.length >= 2 && currentStep === 2 && (
          <RouteStatisticsOverlay
            routeDistance={routeDistance}
            formattedTime={formattedTime}
          />
        )}
      </div>

      <div className="w-1/3 border-r overflow-y-auto relative z-[100] bg-background">
        <div className="p-4 space-y-4">
          <RouteStepsHeader editPathId={editPathId} currentStep={currentStep} />

          <div className={currentStep === 1 ? "space-y-4" : "hidden"}>
            <InformationCard
              title="Krok 1: Ustawienia ogólne"
              description="Wypełnij podstawowe informacje o trasie. Po ukończeniu przejdź do kroku 2, aby dodać punkty."
              icon={<Icon icon="solar:settings-bold-duotone" className="h-5 w-5 text-blue-600" />}
            />
            {validationError && currentStep === 1 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{validationError}</p>
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Ustawienia ogólne</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Ładowanie danych trasy...</p>
                  </div>
                ) : (
                  <GeneralRouteForm
                    onFormReady={(form) => { 
                      formRef.current = form
                    }}
                    onValidationChange={(isValid) => setIsFormValid(isValid)}
                    initialValues={initialFormValues || undefined}
                    existingThumbnailUrl={existingThumbnailUrl}
                    existingMarkerIconUrl={existingMarkerIconUrl}
                  />
                )}
              </CardContent>
            </Card>
            {currentStep === 1 && (
              <>
                {editPathId ? (
                  <Button
                    onClick={handleSaveRoute}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                    disabled={!isFormValid || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2 animate-spin" />
                        Zapisywanie...
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:diskette-bold-duotone" className="h-4 w-4 mr-2" />
                        Zapisz trasę
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleNextStep}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      size="lg"
                      disabled={!isFormValid}
                    >
                      Przejdź do kroku 2
                      <Icon icon="solar:alt-arrow-right-bold-duotone" className="h-4 w-4 ml-2" />
                    </Button>
                    {!isFormValid && (
                      <p className="text-sm text-muted-foreground text-center">
                        Wypełnij wszystkie wymagane pola, aby przejść do następnego kroku
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {currentStep === 2 && !editPathId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                  className="gap-2"
                >
                  <Icon icon="solar:alt-arrow-left-bold-duotone" className="h-4 w-4" />
                  Powrót do kroku 1
                </Button>
              </div>
              <InformationCard
                title="Krok 2: Punkty trasy"
                description="Kliknij na mapie, aby dodać punkty trasy. Następnie kliknij na punkt w liście, aby go edytować."
                icon={<Icon icon="solar:map-point-bold-duotone" className="h-5 w-5 text-blue-600" />}
              />

              <PointsList
                points={points}
                selectedPoint={selectedPoint}
                onPointSelect={(point) => {
                  setSelectedPoint(point)
                  setIsEditing(true)
                }}
                onPointDelete={handleDeletePoint}
                onPointMove={handleMovePoint}
                onAddPoint={() => {
                  const centerLat = 53.1235
                  const centerLng = 18.0084
                  handleMapClick(centerLat, centerLng)
                }}
              />

              {selectedPoint && isEditing && (
                <PointEditPanel
                  point={selectedPoint}
                  characters={characters}
                  isLoadingCharacters={isLoadingCharacters}
                  onPointChange={setSelectedPoint}
                  onSave={handleSavePoint}
                />
              )}

              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{validationError}</p>
                </div>
              )}
              <Button
                onClick={handleSaveRoute}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
                disabled={points.length === 0 || isSaving}
              >
                {isSaving ? (
                  <>
                    <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:diskette-bold-duotone" className="h-4 w-4 mr-2" />
                    Zapisz trasę
                  </>
                )}
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default RoutesCreatorPage