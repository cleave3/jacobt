import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, User as UserIcon } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { useSession } from "next-auth/react";
import { getMembers } from "@/app/members/actions";
import { submitPayment } from "@/app/payments/actions";
import ImageUpload from "./ImageUpload";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SubmitPaymentDialog({ isOpen, onClose }: DialogProps) {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;
    const canManageothers = userRole === "ADMIN" || userRole === "SUPERADMIN";

    const [amount, setAmount] = useState("");
    const [proofUrl, setProofUrl] = useState("");
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [members, setMembers] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        if (canManageothers && isOpen) {
            getMembers().then(res => {
                if (res.success) setMembers(res.members || []);
            });
        }

        if (session?.user && !selectedMemberId) {
            setSelectedMemberId((session.user as any).id);
        }

        return () => window.removeEventListener("resize", checkMobile);
    }, [canManageothers, isOpen, session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !proofUrl) {
            setError("Please provide amount and proof of payment");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const result = await submitPayment({
            userId: selectedMemberId || (session?.user as any).id,
            amount: parseFloat(amount),
            paymentCircle: year,
            proofUrl: proofUrl
        });

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setAmount("");
                setProofUrl("");
                onClose();
            }, 2000);
        } else {
            setError(result.error || "Failed to submit payment");
        }
        setIsSubmitting(false);
    };

    const variants = {
        initial: isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, x: "-50%", y: "-40%" },
        animate: isMobile ? { y: 0 } : { opacity: 1, scale: 1, x: "-50%", y: "-50%" },
        exit: isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, x: "-50%", y: "-40%" },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={variants}
                        drag={isMobile ? "y" : false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.8 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed z-[100] bottom-0 md:bottom-auto md:top-1/2 left-0 md:left-1/2 w-full md:w-[420px] max-h-[92vh] overflow-y-auto bg-white border-t border-slate-200 md:border md:rounded-2xl rounded-t-2xl shadow-2xl overflow-x-hidden"
                    >
                        {/* Drag Handle for Mobile */}
                        <div className="md:hidden w-full flex justify-center py-3">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                        </div>

                        <div className="p-6 pt-2 md:pt-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="font-bold text-xl text-slate-900 font-heading tracking-tight">Submit Payment</h2>
                                    <p className="text-[14px] text-slate-500 mt-1 font-medium">Upload your proof of payment for review.</p>
                                </div>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 md:block hidden">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {success ? (
                                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring" }}
                                    >
                                        <CheckCircle2 className="w-16 h-16 text-[#2cd48b]" />
                                    </motion.div>
                                    <h3 className="font-bold text-lg text-slate-900 text-center font-heading">Payment Submitted!</h3>
                                    <p className="text-sm text-slate-500 text-center font-medium">Your payment has been sent to admin for review.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5 pb-10">
                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100">
                                            {error}
                                        </div>
                                    )}

                                    {canManageothers && (
                                        <div className="space-y-1.5">
                                            <Label htmlFor="member" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Select Member</Label>
                                            <div className="relative">
                                                <select
                                                    id="member"
                                                    value={selectedMemberId}
                                                    onChange={(e) => setSelectedMemberId(e.target.value)}
                                                    className="w-full text-[15px] font-semibold border border-slate-200 rounded-md px-10 h-11 focus:border-finance-gold focus:ring-4 ring-finance-gold/20 outline-none transition-all text-slate-900 bg-white appearance-none"
                                                >
                                                    <option value={(session?.user as any)?.id}>Current User (Me)</option>
                                                    {members.filter(m => m.id !== (session?.user as any)?.id).map(member => (
                                                        <option key={member.id} value={member.id}>{member.name}</option>
                                                    ))}
                                                </select>
                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <Label htmlFor="amount" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Amount (₦)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="e.g. 25000"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                            className="text-[15px] font-semibold border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 h-11"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="year" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Payment Circle (Year)</Label>
                                        <div className="relative">
                                            <select
                                                id="year"
                                                value={year}
                                                onChange={(e) => setYear(parseInt(e.target.value))}
                                                className="w-full text-[15px] font-semibold border border-slate-200 rounded-md px-3 h-11 focus:border-finance-gold focus:ring-4 ring-finance-gold/20 outline-none transition-all text-slate-900 bg-white appearance-none"
                                            >
                                                <option value={currentYear}>{currentYear}</option>
                                                <option value={currentYear - 1}>{currentYear - 1}</option>
                                                <option value={currentYear + 1}>{currentYear + 1}</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Proof of Payment</Label>
                                        <ImageUpload onUpload={(url) => setProofUrl(url)} />
                                        {proofUrl && (
                                            <p className="text-[10px] text-green-600 font-bold uppercase mt-1">✓ Proof Uploaded Successfully</p>
                                        )}
                                    </div>

                                    <div className="pt-4 flex flex-col gap-3">
                                        <Button
                                            type="submit"
                                            className="w-full h-12 bg-finance-gold hover:bg-finance-goldLight text-white font-bold text-[16px] rounded-xl shadow-md transition-all active:scale-[0.98]"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Processing..." : "Submit for Approval"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={onClose}
                                            className="w-full h-10 text-slate-500 font-bold hover:text-slate-800 transition-colors"
                                        >
                                            Dismiss
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
