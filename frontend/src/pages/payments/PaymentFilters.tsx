import { useState, useEffect, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Search, Calendar, User, Filter, RotateCcw, X, ChevronDown, Check } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { axios } from "@/lib/axios"
import { normalizeUsersList } from "@/lib/utils"

interface MemberUser {
    id: string
    name: string
    phone?: string
}

interface PaymentFiltersProps {
    availableYears: number[]
}

export default function PaymentFilters({ availableYears }: PaymentFiltersProps) {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // Query state from searchParams
    const currentYear = searchParams.get("year") || "ALL"
    const currentUserId = searchParams.get("userId") || "ALL"
    const currentStatus = searchParams.get("status") || "ALL"
    const currentStartDate = searchParams.get("startDate") || ""
    const currentEndDate = searchParams.get("endDate") || ""
    const currentSearch = searchParams.get("search") || ""

    // Mobile filter accordion expand state
    const [isMobileExpanded, setIsMobileExpanded] = useState(false)

    // Local search input for smooth typing
    const [searchInput, setSearchInput] = useState(currentSearch)

    const updateFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (!value || value === "ALL") {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        params.set("page", "1") // Reset to page 1 on filter change
        navigate(`?${params.toString()}`)
    }, [navigate, searchParams])

    // Debounce search update
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchInput !== currentSearch) {
                updateFilter("search", searchInput)
            }
        }, 400)
        return () => clearTimeout(handler)
    }, [searchInput, currentSearch, updateFilter])

    // Sync local search when URL changes externally
    useEffect(() => {
        setSearchInput(currentSearch)
    }, [currentSearch])

    // Fetch members for filter dropdown
    const { data: rawUsers } = useQuery<unknown>({
        queryKey: ["users"],
        queryFn: async () => {
            const res = await axios.get("/users")
            return normalizeUsersList<MemberUser>(res)
        },
    })

    const usersData = normalizeUsersList<MemberUser>(rawUsers)
    const selectedMember = usersData.find((u) => u.id === currentUserId)

    const clearAllFilters = () => {
        setSearchInput("")
        navigate("?page=1")
    }

    const activeSecondaryFilterCount = [
        currentYear !== "ALL" && currentYear !== "",
        currentUserId !== "ALL" && currentUserId !== "",
        currentStatus !== "ALL" && currentStatus !== "",
        currentStartDate !== "",
        currentEndDate !== "",
    ].filter(Boolean).length

    const hasAnyActiveFilter = activeSecondaryFilterCount > 0 || Boolean(currentSearch)

    return (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm transition-all space-y-3">
            {/* Top Row: Search Input + Mobile Filter Toggle Button */}
            <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search member name or phone..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-9 pr-8 h-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-finance-gold focus:ring-2 focus:ring-finance-gold/20 transition-all"
                    />
                    {searchInput && (
                        <button
                            type="button"
                            onClick={() => setSearchInput("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Mobile Filter Toggle Button */}
                <button
                    type="button"
                    onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                    aria-expanded={isMobileExpanded}
                    className={`lg:hidden flex items-center gap-1.5 h-10 px-3 rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 ${
                        activeSecondaryFilterCount > 0 || isMobileExpanded
                            ? "bg-finance-gold/15 border-finance-gold/40 text-finance-gold dark:text-finance-goldLight"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filters</span>
                    {activeSecondaryFilterCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-finance-gold text-white text-[10px] font-extrabold flex items-center justify-center">
                            {activeSecondaryFilterCount}
                        </span>
                    )}
                    <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isMobileExpanded ? "rotate-180" : ""
                        }`}
                    />
                </button>
            </div>

            {/* Mobile Quick Filter Horizontal Pill Strip */}
            <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
                {[
                    { label: "All", key: "status", value: "ALL", isActive: currentStatus === "ALL" || !currentStatus },
                    { label: "Pending", key: "status", value: "PENDING", isActive: currentStatus === "PENDING" },
                    { label: "Confirmed", key: "status", value: "CONFIRMED", isActive: currentStatus === "CONFIRMED" },
                    { label: "Rejected", key: "status", value: "REJECTED", isActive: currentStatus === "REJECTED" },
                ].map((chip) => (
                    <button
                        key={chip.label}
                        type="button"
                        onClick={() => updateFilter(chip.key, chip.value)}
                        className={`h-7 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 border ${
                            chip.isActive
                                ? "bg-finance-gold text-white border-finance-gold shadow-sm font-bold"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                    >
                        {chip.label}
                    </button>
                ))}

                <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

                {availableYears.map((yr) => {
                    const isYearActive = currentYear === yr.toString()
                    return (
                        <button
                            key={yr}
                            type="button"
                            onClick={() => updateFilter("year", isYearActive ? "ALL" : yr.toString())}
                            className={`h-7 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 border ${
                                isYearActive
                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-sm font-bold"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                            }`}
                        >
                            {yr} Cycle
                        </button>
                    )
                })}
            </div>

            {/* Active Filter Chips */}
            {hasAnyActiveFilter && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                        Active:
                    </span>
                    {currentSearch && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <span>Search: "{currentSearch}"</span>
                            <button
                                type="button"
                                onClick={() => setSearchInput("")}
                                className="text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {currentUserId !== "ALL" && currentUserId !== "" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-finance-gold/15 text-slate-900 dark:text-slate-100 border border-finance-gold/40">
                            <span>Member: {selectedMember?.name || "Selected"}</span>
                            <button
                                type="button"
                                onClick={() => updateFilter("userId", "ALL")}
                                className="text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {currentYear !== "ALL" && currentYear !== "" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <span>Cycle: {currentYear}</span>
                            <button
                                type="button"
                                onClick={() => updateFilter("year", "ALL")}
                                className="text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {currentStatus !== "ALL" && currentStatus !== "" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <span>Status: {currentStatus}</span>
                            <button
                                type="button"
                                onClick={() => updateFilter("status", "ALL")}
                                className="text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {(currentStartDate || currentEndDate) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <span>
                                {currentStartDate ? `From: ${currentStartDate}` : ""}
                                {currentStartDate && currentEndDate ? " · " : ""}
                                {currentEndDate ? `To: ${currentEndDate}` : ""}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    updateFilter("startDate", "")
                                    updateFilter("endDate", "")
                                }}
                                className="text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={clearAllFilters}
                        className="inline-flex items-center gap-1 text-xs font-bold text-finance-gold hover:underline ml-1 cursor-pointer"
                    >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset all</span>
                    </button>
                </div>
            )}

            {/* Filter Controls:
                - Desktop (lg:): always visible
                - Mobile (<lg:): collapsible accordion with compact 2-column layout
            */}
            <div className={`${isMobileExpanded ? "block" : "hidden"} lg:block space-y-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800/60`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-2.5 items-center">
                    {/* Member Filter */}
                    <div className="lg:col-span-3 relative">
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            value={currentUserId}
                            onChange={(e) => updateFilter("userId", e.target.value)}
                            aria-label="Filter by member"
                            className="w-full pl-9 pr-8 h-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-finance-gold focus:ring-2 focus:ring-finance-gold/20 cursor-pointer appearance-none truncate transition-all"
                        >
                            <option value="ALL">All Members</option>
                            {usersData.map((u) => (
                                <option key={u.id} value={u.id} className="dark:bg-slate-800">
                                    {u.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    {/* Cycle & Status: Side-by-side on mobile (grid-cols-2) */}
                    <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-5">
                        {/* Payment Cycle (Year) */}
                        <div className="relative">
                            <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <select
                                value={currentYear}
                                onChange={(e) => updateFilter("year", e.target.value)}
                                aria-label="Filter by cycle year"
                                className="w-full pl-9 pr-8 h-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-finance-gold focus:ring-2 focus:ring-finance-gold/20 cursor-pointer appearance-none transition-all truncate"
                            >
                                <option value="ALL">All Cycles</option>
                                {availableYears.map((availYear) => (
                                    <option key={availYear} value={availYear} className="dark:bg-slate-800">
                                        {availYear} Cycle
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <select
                                value={currentStatus}
                                onChange={(e) => updateFilter("status", e.target.value)}
                                aria-label="Filter by status"
                                className="w-full pl-9 pr-8 h-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-finance-gold focus:ring-2 focus:ring-finance-gold/20 cursor-pointer appearance-none transition-all truncate"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="CONFIRMED" className="dark:bg-slate-800">Confirmed</option>
                                <option value="PENDING" className="dark:bg-slate-800">Pending</option>
                                <option value="REJECTED" className="dark:bg-slate-800">Rejected</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date Range Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
                            Date Range:
                        </span>
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                            <input
                                type="date"
                                value={currentStartDate}
                                onChange={(e) => updateFilter("startDate", e.target.value)}
                                aria-label="Start Date"
                                className="w-full sm:w-auto h-9 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-finance-gold focus:ring-1 focus:ring-finance-gold/20 cursor-pointer"
                            />
                            <input
                                type="date"
                                value={currentEndDate}
                                onChange={(e) => updateFilter("endDate", e.target.value)}
                                aria-label="End Date"
                                className="w-full sm:w-auto h-9 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-finance-gold focus:ring-1 focus:ring-finance-gold/20 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    <div className="flex lg:hidden items-center justify-end w-full pt-1">
                        <button
                            type="button"
                            onClick={() => setIsMobileExpanded(false)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                            <Check className="w-3.5 h-3.5" />
                            <span>Done Filtering</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
