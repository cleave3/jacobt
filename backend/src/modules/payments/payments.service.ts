import prisma from '../../utils/prisma'
import { PushService } from '../push/push.service'

const pushService = new PushService()

export interface PaymentQueryParams {
    page?: number
    limit?: number
    year?: number
    userId?: string
    status?: string
    startDate?: string
    endDate?: string
    search?: string
}

export class PaymentsService {
    async submitPayment(userId: string, data: any, role: string) {
        const targetUserId = (role === 'ADMIN' || role === 'SUPERADMIN') && data.userId ? data.userId : userId

        let parsedPaymentDate = new Date()
        if (data.paymentDate) {
            const candidateDate = new Date(data.paymentDate)
            if (!isNaN(candidateDate.getTime())) {
                parsedPaymentDate = candidateDate
            }
        }

        const payment = await prisma.payment.create({
            data: {
                userId: targetUserId,
                amount: Number(data.amount),
                paymentCircle: Number(data.paymentCircle),
                proofImage: data.proofUrl,
                status: 'PENDING',
                paymentDate: parsedPaymentDate,
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
        const updateData: any = {
            updatedById: userId,
        }

        if (data.amount !== undefined) {
            updateData.amount = Number(data.amount)
        }
        if (data.paymentCircle !== undefined) {
            updateData.paymentCircle = Number(data.paymentCircle)
        }
        if (data.status !== undefined) {
            updateData.status = data.status
        }
        if (data.rejectionReason !== undefined) {
            updateData.rejectionReason = data.rejectionReason
        }
        if (data.paymentDate !== undefined) {
            const parsedDate = new Date(data.paymentDate)
            if (!isNaN(parsedDate.getTime())) {
                updateData.paymentDate = parsedDate
            }
        }

        const payment = await prisma.payment.update({
            where: { id: paymentId },
            data: updateData,
            include: { user: true, updatedBy: true, submittedBy: true },
        })

        // Notify user about verification
        if (data.status) {
            await pushService.sendNotificationToUser(payment.userId, {
                title: `Contribution ${data.status.toLowerCase()}`,
                body: `Your payment of ₦${payment.amount} has been ${data.status.toLowerCase()}.`
            })

            await pushService.sendNotificationToUsersByRole(['ADMIN', 'SUPERADMIN'], {
                title: `Contribution ${data.status.toLowerCase()}`,
                body: `Payment of ₦${payment.amount} for ${payment.user?.name || 'a user'} has been ${data.status.toLowerCase()} by ${payment.updatedBy?.name || 'an admin'}.`
            })
        }

        return payment
    }

    async getPayments(params: PaymentQueryParams) {
        const page = Math.max(1, Number(params.page) || 1)
        const limit = Math.max(1, Math.min(100, Number(params.limit) || 10))
        const skip = (page - 1) * limit

        const whereClause = this.buildWhereClause(params)

        const [payments, total, targetRecords, paymentCircleRecords] = await Promise.all([
            prisma.payment.findMany({
                where: whereClause,
                include: {
                    user: { select: { id: true, name: true, phone: true } },
                    submittedBy: { select: { id: true, name: true } },
                    updatedBy: { select: { id: true, name: true } },
                },
                orderBy: [
                    { createdAt: 'desc' },
                ],
                skip,
                take: limit,
            }),
            prisma.payment.count({ where: whereClause }),
            prisma.target.findMany({ select: { year: true } }),
            prisma.payment.findMany({ select: { paymentCircle: true }, distinct: ['paymentCircle'] }),
        ])

        const allYears = Array.from(
            new Set([
                new Date().getFullYear(),
                ...targetRecords.map(t => t.year),
                ...paymentCircleRecords.map(p => p.paymentCircle),
            ])
        ).sort((a, b) => b - a)

        return {
            data: payments,
            availableYears: allYears,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            }
        }
    }

    async exportPayments(params: PaymentQueryParams) {
        const whereClause = this.buildWhereClause(params)

        const payments = await prisma.payment.findMany({
            where: whereClause,
            include: {
                user: true,
                submittedBy: true,
                updatedBy: true,
            },
            orderBy: [
                { paymentDate: 'desc' },
                { createdAt: 'desc' },
            ],
        })

        const headers = ['Member', 'Phone', 'Amount', 'Cycle (Year)', 'Status', 'Payment Date', 'Submission Date', 'Submitted By', 'Updated By']
        const rows = payments.map(p => [
            `"${(p.user?.name || 'Unknown').replace(/"/g, '""')}"`,
            `"${p.user?.phone || ''}"`,
            p.amount.toString(),
            p.paymentCircle.toString(),
            p.status,
            `"${new Date(p.paymentDate || p.createdAt).toISOString().split('T')[0]}"`,
            `"${new Date(p.createdAt).toISOString().split('T')[0]}"`,
            `"${(p.submittedBy?.name || 'Unknown').replace(/"/g, '""')}"`,
            `"${(p.updatedBy?.name || 'Unknown').replace(/"/g, '""')}"`,
        ])

        return [
            headers.join(','),
            ...rows.map(row => row.join(',')),
        ].join('\n')
    }

    private buildWhereClause(params: PaymentQueryParams) {
        const whereClause: any = {}

        if (params.year && !isNaN(Number(params.year))) {
            whereClause.paymentCircle = Number(params.year)
        }

        if (params.userId && params.userId !== 'ALL') {
            whereClause.userId = params.userId
        }

        if (params.status && params.status !== 'ALL') {
            whereClause.status = params.status
        }

        if (params.startDate || params.endDate) {
            whereClause.paymentDate = {}
            if (params.startDate) {
                const start = new Date(params.startDate)
                if (!isNaN(start.getTime())) {
                    start.setHours(0, 0, 0, 0)
                    whereClause.paymentDate.gte = start
                }
            }
            if (params.endDate) {
                const end = new Date(params.endDate)
                if (!isNaN(end.getTime())) {
                    end.setHours(23, 59, 59, 999)
                    whereClause.paymentDate.lte = end
                }
            }
            if (Object.keys(whereClause.paymentDate).length === 0) {
                delete whereClause.paymentDate
            }
        }

        if (params.search && params.search.trim().length > 0) {
            const query = params.search.trim()
            whereClause.user = {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query, mode: 'insensitive' } },
                ]
            }
        }

        return whereClause
    }
}
