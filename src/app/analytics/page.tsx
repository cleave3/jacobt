
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DashboardChart } from "@/components/ui/DashboardChart";
import { TrendingUp, Building2, Wallet, Award, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import YearFilter from "./YearFilter";

export default async function AnalyticsPage(props: {
    searchParams: Promise<{ year?: string }>;
}) {
    const searchParams = await props.searchParams;
    const selectedYear = searchParams.year ? parseInt(searchParams.year) : new Date().getFullYear();

    // Fetch available years for the filter
    const availableTargets = await prisma.target.findMany({
        select: { year: true },
        orderBy: { year: 'desc' }
    });
    const availableYears = availableTargets.map(t => t.year);

    // 1. Annual Target Logic
    const target = await prisma.target.findUnique({
        where: { year: selectedYear }
    });

    const individualTarget = Number(target?.individualTarget || 0) * (target?.numOfPayments || 10)
    const membersCount = target?.numOfMembers || 6;
    const expectedTotal = individualTarget * membersCount;
    // 2. Raised Collection for the Year
    const confirmedPayments = await prisma.payment.aggregate({
        where: {
            paymentCircle: selectedYear,
            status: "CONFIRMED"
        },
        _sum: { amount: true }
    });
    const raisedTotal = Number(confirmedPayments._sum.amount || 0);
    const raisedPercentage = expectedTotal > 0 ? (raisedTotal / expectedTotal) * 100 : 0;

    // 3. Lifetime Contribution
    const lifetimePayments = await prisma.payment.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { amount: true }
    });
    const lifetimeTotal = Number(lifetimePayments._sum.amount || 0);

    // 4. Monthly Target Logic (Current Month vs Monthly Share of Target)
    // const now = new Date();
    // const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // const monthlyPayments = await prisma.payment.aggregate({
    //     where: {
    //         status: "CONFIRMED",
    //         createdAt: {
    //             gte: firstDayOfMonth,
    //             lte: lastDayOfMonth
    //         }
    //     },
    //     _sum: { amount: true }
    // });
    // const monthlyRaised = Number(monthlyPayments._sum.amount || 0);
    // const monthlyTarget = target ? individualTarget * membersCount : 0;
    // const monthlyProgress = monthlyTarget > 0 ? (monthlyRaised / monthlyTarget) * 100 : 0;

    // 5. Portfolio Growth (ROI)
    const activeAssets = await prisma.asset.aggregate({
        where: { status: "ACTIVE" },
        _sum: { currentValue: true, purchasePrice: true }
    });
    const portfolioTotal = Number(activeAssets._sum.currentValue || 0);
    const portfolioPurchase = Number(activeAssets._sum.purchasePrice || 0);
    const portfolioGain = portfolioPurchase > 0 ? ((portfolioTotal - portfolioPurchase) / portfolioPurchase) * 100 : 0;
    const assetCount = await prisma.asset.count({ where: { status: "ACTIVE" } });

    // 6. Admin Confirmation Efficiency (Ratio of CONFIRMED vs PENDING/REJECTED)
    const totalPaymentsCount = await prisma.payment.count();
    const confirmedPaymentsCount = await prisma.payment.count({ where: { status: "CONFIRMED" } });
    const confirmationRatio = totalPaymentsCount > 0 ? (confirmedPaymentsCount / totalPaymentsCount) * 100 : 0;

    // 7. Lifetime Leaderboard
    const rawLeaderboard = await prisma.payment.groupBy({
        by: ['userId'],
        where: { status: "CONFIRMED" },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
    });

    const userDetails = await prisma.user.findMany({
        where: { id: { in: rawLeaderboard.map(l => l.userId) } },
        select: { id: true, name: true }
    });


    const users = await prisma.user.findMany({
        where: { id: { notIn: rawLeaderboard.map(p => p.userId) } },
        select: { id: true, name: true }
    });

    const usersWithPayments = rawLeaderboard.map(entry => ({
        name: userDetails.find(u => u.id === entry.userId)?.name || "Unknown",
        amount: Number(entry._sum.amount || 0)
    }));

    const usersWithoutPayments = users.map(u => ({
        name: u.name,
        amount: 0
    }));

    const leaderboard = [...usersWithPayments, ...usersWithoutPayments];

    // 8. Individual Member Performance for Chart
    const members = await prisma.user.findMany({
        select: { id: true, name: true }
    });

    const performanceRaw = await prisma.payment.groupBy({
        by: ['userId'],
        where: {
            paymentCircle: selectedYear,
            status: "CONFIRMED"
        },
        _sum: { amount: true }
    });

    const chartData = members.map(m => {
        const contribution = performanceRaw.find(p => p.userId === m.id);
        return {
            name: m.name.split(' ')[0], // Use first name for chart
            total: Number(contribution?._sum.amount || 0),
            goal: individualTarget
        };
    }).sort((a, b) => b.total - a.total);

    return (
        <AppShell>
            <div className="flex flex-col gap-4 md:gap-6 pb-10">
                <header className="flex justify-between items-center mb-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
                    <YearFilter availableYears={availableYears.length > 0 ? availableYears : [selectedYear]} selectedYear={selectedYear} />
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Lifetime Contribution Card */}
                    <Card className="bg-slate-900 dark:bg-white border-none shadow-lg rounded-xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Award className="w-16 h-16 text-white dark:text-slate-900" />
                        </div>
                        <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Lifetime Contribution</p>
                            <div>
                                <h2 className="text-2xl font-bold text-white dark:text-slate-900 tracking-tight leading-none mb-1">₦ {lifetimeTotal.toLocaleString()}</h2>
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
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-1">{raisedPercentage.toFixed(1)}%</h2>
                                <p className="text-[11px] font-medium text-slate-400">Of ₦ {expectedTotal.toLocaleString()}</p>
                            </div>
                            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-finance-gold h-full transition-all duration-1000" style={{ width: `${Math.min(raisedPercentage, 100)}%` }} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Progress Card */}
                    {/* <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-xl overflow-hidden">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Month Profit</p>
                                <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <ArrowUpRight className="w-4 h-4 text-blue-500" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-1">₦ {monthlyRaised.toLocaleString()}</h2>
                                <p className="text-[11px] font-medium text-slate-400">{monthlyProgress.toFixed(1)}% of monthly target</p>
                            </div>
                            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${Math.min(monthlyProgress, 100)}%` }} />
                            </div>
                        </CardContent>
                    </Card> */}

                    {/* Portfolio Growth Card */}
                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-xl overflow-hidden">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Asset ROI</p>
                                <div className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-green-500" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-green-600 dark:text-green-500 tracking-tight leading-none mb-1">+{portfolioGain.toFixed(1)}%</h2>
                                <p className="text-[11px] font-medium text-slate-400">₦ {portfolioTotal.toLocaleString()} net value</p>
                            </div>
                            <p className="mt-3 text-[10px] font-bold text-slate-400">{assetCount} Active Properties</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance Chart */}
                    <Card className="lg:col-span-2  rounded-2xl overflow-hidden">
                        <div className="p-6 pb-2">
                            <CardTitle className="text-[16px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                Member Performance Breakdown
                            </CardTitle>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Contribution vs Yearly Target (₦ {individualTarget.toLocaleString()})</p>
                        </div>
                        <CardContent className="px-2 pt-4 pb-8">
                            <DashboardChart data={chartData} />
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-6">
                        {/* Leaderboard Card */}
                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl overflow-hidden">
                            <div className="p-6 pb-4 border-b border-slate-50 dark:border-slate-700">
                                <CardTitle className="text-[16px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Award className="w-5 h-5 text-finance-gold" /> Lifetime Hall of Fame
                                </CardTitle>
                            </div>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {leaderboard.length > 0 ? leaderboard.map((user, idx) => (
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

                        {/* Admin Confirmation Efficiency */}
                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-6">
                            <div className="flex flex-col gap-4">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admin Verification Flow</p>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-16 h-16 shrink-0">
                                        <svg className="w-16 h-16 transform -rotate-90">
                                            <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-700" />
                                            <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * confirmationRatio) / 100} strokeLinecap="round" className="text-finance-gold transition-all duration-1000" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-900 dark:text-white">
                                            {Math.round(confirmationRatio)}%
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
                                        <p className="text-lg font-black text-green-700 dark:text-green-400">{confirmedPaymentsCount}</p>
                                    </div>
                                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 font-bold text-[11px] mb-1">
                                            <AlertCircle className="w-3 h-3" /> PENDING
                                        </div>
                                        <p className="text-lg font-black text-amber-700 dark:text-amber-400">{totalPaymentsCount - confirmedPaymentsCount}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

