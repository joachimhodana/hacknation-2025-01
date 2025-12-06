import {FormField, FormLabel, FormItem, FormControl, FormDescription, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";

type CustomInputProps = {
    name: string,
    label: string,
    placeholder?: string,
    description?: string,
}

const CustomUsualInput = ({name, label, placeholder="", description=""}:CustomInputProps) => {
    return (
        <FormField
            name={name}
            render={({field}) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input placeholder={placeholder || ""} {...field}/>
                    </FormControl>
                    <FormDescription>{description}</FormDescription>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}

export default CustomUsualInput