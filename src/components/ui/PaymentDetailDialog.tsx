"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, Clock, XCircle, Edit, Save, Calendar, Banknote, User as UserIcon, FileText } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { updatePayment } from "@/app/payments/actions";
import { AccessControl } from "@/components/auth/AccessControl";

interface PaymentDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    payment: any;
    isAdmin: boolean;
    user: any;
}

export function PaymentDetailDialog({ isOpen, onClose, payment, isAdmin, user }: PaymentDetailDialogProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState<any>("");
    const [year, setYear] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (payment) {
            setAmount(payment.amount.toString());
            setStatus(payment.status);
            setYear(payment.paymentCircle.toString());
        }
    }, [payment]);

    const handleSave = async () => {
        setIsSubmitting(true);
        const result = await updatePayment(payment.id, {
            amount: parseFloat(amount),
            status,
            paymentCircle: parseInt(year)
        });

        if (result.success) {
            setIsEditing(false);
            onClose();
        } else {
            alert(result.error || "Failed to update payment");
        }
        setIsSubmitting(false);
    };

    if (!payment) return null;

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
                        className="fixed z-[100] bottom-0 md:bottom-auto md:top-1/2 left-0 md:left-1/2 w-full md:w-[500px] max-h-[92vh] overflow-y-auto bg-white border-t border-slate-200 md:border md:rounded-2xl rounded-t-2xl shadow-2xl overflow-x-hidden"
                    >
                        <div className="p-6 pb-12">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="font-bold text-xl text-slate-900 font-heading tracking-tight">Payment Details</h2>
                                    <p className="text-[14px] text-slate-500 mt-1 font-medium">Detailed view of the contribution.</p>
                                </div>
                                <div className="flex gap-2">
                                    <AccessControl permittedRoles={["SUPERADMIN"]}>
                                        {!isEditing && (
                                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-finance-gold hover:text-finance-goldLight">
                                                <Edit className="w-4 h-4 mr-1" /> Edit
                                            </Button>
                                        )}
                                    </AccessControl>
                                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 md:block hidden">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Member Info */}
                                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="w-12 h-12 bg-finance-gold/10 rounded-full flex items-center justify-center text-finance-gold">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">Member</p>
                                        <p className="font-bold text-slate-900 dark:text-slate-200">{payment.user?.name || "Unknown"}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Amount</Label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="font-bold"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-900 font-bold p-2 bg-white border border-slate-100 rounded-lg">
                                                <Banknote className="w-4 h-4 text-slate-400" />
                                                ₦ {Number(payment.amount).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Year</Label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={year}
                                                onChange={(e) => setYear(e.target.value)}
                                                className="font-bold"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-900 font-bold p-2 bg-white border border-slate-100 rounded-lg">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                {payment.paymentCircle}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Status</Label>
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
                                                disabled={payment.user.id === user.id}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="w-full font-bold border border-slate-200 rounded-lg p-2 outline-none"
                                            >
                                                <option value="PENDING" disabled={payment.user.id === user.id}>PENDING</option>
                                                <option value="CONFIRMED" disabled={payment.user.id === user.id}>CONFIRMED</option>
                                                <option value="REJECTED" disabled={payment.user.id === user.id}>REJECTED</option>
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

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Proof of Payment</Label>
                                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                                        {payment.proofImage?.toLowerCase().endsWith('.pdf') ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="w-12 h-12 text-slate-300" />
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">PDF Document</p>
                                                <a href={payment.proofImage} target="_blank" className="text-finance-gold text-sm font-bold hover:underline">View Document</a>
                                            </div>
                                        ) : (
                                            <img src={payment.proofImage} alt="Proof" className="w-full h-full object-contain" />
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="pt-4 flex gap-3">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSubmitting}
                                            className="flex-1 h-12 bg-finance-gold hover:bg-finance-goldLight text-white font-bold rounded-xl shadow-md"
                                        >
                                            <Save className="w-4 h-4 mr-2" /> {isSubmitting ? "Saving..." : "Save Changes"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 h-12 font-bold text-slate-500"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
