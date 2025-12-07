import { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Textarea } from "@/components/ui/textarea.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils.ts"
import MapComponent from "@/components/shared/MapComponent/MapComponent.tsx"
import InformationCard from "@/components/shared/CustomCards/InformationCard/InformationCard.tsx"
import GeneralRouteForm from "./components/GeneralRouteForm/GeneralRouteForm.tsx"
import { calculateEstimatedTime, formatTime } from "@/lib/route-utils.ts"
import { createPath, getPath } from "@/lib/api-client.ts"
import { getBackendImageUrl } from "@/lib/image-utils.ts"
import { getCharacters as getCharactersFromApi } from "@/services/charactersApi.ts"
import type { CharacterType } from "@/types/CharactersType.tsx"

interface RoutePoint {
  id: string
  name: string
  description: string
  lat: number
  lng: number
  order: number
  hasCustomAudio: boolean
  audioFile: File | null
  characterId: number | null
  dialog: string
}

// Audio file input component
function AudioFileInput({
  id,
  file,
  onFileChange,
}: {
  id: string
  file: File | null
  onFileChange: (file: File | null) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-m4a']
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
      const isValidType = validTypes.includes(selectedFile.type) ||
        ['mp3', 'wav', 'ogg', 'webm', 'm4a'].includes(fileExtension || '')

      if (!isValidType) {
        alert('Nieprawidłowy format pliku. Dozwolone formaty: MP3, WAV, OGG, WEBM, M4A')
        return
      }
      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('Plik jest za duży. Maksymalny rozmiar: 10MB')
        return
      }
      onFileChange(selectedFile)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-m4a']
      const fileExtension = droppedFile.name.split('.').pop()?.toLowerCase()
      const isValidType = validTypes.includes(droppedFile.type) ||
        ['mp3', 'wav', 'ogg', 'webm', 'm4a'].includes(fileExtension || '')

      if (!isValidType) {
        alert('Nieprawidłowy format pliku. Dozwolone formaty: MP3, WAV, OGG, WEBM, M4A')
        return
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        alert('Plik jest za duży. Maksymalny rozmiar: 10MB')
        return
      }
      onFileChange(droppedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleRemove = () => {
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          file ? "border-blue-500 bg-blue-50/50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm"
          onChange={handleFileChange}
          className="hidden"
        />
        {file ? (
          <div className="relative">
            <div className="flex items-center justify-center gap-3">
              <Icon icon="solar:music-note-bold-duotone" className="h-12 w-12 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <Icon icon="solar:close-circle-bold-duotone" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div>
            <Icon icon="solar:upload-bold-duotone" className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              Kliknij lub przeciągnij plik audio tutaj
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const RouteCreatorPage = () => {
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
  const formRef = useRef<ReturnType<typeof useForm<any>> | null>(null)
  const [initialFormValues, setInitialFormValues] = useState<any>(null)
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null)
  const [existingMarkerIconUrl, setExistingMarkerIconUrl] = useState<string | null>(null)

  // Ładowanie danych trasy do edycji
  useEffect(() => {
    if (editPathId) {
      const loadRouteData = async () => {
        try {
          setIsLoading(true)
          const response = await getPath(editPathId)
          
          if (response.success && response.data) {
            const route = response.data
            
            // Konwertuj points z API na RoutePoint format
            // Backend zwraca points jako tablicę z { point: {...}, orderIndex: number }
            if (route.points && Array.isArray(route.points)) {
              if (route.points.length > 0) {
                const convertedPoints: RoutePoint[] = route.points.map((pointData: any, index: number) => {
                  // Backend zwraca { point: {...}, orderIndex: number }
                  const point = pointData.point || pointData
                  
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
                    order: pointData.orderIndex !== undefined ? pointData.orderIndex + 1 : index + 1,
                    hasCustomAudio: !!point.audioUrl,
                    audioFile: null,
                    characterId: point.characterId || null,
                    dialog: point.narrationText || "",
                  }
                }).filter((p): p is RoutePoint => p !== null)
                
                setPoints(convertedPoints)
              } else {
                setPoints([])
              }
            } else {
              setPoints([])
            }
            
            // Zapisz istniejące URL-e plików
            setExistingThumbnailUrl(route.thumbnailUrl || null)
            setExistingMarkerIconUrl(route.markerIconUrl || null)
            
            // Ustaw markerIconUrl z pełnym URL z backendu, jeśli istnieje
            if (route.markerIconUrl) {
              const fullMarkerIconUrl = getBackendImageUrl(route.markerIconUrl)
              if (fullMarkerIconUrl) {
                setMarkerIconUrl(fullMarkerIconUrl)
              }
            }
            
            // Przygotuj wartości formularza z obiektu route
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
            
            // Ustaw initial values, które będą użyte przy tworzeniu formularza
            setInitialFormValues(formValues)
            
            // Wypełnij formularz gdy będzie gotowy
            const maxAttempts = 50
            let attempts = 0
            
            const loadData = () => {
              if (formRef.current) {
                formRef.current.reset(formValues, { keepDefaultValues: false })
                formRef.current.setValue("title", formValues.title, { shouldValidate: false })
                formRef.current.setValue("shortDescription", formValues.shortDescription, { shouldValidate: false })
                formRef.current.setValue("longDescription", formValues.longDescription, { shouldValidate: false })
                formRef.current.setValue("category", formValues.category, { shouldValidate: false })
                formRef.current.setValue("difficulty", formValues.difficulty, { shouldValidate: false })
                formRef.current.setValue("stylePreset", formValues.stylePreset, { shouldValidate: false })
                
                setCurrentStep(1)
                setIsLoading(false)
              } else if (attempts < maxAttempts) {
                attempts++
                setTimeout(loadData, 100)
              } else {
                setCurrentStep(1)
                setIsLoading(false)
              }
            }
            
            loadData()
          } else {
            setValidationError(response.error || "Nie udało się załadować trasy")
            setIsLoading(false)
          }
        } catch (err: any) {
          console.error("Error loading route:", err)
          setValidationError(err?.message || "Wystąpił błąd podczas ładowania trasy")
          setIsLoading(false)
        }
      }
      
      loadRouteData()
    }
  }, [editPathId])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

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

  // Watch for marker icon changes in form
  useEffect(() => {
    if (!formRef.current) return

    const checkMarkerIcon = () => {
      const formValues = formRef.current?.getValues()
      if (formValues?.makerIconFile instanceof File) {
        setMarkerIconUrl((prevUrl) => {
          // Only revoke if it's a blob URL (created with createObjectURL)
          if (prevUrl && prevUrl.startsWith('blob:')) {
            URL.revokeObjectURL(prevUrl)
          }
          return URL.createObjectURL(formValues.makerIconFile)
        })
      } else if (!formValues?.makerIconFile) {
        // If no file selected, use existing marker icon URL from backend if available
        if (existingMarkerIconUrl) {
          const fullUrl = getBackendImageUrl(existingMarkerIconUrl)
          if (fullUrl) {
            setMarkerIconUrl((prevUrl) => {
              // Only revoke if it's a blob URL
              if (prevUrl && prevUrl.startsWith('blob:')) {
                URL.revokeObjectURL(prevUrl)
              }
              return fullUrl
            })
          } else {
            setMarkerIconUrl((prevUrl) => {
              // Only revoke if it's a blob URL
              if (prevUrl && prevUrl.startsWith('blob:')) {
                URL.revokeObjectURL(prevUrl)
              }
              return null
            })
          }
        } else {
          setMarkerIconUrl((prevUrl) => {
            // Only revoke if it's a blob URL
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
        // Only revoke if it's a blob URL
        if (prevUrl && prevUrl.startsWith('blob:')) {
          URL.revokeObjectURL(prevUrl)
        }
        return null
      })
    }
  }, [formRef.current, isFormValid, existingMarkerIconUrl])

  useEffect(() => {
    if (isFormValid && formRef.current) {
      const formValues = formRef.current.getValues()
      if (formValues?.makerIconFile instanceof File) {
        setMarkerIconUrl((prevUrl) => {
          // Only revoke if it's a blob URL
          if (prevUrl && prevUrl.startsWith('blob:')) {
            URL.revokeObjectURL(prevUrl)
          }
          return URL.createObjectURL(formValues.makerIconFile)
        })
      } else if (existingMarkerIconUrl) {
        // Use existing marker icon URL from backend if no file selected
        const fullUrl = getBackendImageUrl(existingMarkerIconUrl)
        if (fullUrl) {
          setMarkerIconUrl((prevUrl) => {
            // Only revoke if it's a blob URL
            if (prevUrl && prevUrl.startsWith('blob:')) {
              URL.revokeObjectURL(prevUrl)
            }
            return fullUrl
          })
        }
      }
    }
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
    setValidationError(null)
  }

  const handleMarkerMove = (pointId: string, lat: number, lng: number) => {
    const updatedPoints = points.map((p) =>
      p.id === pointId ? { ...p, lat, lng } : p
    )
    setPoints(updatedPoints)

    // Update selected point if it's the one being moved
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
      // Walidacja punktów
      if (!validatePoints()) {
        setIsSaving(false)
        return
      }

      // Walidacja formularza ustawień ogólnych
      if (!formRef.current) {
        setValidationError("Formularz ustawień ogólnych nie jest jeszcze gotowy")
        setIsSaving(false)
        return
      }

      const isFormValid = await formRef.current.trigger()
      if (!isFormValid) {
        setValidationError("Proszę wypełnić wszystkie wymagane pola w ustawieniach ogólnych. Sprawdź komunikaty błędów pod polami.")
        setCurrentStep(1) // Przejdź do kroku 1, aby pokazać błędy
        setIsSaving(false)
        return
      }

      // Pobierz aktualne dane z formularza ustawień ogólnych
      // getValues() zwraca aktualne wartości formularza
      const formValues = formRef.current.getValues()

      const estimatedTimeHours = calculateEstimatedTime(routeDistance, 3)
      const totalTimeMinutes = Math.round(estimatedTimeHours * 60)
      const distanceMeters = Math.round(routeDistance * 1000)

      const API_BASE_URL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:8080"

      if (editPathId) {
        const formData = new FormData()
        formData.append('title', formValues.title)
        formData.append('shortDescription', formValues.shortDescription)
        if (formValues.longDescription) {
          formData.append('longDescription', formValues.longDescription)
        }
        formData.append('category', formValues.category)
        formData.append('difficulty', formValues.difficulty)
        formData.append('totalTimeMinutes', totalTimeMinutes.toString())
        formData.append('distanceMeters', distanceMeters.toString())
        
        if (formValues.thumbnailFile instanceof File) {
          formData.append('thumbnailFile', formValues.thumbnailFile)
        }
        
        if (formValues.makerIconFile instanceof File) {
          formData.append('markerIconFile', formValues.makerIconFile)
        }
        
        if (formValues.stylePreset) {
          formData.append('stylePreset', formValues.stylePreset)
        }

        // Add points data for editing - always send points, even if empty array
        const sortedPoints = [...points].sort((a, b) => a.order - b.order)
        const pointsData = sortedPoints.map((point) => ({
          latitude: point.lat,
          longitude: point.lng,
          radiusMeters: 50,
          locationLabel: point.name,
          narrationText: point.dialog || point.description || "",
          characterId: point.characterId ? Number(point.characterId) : undefined,
          audioFile: point.hasCustomAudio && point.audioFile ? point.audioFile : undefined,
        }))
        
        // Prepare points data (without File objects, they'll be added separately)
        const pointsDataWithoutFiles = pointsData.map((point) => ({
          latitude: point.latitude,
          longitude: point.longitude,
          radiusMeters: point.radiusMeters,
          locationLabel: point.locationLabel,
          narrationText: point.narrationText,
          characterId: point.characterId,
        }))
        
        // Always send points array, even if empty
        formData.append('points', JSON.stringify(pointsDataWithoutFiles))

        // Add audio files with indices (audioFile_0, audioFile_1, etc.)
        pointsData.forEach((point, index) => {
          if (point.audioFile) {
            formData.append(`audioFile_${index}`, point.audioFile)
          }
        })

        const response = await fetch(`${API_BASE_URL}/admin/paths/${editPathId}`, {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: formData,
        })

        const result = await response.json()

        if (!result.success || !result.data) {
          setValidationError(result.error || "Nie udało się zaktualizować trasy")
          setIsSaving(false)
          return
        }

        navigate("/routes")
      } else {
        if (!existingThumbnailUrl && (!formValues.thumbnailFile || !(formValues.thumbnailFile instanceof File))) {
          setValidationError("Miniatura jest wymagana")
          setCurrentStep(1)
          setIsSaving(false)
          return
        }

        const pathId = formValues.pathId || `route_${Date.now()}`

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
          thumbnailFile: formValues.thumbnailFile,
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

    } catch (error: any) {
      console.error("Error saving route:", error)
      setValidationError(error?.message || "Wystąpił błąd podczas zapisywania trasy")
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
      <div className="flex-1 relative">
        {mounted ? (
          <>
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
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon icon="solar:map-point-bold-duotone" className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Mapa niedostępna</h3>
                  </div>
                  <p className="text-gray-600">
                    W kroku 1 nie możesz korzystać z mapy. Przejdź do kroku 2, aby dodać punkty trasy.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <div className="text-center">
              <Icon icon="solar:map-point-bold-duotone" className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Ładowanie mapy...</p>
            </div>
          </div>
        )}

        {points.length >= 2 && (
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-neutral-200 z-1000">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:route-bold-duotone" className="h-4 w-4 text-neutral-700" />
                  <span className="text-sm font-medium text-neutral-900">Długość trasy</span>
                </div>
                <div className="text-lg font-semibold text-neutral-900 tracking-tight">
                  {routeDistance.toFixed(2)} km
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:clock-circle-bold-duotone" className="h-4 w-4 text-neutral-700" />
                  <span className="text-sm font-medium text-neutral-900">Szacowany czas</span>
                </div>
                <div className="text-lg font-semibold text-neutral-900 tracking-tight">
                  {formattedTime}
                </div>
              </div>
              <div className="text-xs text-neutral-500 pt-2 border-t border-neutral-200">
                (przy prędkości 3 km/h)
              </div>
            </div>
          </div>
        )}
      </div>


      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">
                {editPathId ? "Edytuj trasę" : "Kreator trasy"}
              </h2>
              {editPathId && (
                <p className="text-sm text-muted-foreground">ID: {editPathId}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${currentStep === 1 ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-600'}`}>
                <Icon icon="solar:check-circle-bold-duotone" className={`h-4 w-4 ${currentStep === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">Krok 1</span>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${currentStep === 2 ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-600'}`}>
                <Icon icon="solar:check-circle-bold-duotone" className={`h-4 w-4 ${currentStep === 2 ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">Krok 2</span>
              </div>
            </div>
          </div>

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
                      if (initialFormValues) {
                        form.reset(initialFormValues, { keepDefaultValues: false })
                        form.setValue("title", initialFormValues.title, { shouldValidate: false })
                        form.setValue("shortDescription", initialFormValues.shortDescription, { shouldValidate: false })
                        form.setValue("longDescription", initialFormValues.longDescription, { shouldValidate: false })
                        form.setValue("category", initialFormValues.category, { shouldValidate: false })
                        form.setValue("difficulty", initialFormValues.difficulty, { shouldValidate: false })
                        form.setValue("stylePreset", initialFormValues.stylePreset, { shouldValidate: false })
                        setTimeout(() => {
                          form.trigger()
                        }, 100)
                      }
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
          </div>

          {currentStep === 2 && (
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Punkty trasy ({points.length})</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const centerLat = 53.1235
                        const centerLng = 18.0084
                        handleMapClick(centerLat, centerLng)
                      }}
                      className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                    >
                      <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4 mr-2" />
                      Dodaj punkt
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {points.length === 0 ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                      <Icon icon="solar:map-point-bold-duotone" className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        Brak punktów
                      </p>
                      <p className="text-xs text-blue-600">
                        Kliknij na mapie, aby dodać pierwszy punkt
                      </p>
                    </div>
                  ) : (
                    points
                      .sort((a, b) => a.order - b.order)
                      .map((point) => (
                        <div
                          key={point.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedPoint?.id === point.id
                              ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                              : "hover:bg-blue-50/50 border-border"
                            }`}
                          onClick={() => {
                            setSelectedPoint(point)
                            setIsEditing(true)
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <Icon icon="solar:menu-dots-vertical-bold-duotone" className="h-4 w-4 text-muted-foreground" />
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
                                <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </CardContent>
              </Card>

              {selectedPoint && isEditing && (
                <Card className="border-blue-200 bg-blue-50/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon icon="solar:pen-bold-duotone" className="h-4 w-4" />
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
                      <div>
                        <Label htmlFor="point-audio-file">Plik audio</Label>
                        <AudioFileInput
                          id="point-audio-file"
                          file={selectedPoint.audioFile}
                          onFileChange={(file) =>
                            setSelectedPoint({ ...selectedPoint, audioFile: file })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Format: MP3, WAV, OGG (maks. 10MB)
                        </p>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="point-character">Postać</Label>
                      <select
                        id="point-character"
                        value={selectedPoint.characterId || ""}
                        onChange={(e) =>
                          setSelectedPoint({ 
                            ...selectedPoint, 
                            characterId: e.target.value ? Number(e.target.value) : null 
                          })
                        }
                        disabled={isLoadingCharacters}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Wybierz postać...</option>
                        {characters.map((character) => (
                          <option key={character.id} value={character.id}>
                            {character.name}
                          </option>
                        ))}
                      </select>
                      {isLoadingCharacters && (
                        <p className="text-xs text-muted-foreground mt-1">Ładowanie postaci...</p>
                      )}
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

export default RouteCreatorPage