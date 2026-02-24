import { useState } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Clock, Building2, Users, Settings, Award, TrendingUp, Wallet, CheckCircle2, AlertCircle } from "lucide-react"
import { SubmitPaymentDialog } from "@/components/ui/SubmitPaymentDialog"
import { DashboardChart } from "@/components/ui/DashboardChart"
import { CollectionChart } from "@/components/ui/CollectionChart"
import { TargetDialog } from "@/components/ui/TargetDialog"
import { AccessControl } from "@/components/auth/AccessControl"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { axios } from "@/lib/axios"

export default function Dashboard() {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isTargetModalOpen, setIsTargetModalOpen] = useState(false)

    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const yearParam = searchParams.get("year")

    const { data: response, isLoading, error } = useQuery({
        queryKey: ['analytics', yearParam],
        queryFn: async (): Promise<any> => {
            const url = yearParam ? `/analytics?year=${yearParam}` : '/analytics'
            return await axios.get(url)
        }
    })

    if (isLoading) {
        return (
            <AppShell>
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex justify-between items-center mb-4">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-10 w-24 rounded-md" />
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Skeleton className="lg:col-span-2 h-72 w-full rounded-xl" />
                            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                                <Skeleton className="h-32 w-full rounded-xl" />
                                <Skeleton className="h-32 w-full rounded-xl" />
                                <Skeleton className="h-32 w-full rounded-xl" />
                            </div>
                        </div>
                        <Skeleton className="h-80 w-full rounded-xl mt-2" />
                    </div>
                </div>
            </AppShell>
        )
    }

    if (error || !response?.success) {
        return <AppShell><div className="flex justify-center p-8 text-red-500">Failed to load dashboard data.</div></AppShell>
    }

    const rawData = response.data
    const availableYears: number[] = response.availableYears || []
    const selectedYear: number = response.selectedYear

    const metrics = {
        expectedTotal: rawData.expectedTotal,
        membersCount: rawData.chartData?.length || 0,
        raisedTotal: rawData.raisedTotal,
        raisedPercentage: Number(rawData.raisedPercentage || 0).toFixed(1),
        portfolioTotal: rawData.portfolioTotal,
        portfolioGain: Number(rawData.portfolioGain || 0).toFixed(1),
        pendingCount: (rawData.totalPaymentsCount || 0) - (rawData.confirmedPaymentsCount || 0),
        assetCount: rawData.assetCount,
        memberPerformance: rawData.chartData || [],
        target: rawData.target,
        lifetimeTotal: rawData.lifetimeTotal || 0,
        confirmationRatio: rawData.confirmationRatio || 0,
        confirmedPaymentsCount: rawData.confirmedPaymentsCount || 0,
        totalPaymentsCount: rawData.totalPaymentsCount || 0,
        leaderboard: rawData.leaderboard || [],
        individualTarget: rawData.individualTarget || 0,
    }

    const handleYearChange = (year: number) => {
        navigate(`/?year=${year}`)
    }

    return (
        <AppShell>
            <div className="flex justify-between items-center mb-4">
                <AccessControl permittedRoles={["SUPERADMIN"]}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsTargetModalOpen(true)}
                        className="text-slate-500 hover:text-finance-gold flex items-center gap-2 font-bold"
                    >
                        <Settings className="w-4 h-4" />
                        <span>Manage Target</span>
                    </Button>
                </AccessControl>
                <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(Number(e.target.value))}
                    className="border border-slate-200 dark:border-slate-800 rounded-md p-2 bg-white dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-finance-gold"
                >
                    {availableYears.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            <TargetDialog
                isOpen={isTargetModalOpen}
                onClose={() => setIsTargetModalOpen(false)}
                initialData={metrics.target}
            />

            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Lifetime Contribution Card */}
                    <Card className="bg-slate-900 dark:bg-white border-none shadow-lg rounded-xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Award className="w-16 h-16 text-white dark:text-slate-900" />
                        </div>
                        <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Total Contributions</p>
                            <div>
                                <h2 className="text-2xl font-bold text-white dark:text-slate-900 tracking-tight leading-none mb-1">₦ {metrics.lifetimeTotal.toLocaleString()}</h2>
                                <p className="text-[11px] font-medium text-finance-gold flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> All-time total
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Annual Target Card */}
                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-xl overflow-hidden">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{selectedYear} Target Rate</p>
                                <div className="w-7 h-7 rounded-full bg-finance-gold/10 flex items-center justify-center">
                                    <Wallet className="w-4 h-4 text-finance-gold" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-1">{metrics.raisedPercentage}%</h2>
                                <p className="text-[11px] font-medium text-slate-400">Of ₦ {metrics.expectedTotal.toLocaleString()}</p>
                            </div>
                            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-finance-gold h-full transition-all duration-1000" style={{ width: `${Math.min(Number(metrics.raisedPercentage), 100)}%` }} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Collection Progress Chart - Prominent */}
                    <Card className="lg:col-span-2 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden self-stretch">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[14px] font-bold text-slate-500 dark:text-white/70 uppercase tracking-wider leading-none">
                                Collection Progress for {selectedYear}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-6">
                            <CollectionChart
                                raisedTotal={metrics.raisedTotal}
                                expectedTotal={metrics.expectedTotal}
                                raisedPercentage={metrics.raisedPercentage}
                            />
                        </CardContent>
                    </Card>

                    {/* Smaller Metrics Grid next to chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                        {/* 4. Pending */}
                        <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm flex flex-col rounded-xl overflow-hidden self-stretch">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 w-full">
                                <CardDescription className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider truncate">
                                    Pending
                                </CardDescription>
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                                    <Clock className="w-4 h-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                                <CardTitle className="text-lg sm:text-xl mb-1 text-slate-800 dark:text-white tracking-tight truncate leading-tight">
                                    {metrics.pendingCount}
                                </CardTitle>
                                <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-wide truncate">Awaiting review</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm flex flex-col rounded-xl overflow-hidden self-stretch">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 w-full">
                                <CardDescription className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider truncate">
                                    Properties
                                </CardDescription>
                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                    <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                                <CardTitle className="text-lg sm:text-xl mb-1 text-slate-800 dark:text-white tracking-tight truncate leading-tight">
                                    ₦ {metrics.portfolioTotal.toLocaleString()}
                                </CardTitle>
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-wide truncate">
                                        {metrics.assetCount} properties
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-[#2cd48b] font-semibold tracking-wide truncate">
                                        ↑ {metrics.portfolioGain}% avg
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 6. Active Members */}
                        <Card className="bg-[#029455] text-white border-transparent shadow-sm flex flex-col rounded-xl overflow-hidden self-stretch">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10 w-full">
                                <CardDescription className="text-white/90 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider truncate">
                                    Active Members
                                </CardDescription>
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                    <Users className="w-4 h-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 flex-1 flex flex-col justify-end">
                                <CardTitle className="text-lg sm:text-xl mb-1 tracking-tight truncate leading-tight">
                                    {metrics.membersCount}
                                </CardTitle>
                                <p className="text-[10px] sm:text-xs text-white/90 font-medium tracking-wide truncate">Contributing</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
                    {/* Performance Chart */}
                    <div className="lg:col-span-2">
                        <Card className="rounded-2xl overflow-hidden mb-5">
                            <div className="p-6 pb-2">
                                <CardTitle className="text-[16px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    Member Performance Breakdown - {selectedYear}
                                </CardTitle>
                                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Contribution vs Yearly Target (₦ {metrics.individualTarget.toLocaleString()})</p>
                            </div>
                            <CardContent className="px-2 pt-4 pb-8">
                                {metrics.memberPerformance && metrics.memberPerformance.length > 0 ? (
                                    <DashboardChart data={metrics.memberPerformance} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                        No performance data available
                                    </div>
                                )}
                            </CardContent>

                        </Card>

                        {/* Admin Confirmation Efficiency */}
                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-6">
                            <div className="flex flex-col gap-4">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admin Verification Flow</p>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-16 h-16 shrink-0">
                                        <svg className="w-16 h-16 transform -rotate-90">
                                            <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-700" />
                                            <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * metrics.confirmationRatio) / 100} strokeLinecap="round" className="text-finance-gold transition-all duration-1000" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-900 dark:text-white">
                                            {Math.round(metrics.confirmationRatio)}%
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-slate-900 dark:text-white">Confirmation Rate</p>
                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Ratio of verified uploads to total submissions.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-100 dark:border-green-500/20">
                                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500 font-bold text-[11px] mb-1">
                                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                                        </div>
                                        <p className="text-lg font-black text-green-700 dark:text-green-400">{metrics.confirmedPaymentsCount}</p>
                                    </div>
                                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 font-bold text-[11px] mb-1">
                                            <AlertCircle className="w-3 h-3" /> PENDING
                                        </div>
                                        <p className="text-lg font-black text-amber-700 dark:text-amber-400">{metrics.totalPaymentsCount - metrics.confirmedPaymentsCount}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Leaderboard Card */}
                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl overflow-hidden h-full">
                            <div className="p-6 pb-4 border-b border-slate-50 dark:border-slate-700">
                                <CardTitle className="text-[16px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Award className="w-5 h-5 text-finance-gold" /> Members total contributions (All Time)
                                </CardTitle>
                            </div>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {metrics.leaderboard && metrics.leaderboard.length > 0 ? metrics.leaderboard.map((user: any, idx: number) => (
                                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-slate-300 text-slate-700`}>
                                                    {idx + 1}
                                                </div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                                            </div>
                                            <p className="text-sm font-black text-slate-900 dark:text-slate-100">₦ {user.amount.toLocaleString()}</p>
                                        </div>
                                    )) : (
                                        <p className="p-8 text-center text-sm text-slate-400 font-medium">No confirmed payments yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Button
                onClick={() => setIsPaymentModalOpen(true)}
                className="md:hidden fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg shadow-finance-gold/30 flex items-center justify-center z-50 bg-finance-gold hover:bg-finance-gold/90 text-white"
            >
                <Plus className="w-6 h-6" />
            </Button>

            <SubmitPaymentDialog
                key={isPaymentModalOpen ? "open" : "closed"}
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
            />
        </AppShell>
    )
}
