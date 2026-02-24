import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "./button"
import { AssetDialog } from "./AssetDialog"
import { AccessControl } from "@/components/auth/AccessControl"

export function AddAssetButton({ showFullText = false }: { showFullText?: boolean }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <AccessControl permittedRoles={["SUPERADMIN", "ADMIN"]}>
            <Button
                onClick={() => setIsOpen(true)}
                className="bg-finance-gold hover:bg-finance-goldLight text-white h-10 px-4 rounded-xl shadow-sm flex items-center gap-2 font-bold text-sm transition-all active:scale-95"
            >
                <Plus className="w-4 h-4" />
                <span className={`${showFullText ? '' : 'hidden'} sm:inline`}>Add Property</span>
            </Button>

            <AssetDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </AccessControl>
    )
}
