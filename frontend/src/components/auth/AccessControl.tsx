import { useAuth } from "@/context/AuthContext"
import { ReactNode } from "react"

interface AccessControlProps {
    children: ReactNode
    permittedRoles: string[]
    fallback?: ReactNode
}

export function AccessControl({ children, permittedRoles, fallback = null }: AccessControlProps) {
    const { user } = useAuth()

    return permittedRoles.includes(user?.role || "") ? children : fallback
}
