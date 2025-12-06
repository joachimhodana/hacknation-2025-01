import {FormField, FormLabel, FormItem, FormControl, FormDescription, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";

type CustomNumberInputProps = {
    name: string,
    label: string,
    placeholder?: string,
    description?: string,
}

const CustomNumberInput = ({name, label, placeholder="", description=""}:CustomNumberInputProps) => {
    return (
        <FormField
            name={name}
            render={({field}) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input 
                            type="number" 
                            placeholder={placeholder || ""} 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        />
                    </FormControl>
                    <FormDescription>{description}</FormDescription>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}

export default CustomNumberInput
