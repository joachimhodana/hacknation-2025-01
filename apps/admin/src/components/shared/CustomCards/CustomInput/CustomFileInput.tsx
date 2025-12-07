import {FormField, FormLabel, FormItem, FormControl, FormDescription, FormMessage} from "@/components/ui/form.tsx";
import {useState, useRef} from "react";
import { Icon } from "@iconify/react";
import {cn} from "@/lib/utils";
import {getBackendImageUrl} from "@/lib/image-utils.ts";

type CustomFileInputProps = {
    name: string,
    label: string,
    description?: string,
    accept?: string,
    existingUrl?: string | null,
}

const CustomFileInput = ({name, label, description="", accept="image/*", existingUrl}:CustomFileInputProps) => {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Get full URL for existing image from backend
    const existingImageUrl = existingUrl ? getBackendImageUrl(existingUrl) : null;

    return (
        <FormField
            name={name}
            render={({field}) => {
                const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const result = reader.result as string;
                            setPreview(result);
                            field.onChange(file);
                        };
                        reader.readAsDataURL(file);
                    }
                };

                const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const result = reader.result as string;
                            setPreview(result);
                            field.onChange(file);
                        };
                        reader.readAsDataURL(file);
                    }
                };

                const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                };

                const handleRemove = () => {
                    setPreview(null);
                    field.onChange(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                };

                return (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            <div>
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    className={cn(
                                        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                                        preview
                                            ? "border-primary bg-primary/5"
                                            : "border-input hover:border-primary hover:bg-primary/5"
                                    )}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept={accept}
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    {preview ? (
                                        <div className="relative">
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="max-w-full h-32 object-contain mx-auto rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemove();
                                                }}
                                                className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                                            >
                                                <Icon icon="solar:close-circle-bold-duotone" className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : existingImageUrl ? (
                                        <div className="relative">
                                            <img 
                                                src={existingImageUrl} 
                                                alt="Existing" 
                                                className="max-w-full h-32 object-contain mx-auto rounded-md"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <Icon icon="solar:upload-bold-duotone" className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                Kliknij lub przeciągnij plik tutaj
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </FormControl>
                        <FormDescription>{description}</FormDescription>
                        <FormMessage/>
                    </FormItem>
                );
            }}
        />
    )
}

export default CustomFileInput
