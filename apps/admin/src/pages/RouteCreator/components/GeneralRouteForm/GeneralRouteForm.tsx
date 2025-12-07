import {useEffect} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {Form} from "@/components/ui/form.tsx";
import CustomUsualInput from "@/components/shared/CustomCards/CustomInput/CustomUsualInput.tsx";
import CustomSelectInput from "@/components/shared/CustomCards/CustomInput/CustomSelectInput.tsx";
import CustomFileInput from "@/components/shared/CustomCards/CustomInput/CustomFileInput.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage} from "@/components/ui/form.tsx";

type RouteFormData = {
    title: string;
    shortDescription: string;
    longDescription: string;
    category: string;
    difficulty: string;
    thumbnailFile: File | null;
    stylePreset: string;
    makerIconFile: File | null;
}

const categoryOptions = [
    { value: "hiking", label: "Wędrówki" },
    { value: "cycling", label: "Rowerowe" },
    { value: "running", label: "Biegowe" },
    { value: "walking", label: "Spacerowe" },
    { value: "other", label: "Inne" },
];

const stylePresetOptions = [
    { value: "modern", label: "Nowoczesny" },
    { value: "classic", label: "Klasyczny" },
    { value: "minimal", label: "Minimalistyczny" },
    { value: "colorful", label: "Kolorowy" },
];

const difficultyOptions = [
    { value: "easy", label: "Łatwy" },
    { value: "medium", label: "Średni" },
    { value: "hard", label: "Trudny" },
    { value: "expert", label: "Ekspert" },
];

// Schemat walidacji Yup
const routeFormSchema = yup.object({
    title: yup
        .string()
        .required("Tytuł jest wymagany")
        .min(3, "Tytuł musi mieć co najmniej 3 znaki")
        .max(100, "Tytuł może mieć maksymalnie 100 znaków"),
    shortDescription: yup
        .string()
        .required("Krótki opis jest wymagany")
        .min(10, "Krótki opis musi mieć co najmniej 10 znaków")
        .max(200, "Krótki opis może mieć maksymalnie 200 znaków"),
    longDescription: yup
        .string()
        .required("Długi opis jest wymagany")
        .min(20, "Długi opis musi mieć co najmniej 20 znaków")
        .max(2000, "Długi opis może mieć maksymalnie 2000 znaków"),
    category: yup
        .string()
        .required("Kategoria jest wymagana")
        .oneOf(
            categoryOptions.map(opt => opt.value),
            "Wybierz poprawną kategorię"
        ),
    difficulty: yup
        .string()
        .required("Poziom trudności jest wymagany")
        .oneOf(
            difficultyOptions.map(opt => opt.value),
            "Wybierz poprawny poziom trudności"
        ),
    thumbnailFile: yup
        .mixed<File>()
        .nullable()
        .required("Miniatura jest wymagana")
        .test("fileType", "Plik musi być obrazem", (value) => {
            if (!value) return false;
            return value instanceof File && value.type.startsWith("image/");
        })
        .test("fileSize", "Plik nie może być większy niż 5MB", (value) => {
            if (!value) return false;
            return value instanceof File && value.size <= 5 * 1024 * 1024;
        }),
    stylePreset: yup
        .string()
        .required("Preset stylu jest wymagany")
        .oneOf(
            stylePresetOptions.map(opt => opt.value),
            "Wybierz poprawny preset stylu"
        ),
    makerIconFile: yup
        .mixed<File>()
        .nullable()
        .required("Ikona na mapie jest wymagana")
        .test("fileType", "Plik musi być obrazem", (value) => {
            if (!value) return false;
            return value instanceof File && value.type.startsWith("image/");
        })
        .test("fileSize", "Plik nie może być większy niż 5MB", (value) => {
            if (!value) return false;
            return value instanceof File && value.size <= 5 * 1024 * 1024;
        }),
}) as yup.ObjectSchema<RouteFormData>;

type GeneralRouteFormProps = {
    onFormReady?: (form: ReturnType<typeof useForm<RouteFormData>>) => void;
    onValidationChange?: (isValid: boolean) => void;
    initialValues?: Partial<RouteFormData>;
    existingThumbnailUrl?: string | null;
    existingMarkerIconUrl?: string | null;
}

