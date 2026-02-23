"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./button";
import { AddMemberDialog } from "./AddMemberDialog";
import { AccessControl } from "@/components/auth/AccessControl";

export function AddMemberButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <AccessControl permittedRoles={["SUPERADMIN", "ADMIN"]}>
            <Button
                onClick={() => setIsOpen(true)}
                className="bg-finance-gold hover:bg-finance-goldLight text-white h-10 px-4 rounded-xl shadow-sm flex items-center gap-2 font-bold text-sm transition-all active:scale-95"
            >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Member</span>
            </Button>

            <AddMemberDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </AccessControl>
    );
}
