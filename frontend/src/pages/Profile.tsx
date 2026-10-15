import { useState } from "react"
import { motion } from "framer-motion"
import { AppShell } from "@/components/layout/AppShell"
import { Skeleton } from "@/components/ui/skeleton"
import { PushNotificationManager } from "@/components/pwa/PushNotificationManager"
import { 
    Bell, 
    Palette, 
    Lock, 
    Phone, 
    ShieldCheck, 
    TrendingUp, 
    CreditCard, 
    ChevronRight, 
    LogOut, 
    Copy, 
    Check, 
    Calendar 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { axios } from "@/lib/axios"
import { useTheme } from "@/components/providers/ThemeProvider"
import { useAuth } from "@/context/AuthContext"

interface ProfileUser {
    id: string
    name: string
    phone?: string
    email?: string
    role?: string
    createdAt?: string
}

interface ProfileMetrics {
    totalContribution?: number
    totalPayments?: number
    pendingPayments?: number
}

interface UserProfileResponse {
    user: ProfileUser
    metrics: ProfileMetrics
}

export default function Profile() {
    const { theme, setTheme } = useTheme()
    const { logout } = useAuth()
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const { data: response, isLoading, error } = useQuery<UserProfileResponse>({
        queryKey: ['profile'],
        queryFn: async (): Promise<UserProfileResponse> => {
            const res = await axios.get('/users/profile')
            return (res as unknown as { data: UserProfileResponse }).data || (res as unknown as UserProfileResponse)
        }
    })

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match")
            return
        }

        setIsChangingPassword(true)
        try {
            await axios.put('/users/profile/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            })
            toast.success("Password updated successfully")
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
            setIsPasswordModalOpen(false)
        } catch (err: unknown) {
            const errObj = err as { response?: { data?: { message?: string } }; message?: string }
            toast.error(errObj.response?.data?.message || errObj.message || "Failed to change password")
        } finally {
            setIsChangingPassword(false)
        }
    }

    const copyPhoneNumber = (phone?: string) => {
        if (!phone) return
        navigator.clipboard.writeText(phone)
        setIsCopied(true)
        toast.success(`Copied ${phone} to clipboard`)
        setTimeout(() => setIsCopied(false), 2000)
    }

    if (isLoading) {
        return (
            <AppShell>
                <div className="max-w-2xl mx-auto space-y-6 pb-12 w-full">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-24 w-full rounded-2xl" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                    </div>
                    <Skeleton className="h-44 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            </AppShell>
        )
    }

    if (error || !response) {
        return (
            <AppShell>
                <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#1e293b] rounded-2xl border border-red-100 dark:border-red-900/30">
                    <p className="text-red-500 font-bold mb-2">Failed to load profile data.</p>
                    <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                        Retry
                    </Button>
                </div>
            </AppShell>
        )
    }

    const { user, metrics } = response

    return (
        <AppShell>
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="max-w-2xl mx-auto space-y-6 pb-12"
            >
                {/* Hero Profile Card */}
                <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-finance-gold to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-finance-gold/25 font-bold text-2xl sm:text-3xl font-heading shrink-0">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading tracking-tight truncate">
                                {user?.name || "Unknown Member"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-finance-gold/15 text-finance-gold border border-finance-gold/30">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    {user?.role || "MEMBER"}
                                </span>
                                {user?.phone && (
                                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                                        {user.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Dual Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                <span className="font-bold text-[10px] uppercase tracking-wider">Total Paid</span>
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                            <p className="font-extrabold font-mono text-slate-900 dark:text-white text-base sm:text-lg">
                                ₦ {(metrics?.totalContribution || 0).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Confirmed to date</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                <span className="font-bold text-[10px] uppercase tracking-wider">Records</span>
                                <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <p className="font-extrabold font-mono text-slate-900 dark:text-white text-base sm:text-lg">
                                {metrics?.totalPayments || 0}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                {metrics?.pendingPayments || 0} pending review
                            </p>
                        </div>
                    </div>
                </div>

                {/* Group 1: Account & Security */}
                <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3">
                        Account & Security
                    </p>
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
                        {/* Change Password Row */}
                        <div 
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="p-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer active:bg-slate-100/70 dark:active:bg-slate-800/70"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-finance-gold/10 text-finance-gold flex items-center justify-center">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Change Password</p>
                                    <p className="text-xs text-slate-400">Update your account credentials</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Registered Phone */}
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Phone Number</p>
                                    <p className="text-xs text-slate-400 font-mono">{user?.phone || "Not set"}</p>
                                </div>
                            </div>
                            {user?.phone && (
                                <button
                                    type="button"
                                    onClick={() => copyPhoneNumber(user?.phone)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    title="Copy phone number"
                                >
                                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            )}
                        </div>

                        {/* Member Since Date */}
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Member Since</p>
                                    <p className="text-xs text-slate-400">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Group 2: Preferences */}
                <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3">
                        Preferences
                    </p>
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
                        {/* Theme Toggle Row */}
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                    <Palette className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Appearance</p>
                                    <p className="text-xs text-slate-400 capitalize">{theme} mode</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setTheme('light')}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        theme === 'light' 
                                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Light
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTheme('dark')}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        theme === 'dark' 
                                            ? 'bg-finance-gold text-white shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Dark
                                </button>
                            </div>
                        </div>

                        {/* Push Notifications Row */}
                        <div className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-xl bg-finance-gold/10 text-finance-gold flex items-center justify-center">
                                    <Bell className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Push Notifications</p>
                                    <p className="text-xs text-slate-400">Instant alerts for approvals and reminders</p>
                                </div>
                            </div>
                            <PushNotificationManager />
                        </div>
                    </div>
                </div>

                {/* Group 3: Account Actions */}
                <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3">
                        Session
                    </p>
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <button
                            type="button"
                            onClick={logout}
                            className="w-full p-4 flex items-center justify-between text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer active:scale-[0.99]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                    <LogOut className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold">Log Out of Jacobt</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-rose-400" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Change Password Dialog / Bottom Sheet Modal */}
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <Lock className="w-5 h-5 text-finance-gold" />
                            <span>Change Password</span>
                        </DialogTitle>
                        <DialogDescription>
                            Enter your current password and choose a new secure password.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <PasswordInput
                                id="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="newPassword">New Password</Label>
                            <PasswordInput
                                id="newPassword"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <PasswordInput
                                id="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="pt-2 flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="flex-1 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isChangingPassword}
                                className="flex-1 bg-finance-gold hover:bg-finance-goldLight text-white font-bold rounded-xl"
                            >
                                {isChangingPassword ? "Updating..." : "Update Password"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppShell>
    )
}
