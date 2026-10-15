import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutGrid, Building2, CreditCard, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"

const NavItems = [
    { href: "/", label: "Overview", icon: LayoutGrid },
    { href: "/properties", label: "Properties", icon: Building2 },
    { href: "/payments", label: "Contributions", icon: CreditCard },
    { href: "/members", label: "Members", icon: Users },
    { href: "/profile", label: "Profile", icon: User },
]

export function BottomNav() {
    const location = useLocation()
    const pathname = location.pathname

    return (
        <nav 
            aria-label="Mobile navigation" 
            className="md:hidden fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 max-w-md mx-auto z-50 h-16 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-950/15 flex items-center justify-around px-1.5"
        >
            {NavItems.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== "/")

                return (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                            "relative flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-colors cursor-pointer select-none",
                            isActive ? "text-finance-gold" : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        {/* Dominant Active Tab Pill Indicator */}
                        {isActive && (
                            <motion.div
                                layoutId="activeTabPill"
                                className="absolute inset-0 bg-finance-gold/15 dark:bg-finance-gold/20 rounded-xl border border-finance-gold/30 -z-10 shadow-sm"
                                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                            />
                        )}

                        <motion.div
                            whileTap={{ scale: 0.88 }}
                            animate={{ 
                                scale: isActive ? 1.18 : 1,
                                y: isActive ? -1 : 0
                            }}
                            transition={{ type: "spring", stiffness: 450, damping: 25 }}
                            className="flex flex-col items-center justify-center gap-0.5"
                        >
                            <item.icon 
                                className={cn(
                                    "w-5 h-5 transition-colors", 
                                    isActive && "text-finance-gold drop-shadow-[0_2px_8px_rgba(234,179,8,0.35)]"
                                )} 
                            />
                            <span 
                                className={cn(
                                    "text-[10px] tracking-tight transition-all",
                                    isActive ? "font-bold text-finance-gold scale-105" : "font-medium"
                                )}
                            >
                                {item.label}
                            </span>
                        </motion.div>
                    </Link>
                )
            })}
        </nav>
    )
}
