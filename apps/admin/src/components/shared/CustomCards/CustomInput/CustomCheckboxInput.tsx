import {FormField, FormLabel, FormItem, FormControl, FormDescription, FormMessage} from "@/components/ui/form.tsx";
import {cn} from "@/lib/utils";

type CustomCheckboxInputProps = {
    name: string,
    label: string,
    description?: string,
}

const CustomCheckboxInput = ({name, label, description=""}:CustomCheckboxInputProps) => {
    return (
        <FormField
            name={name}
            render={({field}) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                        <input
                            type="checkbox"
                            className={cn(
                                "h-4 w-4 rounded border-input text-primary focus:ring-ring focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            )}
                            checked={field.value}
                            onChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>{label}</FormLabel>
                        {description && <FormDescription>{description}</FormDescription>}
                    </div>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}

export default CustomCheckboxInput
