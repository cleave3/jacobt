import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react"

export type ConfirmVariant = "confirm" | "destructive" | "warning"

export interface PaymentDetailsSummary {
    amount?: number | string
    memberName?: string
    cycle?: string | number
}

export interface ConfirmActionDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: ConfirmVariant
    paymentDetails?: PaymentDetailsSummary
    isLoading?: boolean
}

export function ConfirmActionDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Proceed",
    cancelLabel = "Cancel",
    variant = "confirm",
    paymentDetails,
    isLoading = false,
}: ConfirmActionDialogProps) {
    const isDestructive = variant === "destructive"
    const isConfirm = variant === "confirm"
    const isWarning = variant === "warning"

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] w-[92vw] rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <DialogHeader className="items-center text-center space-y-3 pt-2">
                    {/* Icon Header */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                        isConfirm
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-emerald-500/10"
                            : isDestructive
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-rose-500/10"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-amber-500/10"
                    }`}>
                        {isConfirm && <CheckCircle2 className="w-7 h-7" />}
                        {isDestructive && <XCircle className="w-7 h-7" />}
                        {isWarning && <AlertTriangle className="w-7 h-7" />}
                    </div>

                    <DialogTitle className="text-xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
                        {title}
                    </DialogTitle>

                    {description && (
                        <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                {/* Financial Context Card if payment details provided */}
                {paymentDetails && (
                    <div className="my-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left space-y-2">
                        {paymentDetails.memberName && (
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Member</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                                    {paymentDetails.memberName}
                                </span>
                            </div>
                        )}
                        {paymentDetails.cycle && (
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Cycle</span>
                                <span className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                                    {paymentDetails.cycle}
                                </span>
                            </div>
                        )}
                        {paymentDetails.amount !== undefined && (
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Amount</span>
                                <span className="font-extrabold font-mono text-base text-slate-900 dark:text-white">
                                    ₦ {Number(paymentDetails.amount).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center gap-3 pt-3">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={isLoading}
                        onClick={onClose}
                        className="flex-1 h-11 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        disabled={isLoading}
                        onClick={onConfirm}
                        className={`flex-1 h-11 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer ${
                            isConfirm
                                ? "bg-[#2cd48b] hover:bg-[#20ba77] shadow-emerald-500/20"
                                : isDestructive
                                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                                : "bg-finance-gold hover:bg-finance-goldLight shadow-finance-gold/20"
                        }`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            confirmLabel
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
