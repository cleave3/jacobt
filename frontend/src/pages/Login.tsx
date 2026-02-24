import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Loader2 } from "lucide-react"
import { axios } from "@/lib/axios"
import { useAuth } from "@/context/AuthContext"
import { AnimatePresence, motion } from "framer-motion"

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const result: any = await axios.post("/auth/login", {
                phone,
                password,
            })

            if (result.user) {
                login(result.user)
                navigate("/")
            } else {
                setError("Invalid phone number or password")
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1, type: "tween", ease: "easeInOut" }}

                className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
                            <img src="/logo.png" alt="Jacobt" width={64} height={64} className="object-cover" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-heading font-bold text-slate-900 dark:text-white">
                        Welcome to Jacobt
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white dark:bg-[#1e293b] py-8 px-4 shadow-sm mx-5 sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-800">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium border border-red-100 dark:border-red-900/50">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Phone Number
                                </label>
                                <Input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-finance-gold dark:text-white transition-shadow text-[15px] font-semibold"
                                    placeholder="0800000000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Password
                                </label>
                                <PasswordInput
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-finance-gold dark:text-white transition-shadow text-[15px] font-semibold"
                                    placeholder="••••••••"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-6 text-base font-bold rounded-xl"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                            </Button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
