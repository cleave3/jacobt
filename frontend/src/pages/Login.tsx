import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
    Loader2, 
    Lock, 
    ShieldCheck, 
    Eye, 
    EyeOff, 
    AlertCircle, 
    X,
    ChevronRight,
    HelpCircle
} from "lucide-react"
import { axios } from "@/lib/axios"
import { useAuth } from "@/context/AuthContext"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"
import { normalizePhoneNumber } from "@/lib/phone"

interface LoginResponse {
    user?: {
        id: string
        name?: string
        phone?: string
        role?: string
    }
    message?: string
}

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [rememberPhone, setRememberPhone] = useState(true)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Load remembered phone on initial mount
    useEffect(() => {
        try {
            const savedPhone = localStorage.getItem("jacobt_saved_phone")
            if (savedPhone) {
                setPhone(savedPhone)
            }
        } catch {
            // Ignore localStorage issues
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const normalizedPhone = normalizePhoneNumber(phone)

        try {
            const result = await axios.post<unknown, LoginResponse>("/auth/login", {
                phone: normalizedPhone,
                password,
            })

            if (result.user) {
                // Save or remove phone based on remember option
                try {
                    if (rememberPhone) {
                        localStorage.setItem("jacobt_saved_phone", phone)
                    } else {
                        localStorage.removeItem("jacobt_saved_phone")
                    }
                } catch {
                    // Ignore storage errors
                }

                login(result.user)
                navigate("/")
            } else {
                setError("Invalid phone number or password")
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleForgotPassword = () => {
        toast.info("Password Recovery", {
            description: "Please contact your cooperative cooperative administrator to reset your login credentials.",
            duration: 5000,
        })
    }

    return (
        <div className="min-h-dvh w-full bg-[#0a0f1d] flex flex-col justify-between overflow-x-hidden relative selection:bg-finance-gold/30 selection:text-finance-gold">
            {/* Ambient Background Light Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-finance-gold/15 rounded-full blur-[100px]" />
                <div className="absolute top-1/3 -left-20 w-72 h-72 bg-finance-dark/40 rounded-full blur-[80px]" />
            </div>

            {/* Desktop Center Frame Wrapper: On mobile it is 100% full-screen; on desktop it renders an elegant mobile preview */}
            <div className="w-full flex-1 flex flex-col sm:items-center sm:justify-center sm:p-6 z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full flex-1 sm:flex-initial sm:max-w-105 flex flex-col justify-between sm:rounded-[36px] sm:border sm:border-slate-800/80 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] sm:overflow-hidden sm:bg-[#0f172a]/95 sm:backdrop-blur-xl min-h-dvh sm:min-h-0 sm:my-auto"
                >
                    {/* TOP HERO BRAND AREA (~35% viewport on mobile) */}
                    <div className="pt-safe px-6 pt-7 pb-5 flex flex-col items-center text-center relative shrink-0">
                        {/* Security Trust Pill */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[11px] font-medium tracking-wide mb-4 backdrop-blur-md shadow-sm"
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-finance-gold" />
                            <span>Cooperative Portal • 256-bit SSL</span>
                        </motion.div>

                        {/* Jacobt Glowing Brand Emblem */}
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
                            className="relative group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-finance-gold/25 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
                            <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl p-1 bg-linear-to-b from-finance-gold/50 via-slate-800 to-slate-900 border border-finance-gold/40 shadow-xl overflow-hidden flex items-center justify-center">
                                <img 
                                    src="/logo.png" 
                                    alt="Jacobt Logo" 
                                    width={72} 
                                    height={72} 
                                    className="w-full h-full object-cover rounded-[14px]" 
                                />
                            </div>
                        </motion.div>

                        {/* Hero Typography */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.5 }}
                        >
                            <h1 className="mt-3.5 text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                                Welcome back
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-sans max-w-70 mx-auto">
                                Sign in to monitor your properties and cooperative contributions
                            </p>
                        </motion.div>
                    </div>

                    {/* ELEVATED NATIVE BOTTOM-SHEET FORM SURFACE */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 flex flex-col justify-between bg-white dark:bg-[#151c2e] rounded-t-4xl sm:rounded-b-[36px] px-6 pt-5 pb-safe sm:pb-6 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] border-t border-slate-200/80 dark:border-slate-800 relative z-20"
                    >
                        <div>
                            {/* Sheet Handle Pill (Mobile Gesture Cue) */}
                            <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700/80 rounded-full mx-auto mb-4" />

                            {/* Authentication Form */}
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                {/* Error Notification Banner */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold overflow-hidden"
                                        >
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span className="flex-1 leading-snug">{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Phone Number Input Group with +234 Country Badge */}
                                <div>
                                    <label 
                                        htmlFor="phone-input" 
                                        className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                                    >
                                        Phone Number
                                    </label>
                                    <div className="relative flex items-center rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/70 focus-within:border-finance-gold focus-within:ring-2 focus-within:ring-finance-gold/20 transition-all overflow-hidden h-14">
                                        {/* Country Selector Pill */}
                                        <div className="flex items-center gap-1 pl-3.5 pr-2.5 py-2 border-r border-slate-200 dark:border-slate-700/80 bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold select-none shrink-0">
                                            <span className="text-sm leading-none" role="img" aria-label="Nigeria">🇳🇬</span>
                                            {/* <span>+234</span> */}
                                        </div>

                                        {/* Phone Input Field */}
                                        <input
                                            id="phone-input"
                                            type="tel"
                                            inputMode="numeric"
                                            autoComplete="tel"
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
                                            className="flex-1 px-3.5 h-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-[15px] font-semibold focus:outline-none"
                                            placeholder="801 234 5678"
                                        />

                                        {/* Clear Button */}
                                        {phone.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setPhone("")}
                                                className="mr-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                                                aria-label="Clear phone input"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Password Input Group with Embedded Toggle */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label 
                                            htmlFor="password-input" 
                                            className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                                        >
                                            Password
                                        </label>
                                    </div>

                                    <div className="relative flex items-center rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/70 focus-within:border-finance-gold focus-within:ring-2 focus-within:ring-finance-gold/20 transition-all overflow-hidden h-14">
                                        <div className="pl-3.5 text-slate-400 shrink-0">
                                            <Lock className="w-4.5 h-4.5" />
                                        </div>

                                        <input
                                            id="password-input"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="flex-1 px-3 h-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-[15px] font-semibold focus:outline-none tracking-normal"
                                            placeholder="••••••••"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="mr-3 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4.5 h-4.5" />
                                            ) : (
                                                <Eye className="w-4.5 h-4.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Phone & Quick Access Options */}
                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={rememberPhone}
                                            onChange={(e) => setRememberPhone(e.target.checked)}
                                            className="w-4 h-4 rounded text-finance-gold focus:ring-finance-gold border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                                        />
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                            Remember phone
                                        </span>
                                    </label>
                                </div>

                                {/* Tactile Primary Action Button */}
                                <div className="pt-2">
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-14 rounded-2xl bg-linear-to-r from-finance-gold via-[#f59e0b] to-finance-gold hover:opacity-95 text-white font-heading font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-finance-gold/25 active:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed select-none"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Signing In...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign In</span>
                                                <ChevronRight className="w-4.5 h-4.5 stroke-[2.5]" />
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </div>

                        {/* Footer Support Info */}
                        <div className="pt-6 pb-2 text-center">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-finance-gold dark:hover:text-finance-gold font-medium transition-colors"
                            >
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>Need help signing in? Contact Admin</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}

