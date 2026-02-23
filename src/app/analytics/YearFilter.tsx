"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

interface YearFilterProps {
    availableYears: number[];
    selectedYear: number;
}

export default function YearFilter({ availableYears, selectedYear }: YearFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleYearChange = (year: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("year", year);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm transition-all hover:border-finance-gold/50">
            <Calendar className="w-4 h-4 text-finance-gold" />
            <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="bg-transparent border-none outline-none focus:ring-0 cursor-pointer text-slate-900 dark:text-slate-100 font-bold"
            >
                {availableYears.map(year => (
                    <option key={year} value={year} className="dark:bg-slate-800 text-slate-900 dark:text-white">
                        {year}
                    </option>
                ))}
            </select>
        </div>
    );
}
