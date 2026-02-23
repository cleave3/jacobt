
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
export default async function Dashboard({
    searchParams
}: {
    searchParams: Promise<{ year?: string }>
}) {
    // 0. Year Logic - Derive from URL or default to current year
    const sp = await searchParams;
    const availableYearsData = await prisma.target.findMany({
        select: { year: true },
        orderBy: { year: 'desc' }
    });
    const availableYears = availableYearsData.map(t => t.year);
    const defaultYear = new Date().getFullYear();
    const selectedYear = sp.year ? parseInt(sp.year) : defaultYear;
    const currentYear = selectedYear;

    // 1. Expected Collection (Target per Member * Total Members)
    const target = await prisma.target.findUnique({
        where: { year: currentYear }
    });

    const individualTarget = Number(target?.individualTarget || 0);
    const expectedTotal = individualTarget * (target?.numOfPayments || 1) * (target?.numOfMembers || 6);

    // 2. Raised Collection (Sum of CONFIRMED payments for the year)
    const confirmedPayments = await prisma.payment.aggregate({
        where: {
            paymentCircle: currentYear,
            status: "CONFIRMED"
        },
        _sum: { amount: true }
    });
    const raisedTotal = Number(confirmedPayments._sum.amount || 0);
    const raisedPercentage = expectedTotal > 0 ? (raisedTotal / expectedTotal) * 100 : 0;

    // 3. Portfolio Total (Sum of ACTIVE assets' currentValue)
    const activeAssets = await prisma.asset.aggregate({
        where: { status: "ACTIVE" },
        _sum: { currentValue: true, purchasePrice: true }
    });

    const portfolioTotal = Number(activeAssets._sum.currentValue || 0);
    const portfolioPurchase = Number(activeAssets._sum.purchasePrice || 0);
    const portfolioGain = portfolioPurchase > 0 ? ((portfolioTotal - portfolioPurchase) / portfolioPurchase) * 100 : 0;

    // 4. Pending Payments Count
    const pendingCount = await prisma.payment.count({
        where: { status: "PENDING" }
    });

    const assetCount = await prisma.asset.count({ where: { status: "ACTIVE" } });


    // 5. Member Performance Data
    const users = await prisma.user.findMany({
        orderBy: { name: 'asc' }
    });

    const memberPerformance = await Promise.all(users.map(async (user) => {
        const userPayments = await prisma.payment.aggregate({
            where: {
                userId: user.id,
                paymentCircle: currentYear,
                status: "CONFIRMED"
            },
            _sum: { amount: true }
        });

        const contribution = Number(userPayments._sum.amount || 0);
        const goal = individualTarget * (target?.numOfPayments || 10);

        return {
            name: user?.name?.split?.(" ")?.[0],
            total: contribution,
            goal: goal
        };
    }));


    const metrics = {
        expectedTotal,
        membersCount: target?.numOfMembers || 6,
        assetCount,
        raisedTotal,
        raisedPercentage: raisedPercentage.toFixed(1),
        portfolioTotal,
        portfolioGain: portfolioGain.toFixed(1),
        pendingCount,
        selectedYear,
        availableYears,
        memberPerformance,
        target: target ? {
            year: target.year,
            individualTarget: Number(target.individualTarget),
            numOfPayments: target.numOfPayments,
            numOfMembers: target.numOfMembers
        } : null
    };

    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Dashboard Data...</div>}>
            <DashboardClient metrics={metrics} />
        </Suspense>
    );
}
