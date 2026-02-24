

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, CheckCircle2, Banknote, Calendar, Hash } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { axios } from "@/lib/axios"
import useWidth from "@/hooks/useWidth"
import { useQueryClient } from "@tanstack/react-query"

interface TargetDialogProps {
    isOpen: boolean
    onClose: () => void
    initialData?: {
        year: number
        individualTarget: number
        numOfPayments: number
        numOfMembers: number
    }
}

export function TargetDialog({ isOpen, onClose, initialData }: TargetDialogProps) {
    const queryClient = useQueryClient()
    const [year, setYear] = useState(new Date().getFullYear())
    const [individualTarget, setIndividualTarget] = useState("")
    const [numOfPayments, setNumOfPayments] = useState("10")
    const [numOfMembers, setNumOfMembers] = useState("6")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const { isMobile } = useWidth()

    useEffect(() => {
        if (initialData) {
            setYear(initialData.year || new Date().getFullYear())
            setIndividualTarget((initialData.individualTarget ?? "").toString())
            setNumOfPayments((initialData.numOfPayments ?? "10").toString())
            setNumOfMembers((initialData.numOfMembers ?? "6").toString())
        } else {
            setYear(new Date().getFullYear())
            setIndividualTarget("")
            setNumOfPayments("10")
            setNumOfMembers("6")
        }
    }, [initialData, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            await axios.post('/analytics/target', {
                year,
                individualTarget: parseFloat(individualTarget),
                numOfPayments: parseInt(numOfPayments),
                numOfMembers: parseInt(numOfMembers)
            })
            setSuccess(true)
            onClose()
            queryClient.invalidateQueries({ queryKey: ['analytics'] })
            setTimeout(() => {
                setSuccess(false)
            }, 2000)
        } catch (error: any) {
            setError(error.message || "Something went wrong")
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
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
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
                    className="fixed z-50 bottom-0 md:bottom-auto md:top-1/2 left-0 md:left-1/2 w-full md:w-[400px] bg-white border-t border-slate-200 md:border md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="font-bold text-xl text-slate-900 font-heading tracking-tight">Set Annual Target</h2>
                                <p className="text-[14px] text-slate-500 mt-1 font-medium">Define collection expectations for the year.</p>
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
                                <h3 className="font-bold text-lg text-slate-900 text-center font-heading">Target Saved!</h3>
                                <p className="text-sm text-slate-500 text-center font-medium">Annual target has been updated.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100 mb-2">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label htmlFor="year" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Year</Label>
                                    <div className="relative">
                                        <Input
                                            id="year"
                                            type="number"
                                            value={year}
                                            onChange={(e) => setYear(parseInt(e.target.value))}
                                            required
                                            className="pl-9 text-[15px] font-semibold border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 h-11"
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="individualTarget" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Individual Monthly Target (₦)</Label>
                                    <div className="relative">
                                        <Input
                                            id="individualTarget"
                                            type="number"
                                            placeholder="500000"
                                            value={individualTarget}
                                            onChange={(e) => setIndividualTarget(e.target.value)}
                                            required
                                            className="pl-9 text-[15px] font-semibold border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 h-11"
                                        />
                                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="numPayments" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Number of Installments</Label>
                                    <div className="relative">
                                        <Input
                                            id="numPayments"
                                            type="number"
                                            placeholder="10"
                                            value={numOfPayments}
                                            onChange={(e) => setNumOfPayments(e.target.value)}
                                            required
                                            className="pl-9 text-[15px] font-semibold border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 h-11"
                                        />
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="numMembers" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Expected Number of Members</Label>
                                    <div className="relative">
                                        <Input
                                            id="numMembers"
                                            type="number"
                                            placeholder="6"
                                            value={numOfMembers}
                                            onChange={(e) => setNumOfMembers(e.target.value)}
                                            required
                                            className="pl-9 text-[15px] font-semibold border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 h-11"
                                        />
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col gap-3">
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-finance-gold hover:bg-finance-goldLight text-white font-bold text-[16px] rounded-xl shadow-md transition-all active:scale-[0.98]"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Saving..." : "Save Target"}
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
