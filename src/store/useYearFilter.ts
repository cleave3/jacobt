"use client";

import { create } from "zustand";

interface YearFilterState {
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    availableYears: number[];
    setAvailableYears: (years: number[]) => void;
}

export const useYearFilterStore = create<YearFilterState>((set) => ({
    selectedYear: new Date().getFullYear(),
    setSelectedYear: (year) => set({ selectedYear: year }),
    availableYears: [new Date().getFullYear()],
    setAvailableYears: (years) => set({ availableYears: years }),
}));
