"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { exportPayments } from "./actions";

interface ExportButtonProps {
    year: number;
}

export default function ExportButton({ year }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await exportPayments(year);
            if (result.success && result.csvContent) {
                const blob = new Blob([result.csvContent], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `payments_statement_${year}.csv`);
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert(result.error || "Failed to export statement");
            }
        } catch (error) {
            console.error("Export error:", error);
            alert("An error occurred during export");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 sm:flex-none h-10 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
            {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Download className="w-4 h-4" />
            )}
            Export Statement
        </button>
    );
}
