import prisma from '../../utils/prisma'
import { PushService } from '../push/push.service'

const pushService = new PushService()

export class PaymentsService {
    async submitPayment(userId: string, data: any, role: string) {
        const targetUserId = (role === 'ADMIN' || role === 'SUPERADMIN') && data.userId ? data.userId : userId

        const payment = await prisma.payment.create({
            data: {
                userId: targetUserId,
                amount: data.amount,
                paymentCircle: data.paymentCircle,
                proofImage: data.proofUrl,
                status: 'PENDING',
                submittedById: userId,
            },
            include: { user: true },
        })

        // Connect push notifications
        // Notify admins that there is a new pending payment to review
        if (payment.status === 'PENDING') {
            await pushService.sendNotificationToUsersByRole(['ADMIN', 'SUPERADMIN'], {
                title: 'New Contribution to Check!',
                body: `${payment.user?.name || 'A user'} just submitted a payment of ₦${payment.amount} for review.`
            })
        }

        return payment
    }

    async updatePayment(paymentId: string, data: any, userId: string) {
        const payment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                ...data,
                amount: data.amount !== undefined ? Number(data.amount) : undefined,
                updatedById: userId,
            },
            include: { user: true },
        })

        // Notify user about verification
        if (data.status) {
            await pushService.sendNotificationToUser(payment.userId, {
                title: `Contribution ${data.status.toLowerCase()}`,
                body: `Your payment of ₦${payment.amount} has been ${data.status.toLowerCase()}.`
            })
        }

        return payment
    }

    async getPayments(page: number, limit: number, year?: number) {
        const whereClause: any = {}

        if (year) {
            whereClause.paymentCircle = year
        }

        const skip = (page - 1) * limit

        const [payments, total, paymentCircles] = await Promise.all([
            prisma.payment.findMany({
                where: whereClause,
                include: { user: { select: { id: true, name: true } }, submittedBy: { select: { id: true, name: true } }, updatedBy: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.payment.count({ where: whereClause }),
            prisma.target.findMany({ select: { year: true } })
        ])

        return {
            data: payments,
            availableYears: paymentCircles.map((p) => p.year),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        }
    }

    async exportPayments(year: number) {
        const payments = await prisma.payment.findMany({
            where: { paymentCircle: year },
            include: { user: true, submittedBy: true, updatedBy: true },
            orderBy: { createdAt: 'desc' },
        })

        const headers = ['Member', 'Amount', 'Year', 'Status', 'Date', 'Submitted By', 'Updated By']
        const rows = payments.map(p => [
            p.user?.name || 'Unknown',
            p.amount.toString(),
            p.paymentCircle.toString(),
            p.status,
            p.createdAt.toLocaleDateString(),
            p.submittedBy?.name || 'Unknown',
            p.updatedBy?.name || 'Unknown',
        ])

        return [
            headers.join(','),
            ...rows.map(row => row.join(',')),
        ].join('\n')
    }
}
