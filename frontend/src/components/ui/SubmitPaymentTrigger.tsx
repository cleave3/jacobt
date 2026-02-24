

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SubmitPaymentDialog } from "./SubmitPaymentDialog"

export function SubmitPaymentTrigger() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="bg-finance-gold hover:bg-finance-goldLight text-white font-semibold shadow-sm"
            >
                <Plus className="w-4 h-4 mr-2" />
                New Payment
            </Button>
            <SubmitPaymentDialog
                key={isOpen ? "open" : "closed"}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    )
}
