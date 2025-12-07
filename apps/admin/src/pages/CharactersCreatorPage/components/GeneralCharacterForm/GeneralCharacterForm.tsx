import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Form } from "@/components/ui/form.tsx"
import CustomUsualInput from "@/components/shared/CustomCards/CustomInput/CustomUsualInput.tsx"
import CustomFileInput from "@/components/shared/CustomCards/CustomInput/CustomFileInput.tsx"

export interface CharacterFormData {
  name: string
  avatarFile: File | null
  description?: string
}

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

type GeneralCharacterFormProps = {
  onFormReady?: (form: ReturnType<typeof useForm<CharacterFormData>>) => void
  onValidationChange?: (isValid: boolean) => void
  initialValues?: Partial<CharacterFormData>
  existingAvatarUrl?: string | null
}

const GeneralCharacterForm = ({
  onFormReady,
  onValidationChange,
  initialValues,
  existingAvatarUrl,
}: GeneralCharacterFormProps) => {
  const form = useForm<CharacterFormData>({
    resolver: yupResolver(characterFormSchema),
    mode: "onChange",
    defaultValues: {
      name: initialValues?.name || "",
      avatarFile: initialValues?.avatarFile || null,
      description: initialValues?.description || "",
    },
  })

  const { formState } = form
  const hasInitialized = useRef(false)

  // Przekaż formularz do komponentu rodzica
  useEffect(() => {
    if (onFormReady) {
      onFormReady(form)
    }
  }, [form, onFormReady])

  // Aktualizuj wartości formularza tylko przy pierwszym załadowaniu initialValues
  useEffect(() => {
    if (initialValues && !hasInitialized.current) {
      form.reset({
        name: initialValues.name || "",
        avatarFile: initialValues.avatarFile || null,
        description: initialValues.description || "",
      }, { keepDefaultValues: false })
      hasInitialized.current = true
      // Wywołaj walidację po ustawieniu wartości
      setTimeout(() => {
        form.trigger()
      }, 100)
    }
  }, [initialValues, form])

  // Informuj o zmianie stanu walidacji
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(formState.isValid)
    }
  }, [formState.isValid, onValidationChange])

  return (
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
          existingUrl={existingAvatarUrl}
        />
      </div>
    </Form>
  )
}

export default GeneralCharacterForm
