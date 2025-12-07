import { useState, useEffect, useRef } from "react"
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
import type { CharacterType } from "@/types/CharactersType.tsx"
import { useNavigate } from "react-router-dom"

interface DefaultPosition {
  latitude: number
  longitude: number
  description: string
}

type CharacterFormData = {
  name: string
  avatarFile: File | null
}

// Mock data - w prawdziwej aplikacji dane będą z API
// Używamy tego samego mock data co w CharactersListPage
const getMockCharacters = (): CharacterType[] => [
  {
    id: "1",
    name: "Historyk",
    avatar: null as any,
    createdBy: "admin",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastModifiedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    deafultPosition: {
      latitude: 52.2297,
      longitude: 21.0122,
      description: "Muzeum Historii"
    }
  },
  {
    id: "2",
    name: "Przewodnik",
    avatar: null as any,
    createdBy: "admin",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    lastModifiedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    deafultPosition: {
      latitude: 52.2300,
      longitude: 21.0130,
      description: "Centrum miasta"
    }
  },
  {
    id: "3",
    name: "Mieszkaniec",
    avatar: null as any,
    createdBy: "admin",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastModifiedAt: new Date(Date.now() - 3600000).toISOString(),
    deafultPosition: null as any,
  },
]

// Typ dla formularza
interface CharacterFormData {
  name: string
  avatarFile: File | null
}

// Schemat walidacji Yup - avatar jest opcjonalny (może być null przy edycji)
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
      if (!value) return true // Null jest OK
      return value instanceof File && value.type.startsWith("image/")
    })
    .test("fileSize", "Plik nie może być większy niż 5MB", (value) => {
      if (!value) return true // Null jest OK
      return value instanceof File && value.size <= 5 * 1024 * 1024
    }),
}) as yup.ObjectSchema<CharacterFormData>

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
  const [isLoadingCharacter, setIsLoadingCharacter] = useState(false)
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
          setIsLoadingCharacter(true)
          const characterId = parseInt(editCharacterId, 10)

          if (isNaN(characterId)) {
            console.error("Invalid character ID:", editCharacterId)
            setValidationError("Nieprawidłowe ID postaci")
            return
          }

          const character = await getCharacterById(characterId)

          // Wypełnij formularz
          form.reset({
            name: character.name,
            avatarFile: null, // Pliki trzeba będzie załadować osobno z URL
            description: character.description || "",
          })

          // Ustaw pozycję domyślną jeśli istnieje
          if (character.deafultPosition) {
            setDefaultPosition({
              latitude: character.deafultPosition.latitude,
              longitude: character.deafultPosition.longitude,
              description: character.deafultPosition.description || "",
            })
            // Przejdź do kroku 2 jeśli jest pozycja
            setCurrentStep(2)
          } else {
            setDefaultPosition(null)
          }
        }, 100)
      }
    } else {
      // Reset formularza jeśli nie edytujemy
      form.reset({
        name: "",
        avatarFile: null,
      })
      setDefaultPosition(null)
      setCurrentStep(1)
          // TODO: Jeśli API zwraca pozycję domyślną, ustaw ją tutaj
          // Na razie ustawiamy null, ponieważ CharacterType nie ma tego pola
          setDefaultPosition(null)
          setCurrentStep(1)

          // Wyczyść błędy walidacji po załadowaniu danych
          form.clearErrors()
        } catch (error) {
          console.error("Error loading character:", error)
          setValidationError("Nie udało się załadować danych postaci")
        } finally {
          setIsLoadingCharacter(false)
        }
      } else {
        // Reset formularza jeśli nie edytujemy
        form.reset({
          name: "",
          avatarFile: null,
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

      const formValues = form.getValues()

      // Sprawdź czy avatar jest wymagany (tylko dla nowych postaci)
      if (!editCharacterId && !formValues.avatarFile) {
        setValidationError("Avatar jest wymagany dla nowej postaci.")
        setCurrentStep(1)
        return
      }

      if (editCharacterId) {
        // Aktualizacja istniejącej postaci
        const characterId = parseInt(editCharacterId, 10)
        if (isNaN(characterId)) {
          setValidationError("Nieprawidłowe ID postaci")
          return
        }

        await updateCharacter(characterId, {
          name: formValues.name,
          avatarFile: formValues.avatarFile || undefined,
          // TODO: defaultPosition nie jest obecnie obsługiwane w API
          // Można dodać to później gdy API będzie wspierać pozycję domyślną
        })

        // Przekieruj do listy postaci po udanej aktualizacji
        navigate("/characters")
      } else {
        // Tworzenie nowej postaci
        await createCharacter({
          name: formValues.name,
          avatarFile: formValues.avatarFile || undefined,
          // TODO: defaultPosition nie jest obecnie obsługiwane w API
          // Można dodać to później gdy API będzie wspierać pozycję domyślną
        })

        // Przekieruj do listy postaci po udanym utworzeniu
        navigate("/characters")
      }
    } catch (error: any) {
      console.error("Error saving character:", error)
      setValidationError(error?.message || "Nie udało się zapisać postaci. Spróbuj ponownie.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemovePosition = () => {
    setDefaultPosition(null)
    setIsSelectingPosition(false)
  }

  if (!mounted || isLoadingCharacter) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">
            {isLoadingCharacter ? "Ładowanie danych postaci..." : "Ładowanie kreatora..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Lewa strona - Mapa */}
      <div className="flex-1 relative overflow-hidden isolate">
        {mounted ? (
          <>
            <div className="w-full h-full relative">
              <MapComponent
                points={
                  defaultPosition
                    ? [
                        {
                          id: "default-position",
                          name: "Pozycja domyślna",
                          description: defaultPosition.description || "",
                          lat: defaultPosition.latitude,
                          lng: defaultPosition.longitude,
                          order: 1,
                        },
                      ]
                    : []
                }
                onMapClick={handleMapClick}
              />
              {/* Overlay na mapie gdy jesteśmy w kroku 1 */}
              {currentStep === 1 && (
                <>
                  {/* Warstwa blur tylko na mapie */}
                  <div className="absolute inset-0 bg-background/60 z-[50] pointer-events-none" style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
                  {/* Komunikat */}
                  <div className="absolute inset-0 z-[51] flex items-center justify-center pointer-events-none">
                    <div className="bg-background/95 backdrop-blur-md rounded-lg p-6 shadow-lg border border-border max-w-md mx-4 text-center">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-lg font-semibold mb-2">Przejdź do kroku 2</h3>
                      <p className="text-sm text-muted-foreground">
                        Aby wybrać pozycję domyślną na mapie, najpierw wypełnij podstawowe informacje o postaci i przejdź do kroku 2.
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
                {isSaving ? "Zapisywanie..." : "Zapisz postać"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CharacterCreatorPage
