import prisma from '../../utils/prisma'

export class AnalyticsService {
    async getAnalytics(selectedYear: number) {
        // 1. Annual Target Logic
        const target = await prisma.target.findUnique({
            where: { year: selectedYear },
        })

        const individualTarget = Number(target?.individualTarget || 0) * (target?.numOfPayments || 10)
        const membersCount = target?.numOfMembers || 6
        const expectedTotal = individualTarget * membersCount

        // 2. Raised Collection for the Year
        const confirmedPayments = await prisma.payment.aggregate({
            where: {
                paymentCircle: selectedYear,
                status: 'CONFIRMED',
            },
            _sum: { amount: true },
        })
        const raisedTotal = Number(confirmedPayments._sum.amount || 0)
        const raisedPercentage = expectedTotal > 0 ? (raisedTotal / expectedTotal) * 100 : 0

        // 3. Lifetime Contribution
        const lifetimePayments = await prisma.payment.aggregate({
            where: { status: 'CONFIRMED' },
            _sum: { amount: true },
        })
        const lifetimeTotal = Number(lifetimePayments._sum.amount || 0)

        // 5. Portfolio Growth (ROI)
        const activeAssets = await prisma.asset.aggregate({
            where: { status: 'ACTIVE' },
            _sum: { currentValue: true, purchasePrice: true },
        })
        const portfolioTotal = Number(activeAssets._sum.currentValue || 0)
        const portfolioPurchase = Number(activeAssets._sum.purchasePrice || 0)
        const portfolioGain = portfolioPurchase > 0 ? ((portfolioTotal - portfolioPurchase) / portfolioPurchase) * 100 : 0
        const assetCount = await prisma.asset.count({ where: { status: 'ACTIVE' } })

        // 6. Admin Confirmation Efficiency
        const totalPaymentsCount = await prisma.payment.count()
        const confirmedPaymentsCount = await prisma.payment.count({ where: { status: 'CONFIRMED' } })
        const confirmationRatio = totalPaymentsCount > 0 ? (confirmedPaymentsCount / totalPaymentsCount) * 100 : 0

        // 7. Lifetime Leaderboard
        const rawLeaderboard = await prisma.payment.groupBy({
            by: ['userId'],
            where: { status: 'CONFIRMED' },
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
        })

        const userDetails = await prisma.user.findMany({
            where: { id: { in: rawLeaderboard.map((l: any) => l.userId) } },
            select: { id: true, name: true },
        })

        const users = await prisma.user.findMany({
            where: { id: { notIn: rawLeaderboard.map((p: any) => p.userId) } },
            select: { id: true, name: true },
        })

        const usersWithPayments = rawLeaderboard.map((entry: any) => ({
            name: userDetails.find((u: any) => u.id === entry.userId)?.name || 'Unknown',
            amount: Number(entry._sum.amount || 0),
        }))

        const usersWithoutPayments = users.map((u: any) => ({
            name: u.name,
            amount: 0,
        }))

        const leaderboard = [...usersWithPayments, ...usersWithoutPayments]

        // 8. Individual Member Performance for Chart
        const members = await prisma.user.findMany({
            select: { id: true, name: true },
        })

        const performanceRaw = await prisma.payment.groupBy({
            by: ['userId'],
            where: {
                paymentCircle: selectedYear,
                status: 'CONFIRMED',
            },
            _sum: { amount: true },
        })

        const chartData = members.map((m: any) => {
            const contribution = performanceRaw.find((p: any) => p.userId === m.id)
            return {
                name: m.name.split(' ')[0], // First name
                total: Number(contribution?._sum.amount || 0),
                goal: individualTarget,
            }
        }).sort((a: any, b: any) => b.total - a.total)

        return {
            totalPaymentsCount,
            confirmedPaymentsCount,
            confirmationRatio,
            lifetimeTotal,
            expectedTotal,
            raisedTotal,
            raisedPercentage,
            portfolioTotal,
            portfolioPurchase,
            portfolioGain,
            assetCount,
            leaderboard,
            chartData,
            individualTarget,
            target
        }
    }

    async getAvailableYears() {
        return prisma.target.findMany({
            select: { year: true },
            orderBy: { year: 'desc' },
        })
    }

    async upsertTarget(data: { year: number; individualTarget: number; numOfPayments: number; numOfMembers: number }) {
        return prisma.target.upsert({
            where: { year: data.year },
            create: data,
            update: {
                individualTarget: data.individualTarget,
                numOfPayments: data.numOfPayments,
                numOfMembers: data.numOfMembers,
            },
        })
    }
}
