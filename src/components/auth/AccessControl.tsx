"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

interface AccessControlProps {
    children: ReactNode;
    permittedRoles: string[];
    fallback?: ReactNode;
}

/**
 * AccessControl component to restrict UI elements based on user roles.
 * Returns children if the user has one of the permitted roles, 
 * otherwise returns fallback (defaults to null).
 */
export function AccessControl({ children, permittedRoles, fallback = null }: AccessControlProps) {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return null;
    }

    if (!session || !session.user) {
        return fallback as any;
    }

    const userRole = (session.user as any).role;

    if (permittedRoles.includes(userRole)) {
        return children as any;
    }

    return fallback as any;
}
