"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Building2, Users, Settings } from "lucide-react";
import { SubmitPaymentDialog } from "@/components/ui/SubmitPaymentDialog";
import { DashboardChart } from "@/components/ui/DashboardChart";

import { useRouter, usePathname } from "next/navigation";
import { CollectionChart } from "@/components/ui/CollectionChart";
import { TargetDialog } from "@/components/ui/TargetDialog";
import { AccessControl } from "@/components/auth/AccessControl";

interface DashboardMetrics {
    expectedTotal: number;
    membersCount: number;
    raisedTotal: number;
    raisedPercentage: string;
    portfolioTotal: number;
    portfolioGain: string;
    pendingCount: number;
    assetCount: number;
    selectedYear: number;
    availableYears: number[];
    memberPerformance: { name: string, total: number, goal: number }[];
    target: { year: number, individualTarget: number, numOfPayments: number; numOfMembers: number } | null;
}

export default function DashboardClient({ metrics }: { metrics: DashboardMetrics }) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleYearChange = (year: number) => {
        const params = new URLSearchParams();
        params.set('year', year.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

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
                    value={metrics.selectedYear}
                    onChange={(e) => handleYearChange(Number(e.target.value))}
                    className="border border-slate-200 dark:border-slate-800 rounded-md p-2 bg-white dark:bg-slate-900 text-sm font-medium"
                >
                    {metrics.availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            <TargetDialog
                isOpen={isTargetModalOpen}
                onClose={() => setIsTargetModalOpen(false)}
                initialData={metrics.target || { year: metrics.selectedYear, individualTarget: 0, numOfPayments: 10, numOfMembers: 6 }}
            />
            <div className="flex flex-col gap-6">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Collection Progress Chart - Prominent */}
                    <Card className="lg:col-span-2 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden self-stretch">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[14px] font-bold text-slate-500 dark:text-white/70 uppercase tracking-wider leading-none">Collection Progress</CardTitle>
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
                                <CardDescription className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider truncate">Pending</CardDescription>
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                                    <Clock className="w-4 h-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                                <CardTitle className="text-lg sm:text-xl mb-1 text-slate-800 dark:text-white tracking-tight truncate leading-tight">{metrics.pendingCount}</CardTitle>
                                <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-wide truncate">Awaiting review</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm flex flex-col rounded-xl overflow-hidden self-stretch">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 w-full">
                                <CardDescription className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider truncate">Properties</CardDescription>
                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                    <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                                <CardTitle className="text-lg sm:text-xl mb-1 text-slate-800 dark:text-white tracking-tight truncate leading-tight">₦ {metrics?.portfolioTotal.toLocaleString()}</CardTitle>
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-wide truncate">{metrics?.assetCount} properties</p>
                                    <p className="text-[10px] sm:text-xs text-[#2cd48b] font-semibold tracking-wide truncate">↑ {metrics.portfolioGain}% avg</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 6. Active Members */}
                        <Card className="bg-[#029455] text-white border-transparent shadow-sm flex flex-col rounded-xl overflow-hidden self-stretch">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10 w-full">
                                <CardDescription className="text-white/90 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider truncate">Active Members</CardDescription>
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                    <Users className="w-4 h-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 flex-1 flex flex-col justify-end">
                                <CardTitle className="text-lg sm:text-xl mb-1 tracking-tight truncate leading-tight">{metrics?.membersCount}</CardTitle>
                                <p className="text-[10px] sm:text-xs text-white/90 font-medium tracking-wide truncate">Contributing</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>



                <div className="flex flex-col gap-6 mt-2">
                    <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-[16px] font-bold text-slate-800 dark:text-white tracking-tight">Member Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-auto w-full">
                                {metrics.memberPerformance && metrics.memberPerformance.length > 0 ? (
                                    <DashboardChart data={metrics.memberPerformance} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                        No performance data available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Button
                onClick={() => setIsPaymentModalOpen(true)}
                className="md:hidden fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg shadow-finance-gold/30 flex items-center justify-center z-50 bg-finance-gold hover:bg-finance-gold/90 text-white"
            >
                <Plus className="w-6 h-6" />
            </Button>

            <SubmitPaymentDialog
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
            />
        </AppShell>
    );
}
