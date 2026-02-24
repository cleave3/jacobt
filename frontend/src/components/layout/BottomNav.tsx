

import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, Building2, CreditCard, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"

const NavItems = [
    { href: "/", label: "Overview", icon: LayoutGrid },
    { href: "/properties", label: "Properties", icon: Building2 },
    { href: "/payments", label: "Contributions", icon: CreditCard },
    { href: "/members", label: "Members", icon: Users },
    // { href: "/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/profile", label: "Profile", icon: User },
]

export function BottomNav() {
    const location = useLocation()
    const pathname = location.pathname

    return (
        <div className="md:hidden fixed bottom-0 w-full h-16 bg-background/80 backdrop-blur-md border-t border-border z-50 px-6 flex justify-between items-center pb-safe">
            {NavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center space-y-1 w-12",
                            isActive ? "text-finance-gold" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("w-6 h-6", isActive && "animate-pulse-glow")} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                )
            })}
        </div>
    )
}
