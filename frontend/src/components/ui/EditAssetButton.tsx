

import { useState } from "react"
import { Edit } from "lucide-react"
import { Button } from "./button"
import { AssetDialog } from "./AssetDialog"
import { AccessControl } from "@/components/auth/AccessControl"

export function EditAssetButton({ asset }: { asset: any }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <AccessControl permittedRoles={["SUPERADMIN", "ADMIN"]}>
            <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                className="h-10 px-4 rounded-xl shadow-sm flex items-center gap-2 font-bold text-sm transition-all active:scale-95 border-slate-200"
            >
                <Edit className="w-4 h-4" />
                <span>Edit Property</span>
            </Button>

            <AssetDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                asset={asset}
            />
        </AccessControl>
    )
}
