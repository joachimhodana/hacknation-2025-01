import {FormField, FormLabel, FormItem, FormControl, FormDescription, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";

type CustomImageInputProps = {
    name: string,
    label: string,
    placeholder?: string,
    description?: string,
}

const CustomImageInput = ({name, label, placeholder="", description=""}:CustomImageInputProps) => {
    return (
        <FormField
            name={name}
            render={({field}) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input 
                            type="url" 
                            placeholder={placeholder || ""} 
                            {...field}
                        />
                    </FormControl>
                    {field.value && (
                        <div className="mt-2">
                            <img 
                                src={field.value} 
                                alt="Preview" 
                                className="max-w-full h-32 object-contain border rounded-md"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                }}
                            />
                        </div>
                    )}
                    <FormDescription>{description}</FormDescription>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}

export default CustomImageInput
