import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useSearchParams, useNavigate } from "react-router-dom"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Save, MapPin, Settings, ArrowLeft, ArrowRight, CheckCircle2, X } from "lucide-react"
import MapComponent from "@/components/shared/MapComponent/MapComponent.tsx"
import InformationCard from "@/components/shared/CustomCards/InformationCard/InformationCard.tsx"
import { Form } from "@/components/ui/form.tsx"
import CustomUsualInput from "@/components/shared/CustomCards/CustomInput/CustomUsualInput.tsx"
import CustomFileInput from "@/components/shared/CustomCards/CustomInput/CustomFileInput.tsx"
import { getCharacterById } from "@/services/charactersApi.ts"

interface DefaultPosition {
  latitude: number
  longitude: number
  description: string
}

// Schemat walidacji Yup
const characterFormSchema = yup.object({
  name: yup
    .string()
    .required("Nazwa postaci jest wymagana")
    .min(2, "Nazwa musi mieć co najmniej 2 znaki")
    .max(50, "Nazwa może mieć maksymalnie 50 znaków"),
  avatarFile: yup
    .mixed<File>()
    .nullable()
    .test("fileType", "Plik musi być obrazem", (value) => {
      if (!value) return true // Avatar jest opcjonalny
      return value instanceof File && value.type.startsWith("image/")
    })
    .test("fileSize", "Plik nie może być większy niż 5MB", (value) => {
      if (!value) return true
      return value instanceof File && value.size <= 5 * 1024 * 1024
    }),
  description: yup
    .string()
    .max(500, "Opis może mieć maksymalnie 500 znaków"),
})

type CharacterFormData = yup.InferType<typeof characterFormSchema>

const CharacterCreatorPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const editCharacterId = searchParams.get("edit")

  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [mounted, setMounted] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isFormValid, setIsFormValid] = useState(false)
  const [defaultPosition, setDefaultPosition] = useState<DefaultPosition | null>(null)
  const [isSelectingPosition, setIsSelectingPosition] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<CharacterFormData>({
    resolver: yupResolver(characterFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      avatarFile: null,
      description: "",
    },
  })

  const { formState } = form

  // Ładowanie danych postaci do edycji
  useEffect(() => {
    const loadCharacter = async () => {
      if (editCharacterId) {
        try {
          setIsLoading(true)
          const character = await getCharacterById(Number(editCharacterId))

          // Wypełnij formularz
          form.reset({
            name: character.name,
            avatarFile: null, // Pliki trzeba będzie załadować osobno z URL
            description: character.description || "",
          })

          // Note: defaultPosition nie jest częścią API response, więc pomijamy to
          setDefaultPosition(null)
          setCurrentStep(1)
        } catch (error) {
          console.error("Failed to load character:", error)
          setValidationError("Nie udało się załadować postaci do edycji")
        } finally {
          setIsLoading(false)
        }
      } else {
        // Reset formularza jeśli nie edytujemy
        form.reset({
          name: "",
          avatarFile: null,
          description: "",
        })
        setDefaultPosition(null)
        setCurrentStep(1)
      }
    }

    loadCharacter()
  }, [editCharacterId, form])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Informuj o zmianie stanu walidacji
  useEffect(() => {
    setIsFormValid(formState.isValid)
  }, [formState.isValid])

  const handleMapClick = (lat: number, lng: number) => {
    // W kroku 1 nie pozwalamy na kliknięcie
    if (currentStep === 1) return
    
    // W kroku 2 kliknięcie działa tylko gdy użytkownik kliknął "Wybierz pozycję"
    if (currentStep === 2 && !isSelectingPosition) return

    setDefaultPosition({
      latitude: lat,
      longitude: lng,
      description: "",
    })
    setIsSelectingPosition(false)
  }

  const handleNextStep = async () => {
    setValidationError(null)

    const isValid = await form.trigger()

    if (!isValid) {
      setValidationError("Proszę wypełnić wszystkie wymagane pola. Sprawdź komunikaty błędów pod polami.")
      return
    }

    setCurrentStep(2)
  }

  const handleSaveCharacter = async () => {
    setValidationError(null)

    const isValid = await form.trigger()
    if (!isValid) {
      setValidationError("Proszę wypełnić wszystkie wymagane pola w ustawieniach ogólnych. Sprawdź komunikaty błędów pod polami.")
      setCurrentStep(1)
      return
    }

    try {
      setIsSaving(true)
      const formValues = form.getValues()

      const characterData = {
        name: formValues.name,
        avatarFile: formValues.avatarFile || undefined,
        description: formValues.description || undefined,
      }

      const API_BASE_URL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:8080"
      const ADMIN_CHARACTERS_ENDPOINT = `${API_BASE_URL}/admin/characters`

      if (editCharacterId) {
        // Update existing character using PATCH
        const formData = new FormData()
        formData.append('name', characterData.name)
        
        if (characterData.avatarFile) {
          formData.append('avatarFile', characterData.avatarFile)
        }
        
        if (characterData.description) {
          formData.append('description', characterData.description)
        }

        const response = await fetch(`${ADMIN_CHARACTERS_ENDPOINT}/${Number(editCharacterId)}`, {
          method: "PATCH",
          headers: {
            'Accept': 'application/json',
          },
          credentials: "include",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to update character: ${response.statusText}`)
        }

        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to update character")
        }
      } else {
        // Create new character using PUT
        const formData = new FormData()
        formData.append('name', characterData.name)
        
        if (characterData.avatarFile) {
          formData.append('avatarFile', characterData.avatarFile)
        }
        
        if (characterData.description) {
          formData.append('description', characterData.description)
        }

        const response = await fetch(ADMIN_CHARACTERS_ENDPOINT, {
          method: "PUT",
          headers: {
            'Accept': 'application/json',
          },
          credentials: "include",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to create character: ${response.statusText}`)
        }

        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to create character")
        }
      }

      // Redirect to characters list after successful save
      navigate("/characters")
    } catch (error) {
      console.error("Failed to save character:", error)
      setValidationError(
        error instanceof Error 
          ? error.message 
          : "Nie udało się zapisać postaci. Spróbuj ponownie."
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemovePosition = () => {
    setDefaultPosition(null)
    setIsSelectingPosition(false)
  }

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">
            {isLoading ? "Ładowanie postaci..." : "Ładowanie kreatora..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Lewa strona - Mapa */}
      <div className="flex-1 relative h-full">
        {mounted ? (
          <>
            <MapComponent
              points={defaultPosition ? [{
                id: "default-position",
                name: "Pozycja domyślna",
                description: defaultPosition.description || "",
                lat: defaultPosition.latitude,
                lng: defaultPosition.longitude,
                order: 1,
                hasCustomAudio: false,
                audioFile: null,
                characterName: "",
                dialog: "",
              }] : []}
              onMapClick={handleMapClick}
            />
            {currentStep === 1 && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Mapa niedostępna</h3>
                  </div>
                  <p className="text-gray-600">
                    W kroku 1 nie możesz korzystać z mapy. Przejdź do kroku 2, aby ustawić pozycję domyślną postaci.
                  </p>
                </div>
              </div>
            )}
          </>
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
            <div>
              <h2 className="text-xl font-bold">
                {editCharacterId ? "Edytuj postać" : "Kreator postaci"}
              </h2>
              {editCharacterId && (
                <p className="text-sm text-muted-foreground">ID: {editCharacterId}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded ${currentStep === 1 ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-600"}`}
              >
                <CheckCircle2 className={`h-4 w-4 ${currentStep === 1 ? "text-blue-600" : "text-gray-400"}`} />
                <span className="text-sm font-medium">Krok 1</span>
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded ${currentStep === 2 ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-600"}`}
              >
                <CheckCircle2 className={`h-4 w-4 ${currentStep === 2 ? "text-blue-600" : "text-gray-400"}`} />
                <span className="text-sm font-medium">Krok 2</span>
              </div>
            </div>
          </div>

          {currentStep === 1 ? (
            /* Krok 1 - Ustawienia ogólne */
            <div className="space-y-4">
              <InformationCard
                title="Krok 1: Ustawienia ogólne"
                description="Wypełnij podstawowe informacje o postaci. Po ukończeniu przejdź do kroku 2, aby opcjonalnie ustawić pozycję domyślną."
                icon={<Settings className="h-5 w-5 text-blue-600" />}
              />
              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{validationError}</p>
                </div>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>Ustawienia ogólne</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <div className="space-y-4">
                      <CustomUsualInput
                        name="name"
                        label="Nazwa postaci"
                        placeholder="Podaj nazwę postaci"
                      />

                      <CustomUsualInput
                        name="description"
                        label="Opis postaci (opcjonalnie)"
                        placeholder="Podaj opis postaci"
                      />

                      <CustomFileInput
                        name="avatarFile"
                        label="Avatar (opcjonalnie)"
                        description="Przeciągnij i upuść plik obrazu lub kliknij, aby wybrać"
                        accept="image/*"
                      />
                    </div>
                  </Form>
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
            /* Krok 2 - Pozycja domyślna */
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Powrót do kroku 1
                </Button>
              </div>
              <InformationCard
                title="Krok 2: Pozycja domyślna (opcjonalnie)"
                description="Możesz opcjonalnie ustawić pozycję domyślną postaci na mapie. Kliknij przycisk poniżej, a następnie kliknij na mapie, aby wybrać pozycję."
                icon={<MapPin className="h-5 w-5 text-blue-600" />}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Pozycja domyślna</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {defaultPosition ? (
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-blue-900">Pozycja wybrana</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemovePosition}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-blue-800 space-y-1">
                          <p>
                            <strong>Szerokość:</strong> {defaultPosition.latitude.toFixed(6)}
                          </p>
                          <p>
                            <strong>Długość:</strong> {defaultPosition.longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="position-description">Opis pozycji (opcjonalnie)</Label>
                        <Input
                          id="position-description"
                          value={defaultPosition.description}
                          onChange={(e) =>
                            setDefaultPosition({
                              ...defaultPosition,
                              description: e.target.value,
                            })
                          }
                          placeholder="Np. Główna siedziba postaci"
                          className="bg-background"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Nie wybrano pozycji domyślnej. Kliknij przycisk poniżej, aby wybrać pozycję na mapie.
                      </p>
                      <Button
                        onClick={() => setIsSelectingPosition(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Wybierz pozycję na mapie
                      </Button>
                    </div>
                  )}

                  {isSelectingPosition && !defaultPosition && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        Kliknij na mapie po lewej stronie, aby wybrać pozycję domyślną.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                onClick={handleSaveCharacter}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Zapisywanie..." : editCharacterId ? "Zaktualizuj postać" : "Zapisz postać"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CharacterCreatorPage
