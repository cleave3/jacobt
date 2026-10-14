import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, CheckCircle2, Clock, XCircle, Edit, Save, Calendar, Banknote, User as UserIcon, FileText } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { axios } from "@/lib/axios"
import { AccessControl } from "@/components/auth/AccessControl"
import useWidth from "@/hooks/useWidth"
import { useQueryClient } from "@tanstack/react-query"
import type { PaymentItem } from "@/pages/Payments"

interface AuthUser {
    id: string
    name?: string
    phone?: string
    role?: string
}

interface PaymentDetailDialogProps {
    isOpen: boolean
    onClose: () => void
    payment: PaymentItem | null
    user: AuthUser | null
}

export function PaymentDetailDialog({ isOpen, onClose, payment, user }: PaymentDetailDialogProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [amount, setAmount] = useState("")
    const [status, setStatus] = useState<"PENDING" | "CONFIRMED" | "REJECTED">("PENDING")
    const [year, setYear] = useState("")
    const [paymentDate, setPaymentDate] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const queryClient = useQueryClient()
    const { isMobile } = useWidth()

    useEffect(() => {
        if (payment) {
            setAmount(payment.amount?.toString() || "")
            setStatus(payment.status || "PENDING")
            setYear(payment.paymentCircle?.toString() || "")
            const dateVal = payment.paymentDate || payment.createdAt
            setPaymentDate(dateVal ? new Date(dateVal).toISOString().split('T')[0] : "")
        }
    }, [payment])

    const handleSave = async () => {
        setIsSubmitting(true)
        try {
            await axios.patch('/payments/' + payment.id, {
                amount: parseFloat(amount),
                status,
                paymentCircle: parseInt(year),
                paymentDate: paymentDate || undefined
            })
            queryClient.invalidateQueries({ queryKey: ['payments'] })
            setIsEditing(false)
            onClose()
        } catch (error: any) {
            alert(error.message || "Failed to update payment")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!payment) return null

    const variants = {
        initial: isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, x: "-50%", y: "-40%" },
        animate: isMobile ? { y: 0 } : { opacity: 1, scale: 1, x: "-50%", y: "-50%" },
        exit: isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, x: "-50%", y: "-40%" },
    }

    const disableStatus = [payment.user?.id, payment.submittedBy?.id].includes(user?.id)

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
                />
            )}
            {isOpen && (
                <motion.div
                    key="dialog"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={variants}
                    className="fixed z-50 bottom-0 md:bottom-auto md:top-1/2 left-0 md:left-1/2 w-full md:w-[520px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:border md:rounded-2xl rounded-t-2xl shadow-2xl overflow-x-hidden"
                >
                    <div className="p-6 pb-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="font-bold text-xl text-slate-900 dark:text-white font-heading tracking-tight m-0">Payment Details</h2>
                                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Detailed view of the contribution record.</p>
                            </div>
                            <div className="flex gap-2">
                                <AccessControl permittedRoles={["SUPERADMIN", "ADMIN"]}>
                                    {!isEditing && (
                                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-finance-gold hover:text-finance-goldLight">
                                            <Edit className="w-4 h-4 mr-1" /> Edit
                                        </Button>
                                    )}
                                </AccessControl>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 md:block hidden">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Member Info */}
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="w-12 h-12 bg-finance-gold/10 rounded-full flex items-center justify-center text-finance-gold font-bold text-base">
                                    {payment.user?.name ? payment.user.name.slice(0, 2).toUpperCase() : <UserIcon className="w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Member</p>
                                    <p className="font-bold text-slate-900 dark:text-slate-100 text-[15px]">{payment.user?.name || "Unknown"}</p>
                                    {payment.user?.phone && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{payment.user.phone}</p>
                                    )}
                                </div>
                            </div>

                            {/* Amount & Year */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Amount</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="font-bold h-10"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg text-sm">
                                            <Banknote className="w-4 h-4 text-slate-400" />
                                            ₦ {Number(payment.amount).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Cycle (Year)</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                            className="font-bold h-10"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg text-sm">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {payment.paymentCircle}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Date & Submission Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Payment Date</Label>
                                    {isEditing ? (
                                        <Input
                                            type="date"
                                            value={paymentDate}
                                            max={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setPaymentDate(e.target.value)}
                                            className="font-bold h-10"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg text-sm">
                                            <Calendar className="w-4 h-4 text-finance-gold" />
                                            {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Recorded At</Label>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg text-xs">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        {new Date(payment.createdAt).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Status</Label>
                                <AccessControl permittedRoles={["SUPERADMIN", "ADMIN"]} fallback={
                                    <div className="mt-1">
                                        {payment.status === "CONFIRMED" && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-[#2cd48b] text-[#2cd48b] bg-[#2cd48b]/10">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> CONFIRMED
                                            </span>
                                        )}
                                        {payment.status === "PENDING" && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-finance-gold text-finance-gold bg-finance-gold/10">
                                                <Clock className="w-3.5 h-3.5" /> PENDING
                                            </span>
                                        )}
                                        {payment.status === "REJECTED" && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-[#ef4444] text-[#ef4444] bg-[#ef4444]/10">
                                                <XCircle className="w-3.5 h-3.5" /> REJECTED
                                            </span>
                                        )}
                                    </div>
                                }>
                                    {isEditing ? (
                                        <select
                                            value={status}
                                            disabled={disableStatus}
                                            onChange={(e) => setStatus(e.target.value as "PENDING" | "CONFIRMED" | "REJECTED")}
                                            className="w-full font-bold border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-800 text-sm"
                                        >
                                            <option value="PENDING" disabled={disableStatus}>PENDING</option>
                                            <option value="CONFIRMED" disabled={disableStatus}>CONFIRMED</option>
                                            <option value="REJECTED" disabled={disableStatus}>REJECTED</option>
                                        </select>
                                    ) : (
                                        <div className="mt-1">
                                            {status === "CONFIRMED" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-[#2cd48b] text-[#2cd48b] bg-[#2cd48b]/10">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> CONFIRMED
                                                </span>
                                            )}
                                            {status === "PENDING" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-finance-gold text-finance-gold bg-finance-gold/10">
                                                    <Clock className="w-3.5 h-3.5" /> PENDING
                                                </span>
                                            )}
                                            {status === "REJECTED" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-[#ef4444] text-[#ef4444] bg-[#ef4444]/10">
                                                    <XCircle className="w-3.5 h-3.5" /> REJECTED
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </AccessControl>
                            </div>

                            {/* Proof */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Proof of Payment</Label>
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                                    {payment.proofImage?.toLowerCase().endsWith('.pdf') ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-12 h-12 text-slate-400" />
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">PDF Document</p>
                                            <a href={payment.proofImage} target="_blank" rel="noreferrer" className="text-finance-gold text-sm font-bold hover:underline">View Document</a>
                                        </div>
                                    ) : (
                                        <img src={payment.proofImage} alt="Proof" className="w-full h-full object-contain" />
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="pt-2 flex gap-3">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSubmitting}
                                        className="flex-1 h-11 bg-finance-gold hover:bg-finance-goldLight text-white font-bold rounded-xl shadow-md"
                                    >
                                        <Save className="w-4 h-4 mr-2" /> {isSubmitting ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 h-11 font-bold text-slate-500"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 px-6 py-4">
                        <div className="flex items-center justify-between gap-4 text-xs">
                            <div>
                                <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px] tracking-wider block">Submitted By</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{payment?.submittedBy?.name || 'N/A'}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px] tracking-wider block">Last Updated By</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{payment?.updatedBy?.name || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
