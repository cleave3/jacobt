import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Eye } from "lucide-react"
import { PaymentDetailDialog } from "@/components/ui/PaymentDetailDialog"
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog"
import { axios } from "@/lib/axios"
import { useQueryClient } from "@tanstack/react-query"
import { AccessControl } from "@/components/auth/AccessControl"
import { toast } from "sonner"
import type { PaymentItem } from "../Payments"

interface AuthUser {
    id: string
    name?: string
    phone?: string
    role?: string
}

interface PaymentRowActionsProps {
    payment: PaymentItem
    user: AuthUser | null
}

export default function PaymentRowActions({ payment, user }: PaymentRowActionsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [pendingAction, setPendingAction] = useState<"CONFIRMED" | "REJECTED" | null>(null)
    const queryClient = useQueryClient()

    const handleAction = async (status: "CONFIRMED" | "REJECTED") => {
        setIsLoading(true)
        try {
            await axios.patch(`/payments/${payment.id}`, { status })
            queryClient.invalidateQueries({ queryKey: ['payments'] })
            toast.success(status === "CONFIRMED" ? "Payment confirmed successfully" : "Payment marked as rejected")
            setPendingAction(null)
        } catch (error: unknown) {
            const errObj = error as { response?: { data?: { message?: string } }; message?: string }
            toast.error(errObj.response?.data?.message || errObj.message || "Failed to update payment status")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex justify-end gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDetailOpen(true)}
                className="text-slate-500 hover:text-finance-gold h-8 flex items-center gap-1.5 font-bold cursor-pointer"
            >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">View</span>
            </Button>

            <AccessControl permittedRoles={["ADMIN", "SUPERADMIN"]}>
                {payment.status === "PENDING" && (user?.role === "SUPERADMIN" || (user?.role === "ADMIN" && payment.user?.id !== user?.id)) && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                            onClick={() => setPendingAction("REJECTED")}
                            className="hover:bg-red-50 hover:text-red-600 border-red-200 text-red-500 h-8 cursor-pointer"
                            title="Reject payment"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            disabled={isLoading}
                            onClick={() => setPendingAction("CONFIRMED")}
                            className="bg-[#2cd48b] hover:bg-[#20ba77] text-white border-transparent h-8 cursor-pointer"
                            title="Confirm payment"
                        >
                            <Check className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Confirm</span>
                        </Button>
                    </>
                )}
            </AccessControl>

            <PaymentDetailDialog
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                payment={payment}
                user={user}
            />

            <ConfirmActionDialog
                isOpen={pendingAction !== null}
                onClose={() => !isLoading && setPendingAction(null)}
                onConfirm={() => pendingAction && handleAction(pendingAction)}
                title={pendingAction === "CONFIRMED" ? "Approve Contribution?" : "Reject Contribution?"}
                description={
                    pendingAction === "CONFIRMED"
                        ? "Are you sure you want to approve this contribution? The record will be permanently marked as confirmed."
                        : "Are you sure you want to reject this contribution? The record will be marked as rejected."
                }
                confirmLabel={pendingAction === "CONFIRMED" ? "Yes, Approve" : "Yes, Reject"}
                variant={pendingAction === "CONFIRMED" ? "confirm" : "destructive"}
                isLoading={isLoading}
                paymentDetails={{
                    amount: payment.amount,
                    memberName: payment.user?.name,
                    cycle: payment.paymentCircle,
                }}
            />
        </div>
    )
}
