import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { axios } from "@/lib/axios"

interface ExportButtonProps {
    filters: {
        year?: number | string
        userId?: string
        status?: string
        startDate?: string
        endDate?: string
        search?: string
    }
}

export default function ExportButton({ filters }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const queryParams = new URLSearchParams()
            if (filters.year && filters.year !== 'ALL') queryParams.set('year', filters.year.toString())
            if (filters.userId && filters.userId !== 'ALL') queryParams.set('userId', filters.userId)
            if (filters.status && filters.status !== 'ALL') queryParams.set('status', filters.status)
            if (filters.startDate) queryParams.set('startDate', filters.startDate)
            if (filters.endDate) queryParams.set('endDate', filters.endDate)
            if (filters.search) queryParams.set('search', filters.search)

            const response = await axios.get(`/payments/export?${queryParams.toString()}`, {
                responseType: 'blob',
            })

            const blob = new Blob([response as unknown as BlobPart], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            const filename = filters.year && filters.year !== 'ALL' 
                ? `payments_statement_${filters.year}.csv` 
                : `payments_statement_all.csv`
            link.setAttribute("download", filename)
            link.style.visibility = "hidden"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error("Export error:", error)
            alert("An error occurred during export")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 sm:flex-none h-10 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
        >
            {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin text-finance-gold" />
            ) : (
                <Download className="w-4 h-4 text-finance-gold" />
            )}
            Export Statement
        </button>
    )
}
