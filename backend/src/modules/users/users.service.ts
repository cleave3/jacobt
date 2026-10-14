import prisma from '../../utils/prisma'
import bcrypt from 'bcryptjs'

export class UsersService {
    async getProfileMetrics(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                payments: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        if (!user) {
            throw new Error('User not found')
        }

        const totalContribution = user.payments
            .filter((p: any) => p.status === 'CONFIRMED')
            .reduce((sum: number, p: any) => sum + Number(p.amount), 0)

        const pendingPayments = user.payments
            .filter((p: any) => p.status === 'PENDING').length

        return {
            user: {
                name: user.name,
                phone: user.phone,
                role: user.role,
                createdAt: user.createdAt,
            },
            metrics: {
                totalContribution,
                pendingPayments,
                totalPayments: user.payments.length,
            },
        }
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) throw new Error('User not found')

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isPasswordValid) throw new Error('Incorrect current password')

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        })
    }

    async getAllUsers() {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { payments: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
    }

    async createUser(data: any) {
        const hashedPassword = await bcrypt.hash(data.password, 10)
        return prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        })
    }
}
