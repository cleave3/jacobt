import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { User, LogOut, ChevronDown, Phone, ShieldCheck } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getUserInitials } from "@/lib/utils"

export function UserNavDropdown() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
            document.addEventListener("keydown", handleKeyDown)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [isOpen])

    const initials = getUserInitials(user?.name)

    const handleProfileClick = () => {
        setIsOpen(false)
        navigate("/profile")
    }

    const handleLogout = () => {
        setIsOpen(false)
        logout()
    }

    const getRoleBadge = (role?: string) => {
        switch (role) {
            case "SUPERADMIN":
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                        <ShieldCheck className="w-2.5 h-2.5" /> SUPERADMIN
                    </span>
                )
            case "ADMIN":
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
                        <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
                    </span>
                )
            default:
                return (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        MEMBER
                    </span>
                )
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label="User navigation menu"
                className="group flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-slate-200 dark:border-slate-800 hover:border-finance-gold/50 bg-white dark:bg-[#1e293b] shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
            >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-500 via-finance-gold to-yellow-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-inner select-none">
                    {initials}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[110px]">
                        {user?.name || "Account"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                        {user?.role === "SUPERADMIN" ? "Super Admin" : user?.role === "ADMIN" ? "Admin" : "Member"}
                    </span>
                </div>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-finance-gold" : ""
                    }`}
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 overflow-hidden"
                    >
                        {/* User Summary Card */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80 mb-1.5">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-finance-gold text-white font-extrabold text-base flex items-center justify-center shadow-sm shrink-0">
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1 mb-0.5">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                            {user?.name || "Jacobt Member"}
                                        </p>
                                    </div>
                                    {user?.phone && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5 truncate">
                                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                            <span>{user.phone}</span>
                                        </p>
                                    )}
                                    <div className="mt-1.5">
                                        {getRoleBadge(user?.role)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Items */}
                        <div className="space-y-0.5">
                            <button
                                type="button"
                                onClick={handleProfileClick}
                                className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-finance-gold/15 text-slate-500 group-hover:text-finance-gold flex items-center justify-center transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 dark:text-slate-100">My Profile</p>
                                    <p className="text-[11px] text-slate-400">View and update account details</p>
                                </div>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

                        {/* Logout Action */}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                        >
                            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/30 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30 text-rose-500 flex items-center justify-center transition-colors">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold">Log Out</p>
                                <p className="text-[11px] text-rose-500/70 dark:text-rose-400/70">End current session</p>
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
