"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Building2, CreditCard, Users, BarChart2, LogOut, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NavItems = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/properties", label: "Properties", icon: Building2 },
    { href: "/payments", label: "Payments", icon: CreditCard },
    { href: "/members", label: "Members", icon: Users },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen border-r border-[#1f2937] bg-finance-dark text-slate-300 px-4 py-6">
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-8 h-8 rounded-lg bg-finance-gold flex items-center justify-center">
                    <span className="font-heading font-bold text-finance-darker text-lg">J</span>
                </div>
                <h1 className="font-heading font-bold text-xl text-white tracking-tight">Jacobt</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {NavItems.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== "/");

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
                                isActive
                                    ? "bg-[#1f2937] text-finance-gold shadow-sm"
                                    : "text-slate-400 hover:bg-[#1f2937]/50 hover:text-slate-200"
                            )}
                        >
                            <item.icon className={cn("w-4 h-4", isActive && "text-finance-gold")} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">
                        {session?.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{session?.user?.name || "User"}</p>
                        <p className="text-xs text-slate-400 truncate">{session?.user?.phone || ""}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
