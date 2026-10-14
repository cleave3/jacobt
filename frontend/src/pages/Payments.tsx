import { useNavigate, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { AppShell } from "@/components/layout/AppShell"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, CreditCard, RotateCcw, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import PaymentRowActions from "./payments/PaymentRowActions"
import { SubmitPaymentTrigger } from "@/components/ui/SubmitPaymentTrigger"
import { Pagination } from "@/components/ui/Pagination"
import { buildPageData } from "@/lib/pagination"
import ExportButton from "./payments/ExportButton"
import PaymentFilters from "./payments/PaymentFilters"
import { axios } from "@/lib/axios"
import { AccessControl } from "@/components/auth/AccessControl"

export interface PaymentItem {
    id: string
    userId: string
    amount: number | string
    paymentCircle: number
    status: "PENDING" | "CONFIRMED" | "REJECTED"
    paymentDate?: string | Date
    createdAt: string | Date
    updatedAt: string | Date
    proofImage?: string
    user?: {
        id: string
        name: string
        phone?: string
    }
    submittedBy?: {
        id: string
        name: string
    }
    updatedBy?: {
        id: string
        name: string
    }
}

interface PaymentsApiResponse {
    success: boolean
    data: PaymentItem[]
    availableYears: number[]
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export default function Payments() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)
    const year = searchParams.get("year") || ""
    const userId = searchParams.get("userId") || ""
    const status = searchParams.get("status") || ""
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""
    const search = searchParams.get("search") || ""

    const { user } = useAuth()

    const { data: response, isLoading, error } = useQuery<PaymentsApiResponse>({
        queryKey: ['payments', page, limit, year, userId, status, startDate, endDate, search],
        queryFn: async (): Promise<PaymentsApiResponse> => {
            const params = new URLSearchParams()
            params.set("page", page.toString())
            params.set("limit", limit.toString())
            if (year && year !== "ALL") params.set("year", year)
            if (userId && userId !== "ALL") params.set("userId", userId)
            if (status && status !== "ALL") params.set("status", status)
            if (startDate) params.set("startDate", startDate)
            if (endDate) params.set("endDate", endDate)
            if (search) params.set("search", search)

            const res = await axios.get(`/payments?${params.toString()}`)
            return res as unknown as PaymentsApiResponse
        }
    })

    const isFiltered = Boolean(year || userId || status || startDate || endDate || search)

    if (isLoading) {
        return (
            <AppShell>
                <div className="flex flex-col gap-6 w-full">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-36" />
                        </div>
                    </header>
                    <Skeleton className="h-28 w-full rounded-2xl" />
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center py-2.5">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 rounded-full" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-16 rounded-md" />
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </AppShell>
        )
    }

    if (error || !response?.success) {
        return (
            <AppShell>
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#1e293b] rounded-2xl border border-red-100 dark:border-red-900/30">
                    <p className="text-red-500 font-bold mb-2">Failed to load contributions data.</p>
                    <p className="text-sm text-slate-500 mb-4">{error?.message || "Please check your network connection and try again."}</p>
                    <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                        Retry
                    </Button>
                </div>
            </AppShell>
        )
    }

    const payments = response.data || []
    const pageData = buildPageData(response.meta, page, payments.length)
    const availableYears: number[] = response.availableYears || [new Date().getFullYear()]

    const activeFilters = {
        year,
        userId,
        status,
        startDate,
        endDate,
        search,
    }

    return (
        <AppShell>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                            Contributions
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Manage, filter, and track community contributions and payment history.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <AccessControl permittedRoles={["ADMIN", "SUPERADMIN"]}>
                            <ExportButton filters={activeFilters} />
                        </AccessControl>
                        <SubmitPaymentTrigger />
                    </div>
                </header>

                {/* Filter Toolbar */}
                <PaymentFilters availableYears={availableYears} />

                {/* Main Table / Cards Container */}
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    {payments.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mb-3">
                                <CreditCard className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                No contributions found
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                                {isFiltered
                                    ? "No payments match your current filter settings. Try adjusting your search query, cycle, or date range."
                                    : "No payments have been recorded yet."}
                            </p>
                            {isFiltered && (
                                <button
                                    onClick={() => navigate("?page=1")}
                                    className="mt-4 px-4 h-9 inline-flex items-center gap-1.5 text-xs font-bold text-finance-gold bg-finance-gold/10 hover:bg-finance-gold/20 rounded-xl transition-all cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-[#f8fafc] dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4">Member</th>
                                            <th className="px-6 py-4">Payment Date</th>
                                            <th className="px-6 py-4">Logged Date</th>
                                            <th className="px-6 py-4">Cycle</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Proof</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        {payments.map((payment) => {
                                            const paymentDateFormatted = new Date(payment.paymentDate || payment.createdAt).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })
                                            const loggedDateObj = new Date(payment.createdAt)
                                            const loggedDateFormatted = loggedDateObj.toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })
                                            const loggedTimeFormatted = loggedDateObj.toLocaleTimeString(undefined, {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })

                                            return (
                                                <tr
                                                    key={payment.id}
                                                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                                >
                                                    {/* Member */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-finance-gold/10 text-finance-gold flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                                                {payment.user?.name ? payment.user.name.slice(0, 2) : "??"}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-[14px]">
                                                                    {payment.user?.name || "Unknown Member"}
                                                                </p>
                                                                <p className="text-xs text-slate-400 font-medium truncate">
                                                                    {payment.user?.phone || "No phone"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Payment Date */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {paymentDateFormatted}
                                                        </span>
                                                    </td>

                                                    {/* Logged Date */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <p className="font-medium text-slate-700 dark:text-slate-300">
                                                            {loggedDateFormatted}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                                            {loggedTimeFormatted}
                                                        </p>
                                                    </td>

                                                    {/* Cycle */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                            {payment.paymentCircle}
                                                        </span>
                                                    </td>

                                                    {/* Amount */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-bold font-mono text-slate-900 dark:text-white text-[15px]">
                                                            ₦ {Number(payment.amount).toLocaleString(undefined, {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
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

                                                    {/* Proof */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {payment.proofImage ? (
                                                            <a
                                                                href={payment.proofImage}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:text-finance-gold transition-colors"
                                                            >
                                                                <ImageIcon className="w-3.5 h-3.5" />
                                                                <span>View Proof</span>
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">None</span>
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 text-right">
                                                        <PaymentRowActions payment={payment} user={user} />
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                                {payments.map((payment) => {
                                    const paymentDateFormatted = new Date(payment.paymentDate || payment.createdAt).toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })
                                    const loggedDateObj = new Date(payment.createdAt)
                                    const loggedDateFormatted = loggedDateObj.toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })

                                    return (
                                        <div
                                            key={payment.id}
                                            className="p-4 flex flex-col gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-finance-gold/10 text-finance-gold flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                                        {payment.user?.name ? payment.user.name.slice(0, 2) : "??"}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                                            {payment.user?.name || "Unknown Member"}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                                                            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                                                Paid: {paymentDateFormatted}
                                                            </span>
                                                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                                                · Logged: {loggedDateFormatted}
                                                            </span>
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400">
                                                                {payment.paymentCircle} Cycle
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-extrabold text-slate-900 dark:text-white font-mono text-[15px]">
                                                        ₦ {Number(payment.amount).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800/60">
                                                <div>
                                                    {payment.status === "CONFIRMED" && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-[#2cd48b] text-[#2cd48b] bg-[#2cd48b]/10">
                                                            <CheckCircle2 className="w-3 h-3" /> CONFIRMED
                                                        </span>
                                                    )}
                                                    {payment.status === "PENDING" && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-finance-gold text-finance-gold bg-finance-gold/10">
                                                            <Clock className="w-3 h-3" /> PENDING
                                                        </span>
                                                    )}
                                                    {payment.status === "REJECTED" && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-[#ef4444] text-[#ef4444] bg-[#ef4444]/10">
                                                            <XCircle className="w-3 h-3" /> REJECTED
                                                        </span>
                                                    )}
                                                </div>
                                                <PaymentRowActions payment={payment} user={user} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination */}
                <Pagination pageData={pageData} baseUrl="/payments" />
            </div>
        </AppShell>
    )
}
