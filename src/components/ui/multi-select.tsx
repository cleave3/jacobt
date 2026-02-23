"use client";

import * as React from "react";
import { X, Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export interface Option {
    label: string;
    value: string;
}

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select options...",
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    const handleUnselect = (value: string) => {
        onChange(selected.filter((s) => s !== value));
    };

    const handleSelect = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter((s) => s !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const selectedLabels = options
        .filter((option) => selected.includes(option.value))
        .map((option) => option.label);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-auto min-h-11 py-2 px-3 border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-all",
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1.5 overflow-hidden">
                        {selected.length > 0 ? (
                            options
                                .filter((option) => selected.includes(option.value))
                                .map((option) => (
                                    <Badge
                                        variant="secondary"
                                        key={option.value}
                                        className="bg-finance-gold/10 text-finance-gold border-finance-gold/20 hover:bg-finance-gold/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"
                                        onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            handleUnselect(option.value);
                                        }}
                                    >
                                        {option.label}
                                        <X className="h-3 w-3" />
                                    </Badge>
                                ))
                        ) : (
                            <span className="text-slate-400 font-medium text-[14px]">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl z-[100]" align="start">
                <Command className="dark:bg-slate-900">
                    <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <CommandInput
                            placeholder="Search members..."
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0"
                            onValueChange={setSearchQuery}
                        />
                    </div>
                    <CommandList className="max-h-[200px] overflow-y-auto custom-scrollbar">
                        <CommandEmpty className="py-6 text-center text-sm text-slate-500">No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => handleSelect(option.value)}
                                    className="flex items-center justify-between py-2.5 px-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <span className={cn(
                                        "text-sm font-medium",
                                        selected.includes(option.value) ? "text-finance-gold" : "text-slate-700 dark:text-slate-300"
                                    )}>
                                        {option.label}
                                    </span>
                                    {selected.includes(option.value) && (
                                        <Check className="h-4 w-4 text-finance-gold" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
