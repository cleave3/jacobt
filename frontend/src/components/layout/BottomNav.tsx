

import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, Building2, CreditCard, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const NavItems = [
    { href: "/", label: "Overview", icon: LayoutGrid },
    { href: "/properties", label: "Properties", icon: Building2 },
    { href: "/payments", label: "Contributions", icon: CreditCard },
    { href: "/members", label: "Members", icon: Users },
]

export function BottomNav() {
    const location = useLocation()
    const pathname = location.pathname

    return (
        <div className="md:hidden fixed bottom-0 w-full h-16 bg-background/90 backdrop-blur-md border-t border-border z-50 px-2 flex justify-around items-center pb-safe">
            {NavItems.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== "/")

                return (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center space-y-1 min-w-[64px] min-h-[44px] rounded-xl transition-all active:scale-95",
                            isActive ? "text-finance-gold font-bold" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5", isActive && "text-finance-gold animate-pulse-glow")} />
                        <span className="text-[10px] tracking-tight">{item.label}</span>
                    </Link>
                )
            })}
        </div>
    )
}
