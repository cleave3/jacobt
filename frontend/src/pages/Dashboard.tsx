import { useState } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Clock,
    Building2,
    Settings,
    Award,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Wallet,
    ArrowUpRight,
    ShieldAlert,
    CreditCard
} from "lucide-react"
import { SubmitPaymentDialog } from "@/components/ui/SubmitPaymentDialog"
import { DashboardChart } from "@/components/ui/DashboardChart"
import { CollectionChart } from "@/components/ui/CollectionChart"
import { TargetDialog } from "@/components/ui/TargetDialog"
import { AccessControl } from "@/components/auth/AccessControl"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { axios } from "@/lib/axios"
import { useAuth } from "@/context/AuthContext"

export default function Dashboard() {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isTargetModalOpen, setIsTargetModalOpen] = useState(false)

    const { user } = useAuth()
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
                <div className="flex flex-col gap-6 w-full">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-28 rounded-xl" />
                    </div>
                    {/* Top KPI Skeletons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Skeleton className="h-28 w-full rounded-2xl" />
                        <Skeleton className="h-28 w-full rounded-2xl" />
                        <Skeleton className="h-28 w-full rounded-2xl" />
                        <Skeleton className="h-28 w-full rounded-2xl" />
                    </div>
                    {/* Mid Section Skeletons */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Skeleton className="lg:col-span-2 h-80 w-full rounded-2xl" />
                        <Skeleton className="h-80 w-full rounded-2xl" />
                    </div>
                    {/* Bottom Section Skeletons */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Skeleton className="h-72 w-full rounded-2xl" />
                        <Skeleton className="h-72 w-full rounded-2xl" />
                    </div>
                </div>
            </AppShell>
        )
    }

    if (error || !response?.success) {
        return (
            <AppShell>
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#1e293b] rounded-2xl border border-red-100 dark:border-red-900/30">
                    <p className="text-red-500 font-bold mb-2">Failed to load dashboard analytics.</p>
                    <p className="text-sm text-slate-500 mb-4">{error?.message || "Please check your network connection and try again."}</p>
                    <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                        Retry
                    </Button>
                </div>
            </AppShell>
        )
    }

    const rawData = response.data
    const availableYears: number[] = response.availableYears || []
    const selectedYear: number = response.selectedYear

    const metrics = {
        expectedTotal: rawData.expectedTotal || 0,
        membersCount: rawData.chartData?.length || 0,
        raisedTotal: rawData.raisedTotal || 0,
        raisedPercentage: Number(rawData.raisedPercentage || 0).toFixed(1),
        portfolioTotal: rawData.portfolioTotal || 0,
        portfolioGain: Number(rawData.portfolioGain || 0).toFixed(1),
        pendingCount: (rawData.totalPaymentsCount || 0) - (rawData.confirmedPaymentsCount || 0),
        assetCount: rawData.assetCount || 0,
        memberPerformance: rawData.chartData || [],
        target: rawData.target,
        lifetimeTotal: rawData.lifetimeTotal || 0,
        confirmationRatio: rawData.confirmationRatio || 0,
        confirmedPaymentsCount: rawData.confirmedPaymentsCount || 0,
        totalPaymentsCount: rawData.totalPaymentsCount || 0,
        leaderboard: rawData.leaderboard || [],
        individualTarget: rawData.individualTarget || 0,
    }

    const isAdmin = ["ADMIN", "SUPERADMIN"].includes(user?.role || "")

    // Current logged-in user's contribution for this year
    const currentUserPerformance = metrics.memberPerformance.find(
        (m: any) => m.name && user?.name && user.name.toLowerCase().includes(m.name.toLowerCase())
    )

    const handleYearChange = (year: number) => {
        navigate(`/?year=${year}`)
    }

    return (
        <AppShell>
            {/* Header / Year Selector / Actions */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Financial Overview
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Performance metrics & portfolio summary for cycle <strong className="text-slate-700 dark:text-slate-300">{selectedYear}</strong>
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <AccessControl permittedRoles={["SUPERADMIN"]}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsTargetModalOpen(true)}
                            className="text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 hover:text-finance-gold flex items-center gap-1.5"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Manage Target</span>
                        </Button>
                    </AccessControl>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                            Year:
                        </span>
                        <select
                            value={selectedYear}
                            onChange={(e) => handleYearChange(Number(e.target.value))}
                            aria-label="Select Financial Cycle Year"
                            className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-finance-gold shadow-sm"
                        >
                            {availableYears.map((year) => (
                                <option key={year} value={year}>
                                    {year} Cycle
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="bg-finance-gold hover:bg-finance-goldLight text-white rounded-xl text-xs font-bold h-9 px-3.5 shadow-sm hidden sm:flex items-center gap-1.5 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Payment</span>
                    </Button>
                </div>
            </header>

            <TargetDialog
                isOpen={isTargetModalOpen}
                onClose={() => setIsTargetModalOpen(false)}
                initialData={metrics.target}
            />

            <div className="flex flex-col gap-6">
                {/* 1. TOP EXECUTIVE 4-KPI BAR (ZERO DUPLICATES) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Card 1: Cycle Collection */}
                    <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {selectedYear} Collection
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                                ₦ {metrics.raisedTotal.toLocaleString()}
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                                <span>{metrics.raisedPercentage}% of goal</span>
                                <span className="font-mono">Goal: ₦{metrics.expectedTotal.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(100, Number(metrics.raisedPercentage))}%` }}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Card 2: Real Estate Portfolio */}
                    <Card
                        onClick={() => navigate('/properties')}
                        className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Asset Portfolio
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-finance-gold/10 text-finance-gold flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Building2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight flex items-baseline justify-between">
                                <span>₦ {metrics.portfolioTotal.toLocaleString()}</span>
                                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-finance-gold transition-colors" />
                            </div>
                            <div className="flex items-center justify-between text-xs mt-2">
                                <span className="text-slate-500 dark:text-slate-400">{metrics.assetCount} properties</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                    <TrendingUp className="w-3 h-3" /> +{metrics.portfolioGain}% avg
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Card 3: Pending Verification (Actionable) */}
                    <Card
                        onClick={() => navigate('/payments?status=PENDING')}
                        className={`border shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group ${
                            metrics.pendingCount > 0
                                ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20'
                                : 'bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${metrics.pendingCount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                Pending Review
                            </span>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${metrics.pendingCount > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight flex items-baseline justify-between">
                                <span>{metrics.pendingCount}</span>
                                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                {metrics.pendingCount > 0 ? "Awaiting admin confirmation · Review" : "All submissions verified"}
                            </p>
                        </div>
                    </Card>
                </div>

                {/* 2. YEAR CAMPAIGN ANALYSIS (CHART + CONSOLIDATED RADIAL) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Member Performance Breakdown (2 cols) */}
                    <Card className="lg:col-span-2 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                                    Member Performance Breakdown — {selectedYear}
                                </CardTitle>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Actual contribution vs. Individual Quota (₦ {metrics.individualTarget.toLocaleString()})
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Goal Met
                                </span>
                                <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                                    <span className="w-2.5 h-2.5 rounded-full bg-finance-gold inline-block" /> In Progress
                                </span>
                            </div>
                        </div>

                        {metrics.memberPerformance && metrics.memberPerformance.length > 0 ? (
                            <DashboardChart data={metrics.memberPerformance} />
                        ) : (
                            <div className="h-60 flex flex-col items-center justify-center text-slate-400 text-sm">
                                <p>No member performance data recorded for {selectedYear}.</p>
                            </div>
                        )}
                    </Card>

                    {/* Right: Consolidated Annual Target Radial Gauge (1 col) */}
                    <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
                        <div className="mb-2">
                            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                                Annual Target Progress
                            </CardTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Overall collection pace for {selectedYear}
                            </p>
                        </div>

                        <CollectionChart
                            raisedTotal={metrics.raisedTotal}
                            expectedTotal={metrics.expectedTotal}
                            raisedPercentage={metrics.raisedPercentage}
                        />
                    </Card>
                </div>

                {/* 3. BOTTOM SECTION: ALL-TIME LEADERBOARD & ROLE-AWARE ACTIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: All-Time Leaderboard */}
                    <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-finance-gold/15 text-finance-gold flex items-center justify-center">
                                    <Award className="w-4 h-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                                        All-Time Member Rankings
                                    </CardTitle>
                                    <p className="text-xs text-slate-400">
                                        Cumulative club contributions across all cycles
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                                ₦ {metrics.lifetimeTotal.toLocaleString()} Total
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[340px] overflow-y-auto pr-1">
                            {metrics.leaderboard && metrics.leaderboard.length > 0 ? (
                                metrics.leaderboard.map((item: any, idx: number) => {
                                    const sharePct = metrics.lifetimeTotal > 0
                                        ? ((item.amount / metrics.lifetimeTotal) * 100).toFixed(1)
                                        : '0'

                                    const isTop3 = idx < 3
                                    const badgeStyles = [
                                        "bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30", // 1st Gold
                                        "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200", // 2nd Silver
                                        "bg-amber-700/15 text-amber-800 dark:text-amber-300", // 3rd Bronze
                                    ]

                                    return (
                                        <div
                                            key={idx}
                                            className="py-3 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                                        isTop3
                                                            ? badgeStyles[idx]
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                    }`}
                                                >
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 font-medium">
                                                        {sharePct}% of club total
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                                                    ₦ {item.amount.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="py-8 text-center text-sm text-slate-400">No confirmed payments recorded.</p>
                            )}
                        </div>
                    </Card>

                    {/* Right: Role-Aware Verification & Activity Panel */}
                    <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
                        {isAdmin ? (
                            // ADMIN / SUPERADMIN VIEW: Verification pipeline
                            <div className="flex flex-col gap-5 h-full justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                            <ShieldAlert className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                                                Verification Pipeline
                                            </CardTitle>
                                            <p className="text-xs text-slate-400">
                                                Administrative review & submission flow
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                                            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> CONFIRMED
                                            </div>
                                            <p className="text-2xl font-mono font-bold text-emerald-800 dark:text-emerald-300">
                                                {metrics.confirmedPaymentsCount}
                                            </p>
                                            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                                                Verified contributions
                                            </p>
                                        </div>

                                        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                                            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs mb-1">
                                                <AlertCircle className="w-3.5 h-3.5" /> PENDING
                                            </div>
                                            <p className="text-2xl font-mono font-bold text-amber-800 dark:text-amber-300">
                                                {metrics.pendingCount}
                                            </p>
                                            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">
                                                Awaiting review
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Overall Verification Ratio:</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {Math.round(metrics.confirmationRatio)}% processed
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                    <Button
                                        onClick={() => navigate('/payments?status=PENDING')}
                                        className="flex-1 bg-finance-gold hover:bg-finance-goldLight text-white rounded-xl text-xs font-bold h-10 shadow-sm"
                                    >
                                        Review Submissions ({metrics.pendingCount})
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/payments')}
                                        className="rounded-xl text-xs font-semibold h-10"
                                    >
                                        All Payments
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // REGULAR MEMBER VIEW: Personal Status & Quick Action
                            <div className="flex flex-col gap-5 h-full justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-xl bg-finance-gold/15 text-finance-gold flex items-center justify-center">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                                                Your {selectedYear} Progress
                                            </CardTitle>
                                            <p className="text-xs text-slate-400">
                                                Status against your annual contribution target
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 mt-4">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="text-xs text-slate-500 font-medium">Contributed:</span>
                                            <span className="text-xl font-mono font-bold text-slate-900 dark:text-white">
                                                ₦ {(currentUserPerformance?.total || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-baseline text-xs text-slate-400">
                                            <span>Yearly Quota:</span>
                                            <span>₦ {metrics.individualTarget.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                                            <div
                                                className="bg-finance-gold h-full rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        ((currentUserPerformance?.total || 0) / (metrics.individualTarget || 1)) * 100
                                                    )}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <Button
                                        onClick={() => setIsPaymentModalOpen(true)}
                                        className="w-full bg-finance-gold hover:bg-finance-goldLight text-white rounded-xl text-xs font-bold h-10 shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Submit Payment for {selectedYear}</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Mobile floating payment button */}
            <Button
                onClick={() => setIsPaymentModalOpen(true)}
                aria-label="Add payment"
                className="sm:hidden fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg shadow-finance-gold/30 flex items-center justify-center z-50 bg-finance-gold hover:bg-finance-gold/90 text-white"
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

