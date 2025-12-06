import {FormField, FormLabel, FormItem, FormControl, FormDescription, FormMessage} from "@/components/ui/form.tsx";
import {useState, useRef, useEffect} from "react";
import { Icon } from "@iconify/react";
import {cn} from "@/lib/utils";

type CustomSearchableSelectProps = {
    name: string,
    label: string,
    placeholder?: string,
    description?: string,
    options: { value: string; label: string }[]
}

const CustomSearchableSelect = ({name, label, placeholder="", description="", options}:CustomSearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedValue, setSelectedValue] = useState<string>("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === selectedValue);

    return (
        <FormField
            name={name}
            render={({field}) => {
                const handleSelect = (value: string) => {
                    setSelectedValue(value);
                    field.onChange(value);
                    setIsOpen(false);
                    setSearchTerm("");
                };

                return (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(!isOpen)}
                                    className={cn(
                                        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                        !selectedValue && "text-muted-foreground"
                                    )}
                                >
                                    <span>{selectedOption?.label || placeholder}</span>
                                    <div className="flex items-center gap-1">
                                        {selectedValue && (
                                            <Icon
                                                icon="solar:close-circle-bold-duotone"
                                                className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelect("");
                                                }}
                                            />
                                        )}
                                        <Icon icon="solar:alt-arrow-down-bold-duotone" className="h-4 w-4 opacity-50" />
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                                        <div className="p-2">
                                            <input
                                                type="text"
                                                placeholder="Szukaj..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full h-8 px-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-auto">
                                            {filteredOptions.length === 0 ? (
                                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                                    Brak wyników
                                                </div>
                                            ) : (
                                                filteredOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => handleSelect(option.value)}
                                                        className={cn(
                                                            "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                                                            selectedValue === option.value && "bg-accent"
                                                        )}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
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

export default CustomSearchableSelect
