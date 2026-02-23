"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { PaymentDetailDialog } from "@/components/ui/PaymentDetailDialog";

export default function PaymentRowActions({ payment, isAdmin, user }: { payment: any, isAdmin: boolean, user: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const router = useRouter();

    const handleAction = async (status: "CONFIRMED" | "REJECTED") => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/payments/${payment.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });

            if (!res.ok) throw new Error("Failed to process action");

            // Hard refresh the router to pull down updated backend states
            router.refresh();

        } catch (error) {
            console.error("Action error:", error);
            alert("Failed to update payment status.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-end gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDetailOpen(true)}
                className="text-slate-500 hover:text-finance-gold h-8 flex items-center gap-1.5 font-bold"
            >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">View</span>
            </Button>

            {isAdmin && payment.status === "PENDING" && payment.user.id !== user.id && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleAction("REJECTED")}
                        className="hover:bg-red-50 hover:text-red-600 border-red-200 text-red-500 h-8"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    </Button>
                    <Button
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleAction("CONFIRMED")}
                        className="bg-[#2cd48b] hover:bg-[#20ba77] text-white border-transparent h-8"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <>
                                <Check className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Confirm</span>
                            </>
                        )}
                    </Button>
                </>
            )}

            <PaymentDetailDialog
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                payment={payment}
                isAdmin={isAdmin}
                user={user}
            />
        </div>
    );
}
