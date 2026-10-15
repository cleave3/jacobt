import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { AppShell } from "@/components/layout/AppShell"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, CreditCard, RotateCcw, Image as ImageIcon, ChevronRight, Check, X } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/context/AuthContext"
import PaymentRowActions from "./payments/PaymentRowActions"
import { SubmitPaymentTrigger } from "@/components/ui/SubmitPaymentTrigger"
import { Pagination } from "@/components/ui/Pagination"
import { buildPageData } from "@/lib/pagination"
import ExportButton from "./payments/ExportButton"
import PaymentFilters from "./payments/PaymentFilters"
import { PaymentDetailDialog } from "@/components/ui/PaymentDetailDialog"
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog"
import { axios } from "@/lib/axios"
import { AccessControl } from "@/components/auth/AccessControl"
import { toast } from "sonner"

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

    const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null)
    const [mobilePendingAction, setMobilePendingAction] = useState<{
        payment: PaymentItem
        status: "CONFIRMED" | "REJECTED"
    } | null>(null)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const { user } = useAuth()
    const queryClient = useQueryClient()

    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN"

    const handleMobileActionConfirm = async () => {
        if (!mobilePendingAction) return
        setIsActionLoading(true)
        try {
            await axios.patch(`/payments/${mobilePendingAction.payment.id}`, { status: mobilePendingAction.status })
            queryClient.invalidateQueries({ queryKey: ['payments'] })
            toast.success(
                mobilePendingAction.status === "CONFIRMED"
                    ? "Payment confirmed successfully"
                    : "Payment marked as rejected"
            )
            setMobilePendingAction(null)
        } catch (error: unknown) {
            const errObj = error as { response?: { data?: { message?: string } }; message?: string }
            toast.error(errObj.response?.data?.message || errObj.message || "Failed to update payment status")
        } finally {
            setIsActionLoading(false)
        }
    }

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

                            {/* Mobile Card View (Fintech Native Transaction Feed) */}
                            <motion.div 
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.04 }
                                    }
                                }}
                                initial="hidden"
                                animate="visible"
                                className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60"
                            >
                                {payments.map((payment) => {
                                    const paymentDateFormatted = new Date(payment.paymentDate || payment.createdAt).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric"
                                    })

                                    return (
                                        <motion.div
                                            key={payment.id}
                                            variants={{
                                                hidden: { opacity: 0, y: 10 },
                                                visible: { opacity: 1, y: 0 }
                                            }}
                                            whileTap={{ scale: 0.985 }}
                                            onClick={() => setSelectedPayment(payment)}
                                            className="p-3.5 sm:p-4 flex flex-col hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer active:bg-slate-100/70 dark:active:bg-slate-800/70 select-none"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                {/* Left: Status Icon & Details */}
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="shrink-0">
                                                        {payment.status === "CONFIRMED" && (
                                                            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-sm">
                                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                            </div>
                                                        )}
                                                        {payment.status === "PENDING" && (
                                                            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-sm">
                                                                <Clock className="w-5 h-5 text-amber-500" />
                                                            </div>
                                                        )}
                                                        {payment.status === "REJECTED" && (
                                                            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shadow-sm">
                                                                <XCircle className="w-5 h-5 text-rose-500" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                                                {payment.user?.name || "Unknown Member"}
                                                            </h3>
                                                            {payment.proofImage && (
                                                                <span title="Payment proof attached" className="text-finance-gold shrink-0">
                                                                    <ImageIcon className="w-3.5 h-3.5" />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                                {payment.paymentCircle} Cycle
                                                            </span>
                                                            <span>•</span>
                                                            <span className="truncate">{paymentDateFormatted}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Amount & Status / Chevron */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="text-right">
                                                        <p className="font-extrabold text-slate-900 dark:text-white font-mono text-[14px]">
                                                            ₦ {Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </p>
                                                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider ${
                                                            payment.status === "CONFIRMED"
                                                                ? "text-emerald-600 dark:text-emerald-400"
                                                                : payment.status === "PENDING"
                                                                ? "text-amber-600 dark:text-amber-400"
                                                                : "text-rose-600 dark:text-rose-400"
                                                        }`}>
                                                            {payment.status}
                                                        </span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                                                </div>
                                            </div>

                                            {/* Quick Mobile Admin Actions on Pending Payments */}
                                            {payment.status === "PENDING" && (user?.role === "SUPERADMIN" || (isAdmin && ![payment.user?.id, payment.submittedBy?.id].includes(user?.id))) && (
                                                <div 
                                                    className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Pending Approval
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={isActionLoading}
                                                            onClick={() => setMobilePendingAction({ payment, status: "REJECTED" })}
                                                            className="h-8 px-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                            <span>Reject</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={isActionLoading}
                                                            onClick={() => setMobilePendingAction({ payment, status: "CONFIRMED" })}
                                                            className="h-8 px-3.5 rounded-xl bg-[#2cd48b] hover:bg-[#20ba77] text-white text-xs font-bold flex items-center gap-1 shadow-sm shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            <span>Confirm</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )
                                })}
                            </motion.div>
                        </>
                    )}
                </div>

                {/* Pagination */}
                <Pagination pageData={pageData} baseUrl="/payments" />
            </div>

            {/* Mobile / Desktop Tap-to-Inspect Receipt Dialog */}
            <PaymentDetailDialog
                isOpen={Boolean(selectedPayment)}
                onClose={() => setSelectedPayment(null)}
                payment={selectedPayment}
                user={user}
            />

            {/* Mobile Actions Confirmation Dialog */}
            <ConfirmActionDialog
                isOpen={mobilePendingAction !== null}
                onClose={() => !isActionLoading && setMobilePendingAction(null)}
                onConfirm={handleMobileActionConfirm}
                title={mobilePendingAction?.status === "CONFIRMED" ? "Approve Contribution?" : "Reject Contribution?"}
                description={
                    mobilePendingAction?.status === "CONFIRMED"
                        ? "Are you sure you want to approve this contribution? The record will be permanently marked as confirmed."
                        : "Are you sure you want to reject this contribution? The record will be marked as rejected."
                }
                confirmLabel={mobilePendingAction?.status === "CONFIRMED" ? "Yes, Approve" : "Yes, Reject"}
                variant={mobilePendingAction?.status === "CONFIRMED" ? "confirm" : "destructive"}
                isLoading={isActionLoading}
                paymentDetails={
                    mobilePendingAction
                        ? {
                              amount: mobilePendingAction.payment.amount,
                              memberName: mobilePendingAction.payment.user?.name,
                              cycle: mobilePendingAction.payment.paymentCircle,
                          }
                        : undefined
                }
            />
        </AppShell>
    )
}
