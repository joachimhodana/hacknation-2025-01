import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Save, MapPin, Settings, ArrowLeft, ArrowRight } from "lucide-react"
import MapComponent from "@/components/shared/MapComponent/MapComponent.tsx"
import InformationCard from "@/components/shared/CustomCards/InformationCard/InformationCard.tsx"
import { getCharacterById, createCharacter, updateCharacter } from "@/services/charactersApi.ts"
import GeneralCharacterForm, { type CharacterFormData } from "./components/GeneralCharacterForm/GeneralCharacterForm.tsx"
import DefaultPositionStep, { type DefaultPosition } from "./components/DefaultPositionStep/DefaultPositionStep.tsx"
import CharacterStepsHeader from "./components/CharacterStepsHeader/CharacterStepsHeader.tsx"

const CharactersCreatorPage = () => {
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
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(null)
  const [initialFormValues, setInitialFormValues] = useState<Partial<CharacterFormData> | null>(null)

  const formRef = useRef<ReturnType<typeof useForm<CharacterFormData>> | null>(null)

  // Ładowanie danych postaci do edycji
  useEffect(() => {
    let isMounted = true

    const loadCharacter = async () => {
      if (editCharacterId) {
        try {
          setIsLoadingCharacter(true)
          const characterId = parseInt(editCharacterId, 10)

          if (isNaN(characterId)) {
            console.error("Invalid character ID:", editCharacterId)
            if (isMounted) {
              setValidationError("Nieprawidłowe ID postaci")
            }
            return
          }

          const character = await getCharacterById(characterId)

          if (!isMounted) return

          // Zapisz wartości początkowe dla formularza
          setInitialFormValues({
            name: character.name,
            avatarFile: null, // Pliki trzeba będzie załadować osobno z URL
            description: character.description || "",
          })

          // Zapisz istniejący URL avatara do wyświetlenia
          setExistingAvatarUrl(character.avatarUrl)

          // TODO: Jeśli API zwraca pozycję domyślną, ustaw ją tutaj
          // Na razie ustawiamy null, ponieważ CharacterType nie ma tego pola
          setDefaultPosition(null)
          setCurrentStep(1)
        } catch (error) {
          console.error("Error loading character:", error)
          if (isMounted) {
            setValidationError("Nie udało się załadować danych postaci")
          }
        } finally {
          if (isMounted) {
            setIsLoadingCharacter(false)
          }
        }
      } else {
        // Reset formularza jeśli nie edytujemy
        setInitialFormValues({
          name: "",
          avatarFile: null,
          description: "",
        })
        setDefaultPosition(null)
        setExistingAvatarUrl(null)
        setCurrentStep(1)
      }
    }

    loadCharacter()

    return () => {
      isMounted = false
    }
  }, [editCharacterId])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleFormReady = (form: ReturnType<typeof useForm<CharacterFormData>>) => {
    formRef.current = form
  }

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

    if (!formRef.current) return

    const isValid = await formRef.current.trigger()

    if (!isValid) {
      setValidationError("Proszę wypełnić wszystkie wymagane pola. Sprawdź komunikaty błędów pod polami.")
      return
    }

    setCurrentStep(2)
  }

  const handleSaveCharacter = async () => {
    setValidationError(null)
    setIsSaving(true)

    try {
      if (!formRef.current) return

      const isValid = await formRef.current.trigger()
      if (!isValid) {
        setValidationError("Proszę wypełnić wszystkie wymagane pola w ustawieniach ogólnych. Sprawdź komunikaty błędów pod polami.")
        setCurrentStep(1)
        return
      }

      // Pobierz aktualne wartości z formularza
      // Użyj watch() aby upewnić się, że otrzymujemy aktualne wartości
      const formValues = formRef.current.getValues()
      const watchedAvatarFile = formRef.current.watch('avatarFile')
      
      console.log('Form values before save:', {
        name: formValues.name,
        description: formValues.description,
        avatarFile: formValues.avatarFile,
        avatarFileType: typeof formValues.avatarFile,
        avatarFileInstance: formValues.avatarFile instanceof File,
        watchedAvatarFile: watchedAvatarFile,
        watchedAvatarFileType: typeof watchedAvatarFile,
        watchedAvatarFileInstance: watchedAvatarFile instanceof File,
      })

      // Sprawdź czy avatar jest wymagany (tylko dla nowych postaci bez istniejącego URL)
      if (!editCharacterId && !formValues.avatarFile && !existingAvatarUrl) {
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

        // Przygotuj dane do aktualizacji
        const updateData: { name: string; description?: string; avatarFile?: File } = {
          name: formValues.name,
        }
        
        // Dodaj description tylko jeśli nie jest pusty
        if (formValues.description && formValues.description.trim()) {
          updateData.description = formValues.description
        }
        
        // Dodaj avatarFile tylko jeśli został zmieniony (jest nowy plik)
        // Sprawdź zarówno getValues() jak i watch() aby upewnić się, że mamy aktualną wartość
        const avatarFile = formValues.avatarFile instanceof File ? formValues.avatarFile : 
                          (watchedAvatarFile instanceof File ? watchedAvatarFile : null)
        
        if (avatarFile instanceof File) {
          updateData.avatarFile = avatarFile
          console.log('Avatar file found, will be uploaded:', avatarFile.name, avatarFile.size, avatarFile.type)
        } else {
          console.log('No avatar file found. formValues.avatarFile:', formValues.avatarFile, 'watchedAvatarFile:', watchedAvatarFile)
        }

        console.log('Updating character with data:', {
          name: updateData.name,
          description: updateData.description,
          hasAvatarFile: !!updateData.avatarFile,
          avatarFileName: updateData.avatarFile?.name,
          avatarFileSize: updateData.avatarFile?.size
        })
        await updateCharacter(characterId, updateData)

        // Przekieruj do listy postaci po udanej aktualizacji
        navigate("/characters")
      } else {
        // Tworzenie nowej postaci
        await createCharacter({
          name: formValues.name,
          description: formValues.description || '',
          avatarFile: formValues.avatarFile || undefined,
          // TODO: defaultPosition nie jest obecnie obsługiwane w API
          // Można dodać to później gdy API będzie wspierać pozycję domyślną
        })

        // Przekieruj do listy postaci po udanym utworzeniu
        navigate("/characters")
      }
    } catch (error) {
      console.error("Error saving character:", error)
      const errorMessage = error instanceof Error ? error.message : "Nie udało się zapisać postaci. Spróbuj ponownie."
      setValidationError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemovePosition = () => {
    setDefaultPosition(null)
    setIsSelectingPosition(false)
  }

  const handlePositionDescriptionChange = (description: string) => {
    if (defaultPosition) {
      setDefaultPosition({
        ...defaultPosition,
        description,
      })
    }
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
                          hasCustomAudio: false,
                          audioFile: null,
                          characterId: null,
                          dialog: "",
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
          <CharacterStepsHeader editCharacterId={editCharacterId} currentStep={currentStep} />

          {/* Keep form mounted to preserve state */}
          <div className={currentStep === 1 ? "space-y-4" : "hidden"}>
            {/* Krok 1 - Ustawienia ogólne */}
            <InformationCard
              title="Krok 1: Ustawienia ogólne"
              description="Wypełnij podstawowe informacje o postaci. Po ukończeniu przejdź do kroku 2, aby opcjonalnie ustawić pozycję domyślną."
              icon={<Settings className="h-5 w-5 text-blue-600" />}
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
                <GeneralCharacterForm
                  onFormReady={handleFormReady}
                  onValidationChange={setIsFormValid}
                  initialValues={initialFormValues || undefined}
                  existingAvatarUrl={existingAvatarUrl}
                />
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
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                {!isFormValid && (
                  <p className="text-sm text-muted-foreground text-center">
                    Wypełnij wszystkie wymagane pola, aby przejść do następnego kroku
                  </p>
                )}
              </>
            )}
          </div>

          {/* Krok 2 - Pozycja domyślna */}
          {currentStep === 2 && (
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

              <DefaultPositionStep
                defaultPosition={defaultPosition}
                isSelectingPosition={isSelectingPosition}
                onPositionSelect={() => setIsSelectingPosition(true)}
                onPositionRemove={handleRemovePosition}
                onPositionDescriptionChange={handlePositionDescriptionChange}
              />

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

export default CharactersCreatorPage
