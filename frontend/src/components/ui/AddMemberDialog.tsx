

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, CheckCircle2, UserPlus, Phone, Lock, Shield } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { PasswordInput } from "./password-input"
import { Label } from "./label"
import { axios } from "@/lib/axios"

interface DialogProps {
    isOpen: boolean
    onClose: () => void
}

export function AddMemberDialog({ isOpen, onClose }: DialogProps) {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState<"USER" | "ADMIN">("USER")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            await axios.post('/users', { name, phone, password, role })
            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                setName("")
                setPhone("")
                setPassword("")
                setRole("USER")
                onClose()
                window.location.reload()
            }, 2000)
        } catch (err: any) {
            setError(err.message || "Something went wrong")
        }
        setIsSubmitting(false)
    }

    const variants = {
        initial: isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, x: "-50%", y: "-40%" },
        animate: isMobile ? { y: 0 } : { opacity: 1, scale: 1, x: "-50%", y: "-50%" },
        exit: isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, x: "-50%", y: "-40%" },
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100"
                />
            )}
            {isOpen && (
                <motion.div
                    key="dialog"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={variants}
                    drag={isMobile ? "y" : false}
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={{ top: 0, bottom: 0.8 }}
                    onDragEnd={(_, info) => {
                        if (info.offset.y > 100) onClose()
                    }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed z-100 bottom-0 md:bottom-auto md:top-1/2 left-0 md:left-1/2 w-full md:w-[420px] max-h-[92vh] overflow-y-auto bg-white border-t border-slate-200 md:border md:rounded-2xl rounded-t-2xl shadow-2xl overflow-x-hidden"
                >
                    {/* Drag Handle for Mobile */}
                    <div className="md:hidden w-full flex justify-center py-3">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                    </div>

                    <div className="p-6 pt-2 md:pt-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="font-bold text-xl text-slate-900 font-heading tracking-tight">Add New Member</h2>
                                <p className="text-[14px] text-slate-500 mt-1 font-medium">Create a new community member account.</p>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 md:block hidden">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {success ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring" }}
                                >
                                    <CheckCircle2 className="w-16 h-16 text-[#2cd48b]" />
                                </motion.div>
                                <h3 className="font-bold text-lg text-slate-900 text-center font-heading">Member Added!</h3>
                                <p className="text-sm text-slate-500 text-center font-medium">The new member has been successfully created.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 pb-10">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100 mb-2">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Full Name</Label>
                                    <div className="relative">
                                        <Input
                                            id="name"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="pl-10 text-[15px] font-semibold border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 h-11"
                                        />
                                        <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Phone Number</Label>
                                    <div className="relative">
                                        <Input
                                            id="phone"
                                            placeholder="08012345678"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                            className="pl-10 text-[15px] font-semibold border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 h-11"
                                        />
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Temporary Password</Label>
                                    <div className="relative">
                                        <PasswordInput
                                            id="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pl-10 text-[15px] font-semibold border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 h-11"
                                        />
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Role</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setRole("USER")}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-[13px] font-bold transition-all ${role === "USER"
                                                ? "bg-slate-900 text-white border-slate-900"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                                }`}
                                        >
                                            Member
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole("ADMIN")}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-[13px] font-bold transition-all ${role === "ADMIN"
                                                ? "bg-finance-gold text-white border-finance-gold"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                                }`}
                                        >
                                            <Shield className="w-4 h-4" /> Admin
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col gap-3">
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-finance-gold hover:bg-finance-goldLight text-white font-bold text-[16px] rounded-xl shadow-md transition-all active:scale-[0.98]"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Creating..." : "Create Account"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={onClose}
                                        className="w-full h-10 text-slate-500 font-bold hover:text-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
