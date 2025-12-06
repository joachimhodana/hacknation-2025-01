import {FormField, FormLabel, FormItem, FormControl, FormDescription, FormMessage} from "@/components/ui/form.tsx";
import {cn} from "@/lib/utils";

type CustomSelectInputProps = {
    name: string,
    label: string,
    placeholder?: string,
    description?: string,
    options: { value: string; label: string }[]
}

const CustomSelectInput = ({name, label, placeholder="", description="", options}:CustomSelectInputProps) => {
    return (
        <FormField
            name={name}
            render={({field}) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <select
                            className={cn(
                                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            )}
                            {...field}
                        >
                            {placeholder && <option value="">{placeholder}</option>}
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </FormControl>
                    <FormDescription>{description}</FormDescription>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}

export default CustomSelectInput