const GeneralRouteForm = ({onFormReady, onValidationChange, initialValues, existingThumbnailUrl, existingMarkerIconUrl}: GeneralRouteFormProps) => {
    // Dynamiczny schemat walidacji - pliki są opcjonalne jeśli istnieją URL-e
    const dynamicSchema = yup.object({
        title: yup
            .string()
            .required("Tytuł jest wymagany")
            .min(3, "Tytuł musi mieć co najmniej 3 znaki")
            .max(100, "Tytuł może mieć maksymalnie 100 znaków"),
        shortDescription: yup
            .string()
            .required("Krótki opis jest wymagany")
            .min(10, "Krótki opis musi mieć co najmniej 10 znaków")
            .max(200, "Krótki opis może mieć maksymalnie 200 znaków"),
        longDescription: yup
            .string()
            .required("Długi opis jest wymagany")
            .min(20, "Długi opis musi mieć co najmniej 20 znaków")
            .max(2000, "Długi opis może mieć maksymalnie 2000 znaków"),
        category: yup
            .string()
            .required("Kategoria jest wymagana")
            .oneOf(
                categoryOptions.map(opt => opt.value),
                "Wybierz poprawną kategorię"
            ),
        difficulty: yup
            .string()
            .required("Poziom trudności jest wymagany")
            .oneOf(
                difficultyOptions.map(opt => opt.value),
                "Wybierz poprawny poziom trudności"
            ),
        thumbnailFile: yup
            .mixed<File>()
            .nullable()
            .test("fileOrUrl", "Miniatura jest wymagana", (value) => {
                // Jeśli istnieje URL, plik nie jest wymagany
                if (existingThumbnailUrl) return true;
                // Jeśli nie ma URL, plik jest wymagany
                if (!value) return false;
                return value instanceof File && value.type.startsWith("image/");
            })
            .test("fileType", "Plik musi być obrazem", (value) => {
                if (!value || existingThumbnailUrl) return true;
                return value instanceof File && value.type.startsWith("image/");
            })
            .test("fileSize", "Plik nie może być większy niż 5MB", (value) => {
                if (!value || existingThumbnailUrl) return true;
                return value instanceof File && value.size <= 5 * 1024 * 1024;
            }),
        stylePreset: yup
            .string()
            .required("Preset stylu jest wymagany")
            .oneOf(
                stylePresetOptions.map(opt => opt.value),
                "Wybierz poprawny preset stylu"
            ),
        makerIconFile: yup
            .mixed<File>()
            .nullable()
            .test("fileOrUrl", "Ikona na mapie jest wymagana", (value) => {
                // Jeśli istnieje URL, plik nie jest wymagany
                if (existingMarkerIconUrl) return true;
                // Jeśli nie ma URL, plik jest wymagany
                if (!value) return false;
                return value instanceof File && value.type.startsWith("image/");
            })
            .test("fileType", "Plik musi być obrazem", (value) => {
                if (!value || existingMarkerIconUrl) return true;
                return value instanceof File && value.type.startsWith("image/");
            })
            .test("fileSize", "Plik nie może być większy niż 5MB", (value) => {
                if (!value || existingMarkerIconUrl) return true;
                return value instanceof File && value.size <= 5 * 1024 * 1024;
            }),
    }) as yup.ObjectSchema<RouteFormData>;

    const form = useForm<RouteFormData>({
        resolver: yupResolver(dynamicSchema),
        mode: "onChange", // Walidacja przy każdej zmianie
        defaultValues: {
            title: initialValues?.title || "",
            shortDescription: initialValues?.shortDescription || "",
            longDescription: initialValues?.longDescription || "",
            category: initialValues?.category || "",
            difficulty: initialValues?.difficulty || "",
            thumbnailFile: initialValues?.thumbnailFile || null,
            stylePreset: initialValues?.stylePreset || "",
            makerIconFile: initialValues?.makerIconFile || null,
        }
    });

    const { formState } = form;

    // Przekaż formularz do komponentu rodzica
    useEffect(() => {
        if (onFormReady) {
            onFormReady(form);
        }
    }, [form, onFormReady]);

    // Aktualizuj wartości formularza gdy initialValues się zmienią
    useEffect(() => {
        if (initialValues) {
            form.reset({
                title: initialValues.title || "",
                shortDescription: initialValues.shortDescription || "",
                longDescription: initialValues.longDescription || "",
                category: initialValues.category || "",
                difficulty: initialValues.difficulty || "",
                thumbnailFile: initialValues.thumbnailFile || null,
                stylePreset: initialValues.stylePreset || "",
                makerIconFile: initialValues.makerIconFile || null,
            }, { keepDefaultValues: false });
            // Wywołaj walidację po ustawieniu wartości
            setTimeout(() => {
                form.trigger();
            }, 100);
        }
    }, [initialValues, form]);

    // Informuj o zmianie stanu walidacji
    useEffect(() => {
        if (onValidationChange) {
            onValidationChange(formState.isValid);
        }
    }, [formState.isValid, onValidationChange]);

    return (
        <Form {...form}>
            <div className="space-y-4">
                <CustomUsualInput 
                    name="title" 
                    label="Tytuł" 
                    placeholder="Podaj tytuł trasy"
                />
                
                <CustomUsualInput 
                    name="shortDescription" 
                    label="Krótki opis" 
                    placeholder="Podaj krótki opis trasy"
                />
                
                <FormField
                    name="longDescription"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Długi opis</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="Podaj szczegółowy opis trasy"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Szczegółowy opis trasy</FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                
                <CustomSelectInput 
                    name="category" 
                    label="Kategoria" 
                    placeholder="Wybierz kategorię"
                    options={categoryOptions}
                />
                
                <CustomSelectInput 
                    name="difficulty" 
                    label="Poziom trudności" 
                    placeholder="Wybierz poziom trudności"
                    options={difficultyOptions}
                />
                
                <CustomFileInput 
                    name="thumbnailFile" 
                    label="Miniatura" 
                    description="Przeciągnij i upuść plik obrazu lub kliknij, aby wybrać"
                    accept="image/*"
                    existingUrl={existingThumbnailUrl}
                />
                
                <CustomSelectInput 
                    name="stylePreset" 
                    label="Preset stylu" 
                    placeholder="Wybierz preset stylu"
                    options={stylePresetOptions}
                />
                
                <CustomFileInput 
                    name="makerIconFile" 
                    label="Ikona na mapie" 
                    description="Przeciągnij i upuść plik obrazu lub kliknij, aby wybrać"
                    accept="image/*"
                    existingUrl={existingMarkerIconUrl}
                />
            </div>
        </Form>
    )
}

export default GeneralRouteForm;