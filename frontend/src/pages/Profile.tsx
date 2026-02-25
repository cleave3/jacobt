import { useState } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { Skeleton } from "@/components/ui/skeleton"
import { PushNotificationManager } from "@/components/pwa/PushNotificationManager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Bell, Palette, Lock, Phone, ShieldCheck, TrendingUp, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { axios } from "@/lib/axios"
import { useTheme } from "@/components/providers/ThemeProvider"

export default function Profile() {
    const { theme, setTheme } = useTheme()
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const { data: response, isLoading, error } = useQuery({
        queryKey: ['profile'],
        queryFn: async (): Promise<any> => await axios.get('/users/profile')
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
        } catch (err: any) {
            toast.error(err.message || "Failed to change password")
        } finally {
            setIsChangingPassword(false)
        }
    }

    if (isLoading) {
        return (
            <AppShell>
                <div className="max-w-5xl mx-auto space-y-8 pb-12 w-full">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <Skeleton className="w-20 h-20 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Info Column */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Skeleton className="h-32 w-full rounded-xl" />
                                <Skeleton className="h-32 w-full rounded-xl" />
                            </div>
                            <Skeleton className="h-96 w-full rounded-xl" />
                        </div>
                        {/* Sidebar Column */}
                        <div className="space-y-8">
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <Skeleton className="h-24 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </AppShell>
        )
    }

    if (error || !response) {
        return <AppShell><div className="flex justify-center p-8 text-red-500">Failed to load profile data.</div></AppShell>
    }

    const { user, metrics } = response as any

    return (
        <AppShell>
            <div className="w-full mx-auto space-y-8 pb-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-finance-gold flex items-center justify-center text-finance-darker shadow-lg shadow-finance-gold/20">
                            <span className="text-3xl font-bold font-heading">{user?.name?.charAt(0) || "U"}</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-heading tracking-tight leading-none">
                                {user?.name || "Unknown"}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-finance-gold" />
                                {user?.role || "USER"} Account
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-l-4 border-l-finance-gold">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Contribution</p>
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">₦ {(metrics?.totalContribution || 0).toLocaleString()}</h2>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">Confirmed payments to date</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-l-4 border-l-blue-500">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payments Made</p>
                                        <CreditCard className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{metrics?.totalPayments || 0} Records</h2>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                                        {metrics?.pendingPayments || 0} awaiting verification
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Security Section */}
                        <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800/50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-finance-gold" />
                                    Security & Access
                                </CardTitle>
                                <CardDescription>Update your password and secure your account.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 pt-6">
                                <form onSubmit={handlePasswordChange} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <PasswordInput
                                            id="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <PasswordInput
                                            id="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <PasswordInput
                                            id="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isChangingPassword}
                                        className="w-full bg-finance-gold hover:bg-finance-goldLight text-white font-bold h-11"
                                    >
                                        {isChangingPassword ? "Updating..." : "Update Password"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        {/* Personal Details Card */}
                        <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <User className="w-16 h-16" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Personal Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-2">
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Full Name</Label>
                                    <p className="text-sm font-semibold flex items-center gap-2">
                                        <User className="w-3 h-3 text-finance-gold" />
                                        {user?.name || "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Phone Number</Label>
                                    <p className="text-sm font-semibold flex items-center gap-2">
                                        <Phone className="w-3 h-3 text-finance-gold" />
                                        {user?.phone || "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Member Since</Label>
                                    <p className="text-sm font-semibold">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "N/A"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Push Notifications Card */}
                        <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800/50">
                                <CardTitle className="text-md flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-finance-gold" />
                                    Notifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-6">
                                <PushNotificationManager />
                            </CardContent>
                        </Card>

                        {/* Appearance Card */}
                        <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800/50">
                                <CardTitle className="text-md flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-finance-gold" />
                                    Appearance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-6 flex items-center justify-between">
                                <span className="text-sm font-medium">Dark Mode</span>
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                    <Button
                                        size="sm"
                                        variant={theme === 'light' ? 'default' : 'ghost'}
                                        onClick={() => setTheme('light')}
                                        className="h-8 text-[10px] font-bold uppercase px-3"
                                    >
                                        Light
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={theme === 'dark' ? 'default' : 'ghost'}
                                        onClick={() => setTheme('dark')}
                                        className="h-8 text-[10px] font-bold uppercase px-3"
                                    >
                                        Dark
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    )
}
