import { AppShell } from "@/components/layout/AppShell"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import PaymentRowActions from "./payments/PaymentRowActions"
import { SubmitPaymentTrigger } from "@/components/ui/SubmitPaymentTrigger"
import { Pagination } from "@/components/ui/Pagination"
import ExportButton from "./payments/ExportButton"
import YearFilter from "./payments/YearFilter"
import { useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { axios } from "@/lib/axios"
import { AccessControl } from "@/components/auth/AccessControl"

export default function Payments() {
    const [searchParams] = useSearchParams()
    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)
    const currentYear = new Date().getFullYear()
    const selectedYear = searchParams.get("year") ? parseInt(searchParams.get("year") as string) : currentYear

    const { user } = useAuth()

    const { data: response, isLoading, error } = useQuery({
        queryKey: ['payments', page, limit, selectedYear],
        queryFn: async (): Promise<any> => {
            return await axios.get(`/payments?page=${page}&limit=${limit}&year=${selectedYear}`)
        }
    })

    if (isLoading) {
        return (
            <AppShell>
                <div className="flex flex-col gap-6 w-full">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-36" />
                        </div>
                    </header>
                    <div className="flex justify-start mb-2">
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </AppShell>
        )
    }

    if (error || !response?.success) {
        return <AppShell><div className="flex justify-center p-8 text-red-500">Failed to load payments data.</div></AppShell>
    }

    const payments = response.data || []
    const pageData = response.pageData || {
        isFirstPage: true,
        isLastPage: true,
        currentPage: 1,
        previousPage: null,
        nextPage: null,
        pageCount: 1,
        totalCount: payments.length
    }

    // Fallback if availableYears data structure is different from endpoint
    const availableYearsResponse = response.availableYears || []
    const availableYears = availableYearsResponse.length > 0 ? availableYearsResponse : [currentYear]
    if (!availableYears.includes(currentYear)) availableYears.push(currentYear)
    availableYears.sort((a: number, b: number) => b - a)

    return (
        <AppShell>
            <div className="flex flex-col gap-6">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Contributions</h1>
                        <p className="text-sm text-slate-500 font-medium">Manage and track community contributions</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <AccessControl permittedRoles={["ADMIN", "SUPERADMIN"]}>
                            <ExportButton year={selectedYear} />
                        </AccessControl>
                        <SubmitPaymentTrigger />
                    </div>
                </header>

                <div className="flex justify-start mb-2">
                    <YearFilter
                        availableYears={availableYears}
                        selectedYear={selectedYear}
                    />
                </div>

                <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] dark:bg-slate-800/50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Member</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {payments.map((payment: any) => (
                                    <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                                            {payment.user?.name || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            ₦ {Number(payment.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.status === "CONFIRMED" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-[#2cd48b] text-[#2cd48b] bg-[#2cd48b]/10">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> CONFIRMED
                                                </span>
                                            )}
                                            {payment.status === "PENDING" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-finance-gold text-finance-gold bg-finance-gold/10">
                                                    <Clock className="w-3.5 h-3.5" /> PENDING
                                                </span>
                                            )}
                                            {payment.status === "REJECTED" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-[#ef4444] text-[#ef4444] bg-[#ef4444]/10">
                                                    <XCircle className="w-3.5 h-3.5" /> REJECTED
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <PaymentRowActions payment={payment} user={user} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y dark:divide-slate-500 divide-slate-800/10">
                        {payments.map((payment: any) => (
                            <div key={payment.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{payment.user?.name || "Unknown"}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900 dark:text-white">₦ {Number(payment.amount).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <div>
                                        {payment.status === "CONFIRMED" && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#2cd48b] text-[#2cd48b] bg-[#2cd48b]/10">
                                                <CheckCircle2 className="w-3 h-3" /> CONFIRMED
                                            </span>
                                        )}
                                        {payment.status === "PENDING" && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-finance-gold text-finance-gold bg-finance-gold/10">
                                                <Clock className="w-3 h-3" /> PENDING
                                            </span>
                                        )}
                                        {payment.status === "REJECTED" && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#ef4444] text-[#ef4444] bg-[#ef4444]/10">
                                                <XCircle className="w-3 h-3" /> REJECTED
                                            </span>
                                        )}
                                    </div>
                                    <PaymentRowActions payment={payment} user={user} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Pagination pageData={pageData} baseUrl="/payments" />
            </div>
        </AppShell>
    )
}
