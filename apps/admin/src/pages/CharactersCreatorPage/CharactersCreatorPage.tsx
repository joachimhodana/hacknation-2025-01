import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Save, MapPin, Settings } from "lucide-react"
import MapComponent from "@/components/shared/MapComponent/MapComponent.tsx"
import InformationCard from "@/components/shared/CustomCards/InformationCard/InformationCard.tsx"
import { getCharacterById, createCharacter, updateCharacter } from "@/services/charactersApi.ts"
import GeneralCharacterForm, { type CharacterFormData } from "./components/GeneralCharacterForm/GeneralCharacterForm.tsx"
import CharacterStepsHeader from "./components/CharacterStepsHeader/CharacterStepsHeader.tsx"

const CharactersCreatorPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const editCharacterId = searchParams.get("edit")

  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [mounted, setMounted] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isFormValid, setIsFormValid] = useState(false)
  const [isLoadingCharacter, setIsLoadingCharacter] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(null)
  const [initialFormValues, setInitialFormValues] = useState<Partial<CharacterFormData> | null>(null)

  const formRef = useRef<ReturnType<typeof useForm<CharacterFormData>> | null>(null)

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

          setInitialFormValues({
            name: character.name,
            avatarFile: null,
            description: character.description || "",
          })

          setExistingAvatarUrl(character.avatarUrl)

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
        setInitialFormValues({
          name: "",
          avatarFile: null,
          description: "",
        })
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

      const formValues = formRef.current.getValues()
      const watchedAvatarFile = formRef.current.watch('avatarFile')

      if (!editCharacterId && !formValues.avatarFile && !existingAvatarUrl) {
        setValidationError("Avatar jest wymagany dla nowej postaci.")
        setCurrentStep(1)
        return
      }

      if (editCharacterId) {
        const characterId = parseInt(editCharacterId, 10)
        if (isNaN(characterId)) {
          setValidationError("Nieprawidłowe ID postaci")
          return
        }

        const updateData: { name: string; description?: string; avatarFile?: File } = {
          name: formValues.name,
        }
        
        if (formValues.description && formValues.description.trim()) {
          updateData.description = formValues.description
        }
        
        const avatarFile = formValues.avatarFile instanceof File ? formValues.avatarFile : 
                          (watchedAvatarFile instanceof File ? watchedAvatarFile : null)
        
        if (avatarFile instanceof File) {
          updateData.avatarFile = avatarFile
        }

        await updateCharacter(characterId, updateData)
        navigate("/characters")
      } else {
        await createCharacter({
          name: formValues.name,
          description: formValues.description || '',
          avatarFile: formValues.avatarFile || undefined,
        })

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
      <div className="flex-1 relative overflow-hidden isolate">
        {mounted ? (
          <>
            <div className="w-full h-full relative">
              <MapComponent
                points={[]}
                onMapClick={() => {}}
              />
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

      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 space-y-4">
          <CharacterStepsHeader editCharacterId={editCharacterId} currentStep={currentStep} />

          <div className="space-y-4">
            <InformationCard
              title="Ustawienia ogólne"
              description="Wypełnij podstawowe informacje o postaci."
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
              <Button
                onClick={handleSaveCharacter}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
                disabled={!isFormValid || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Zapisywanie..." : "Zapisz postać"}
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default CharactersCreatorPage
