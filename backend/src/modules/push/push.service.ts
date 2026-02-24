import webPush from 'web-push'
import prisma from '../../utils/prisma'
import { env } from '../../config/env'

webPush.setVapidDetails(
    env.vapidSubject,
    env.vapidPublicKey,
    env.vapidPrivateKey
)

export class PushService {
    async subscribe(userId: string, subscription: any) {
        // Check if subscription already exists for this user/endpoint
        const existing = await prisma.pushSubscription.findUnique({
            where: { endpoint: subscription.endpoint }
        })

        if (existing) {
            // Update its userId just in case
            return prisma.pushSubscription.update({
                where: { id: existing.id },
                data: {
                    userId,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                }
            })
        }

        return prisma.pushSubscription.create({
            data: {
                userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            }
        })
    }

    async unsubscribe(userId: string, endpoint?: string) {
        if (endpoint) {
            await prisma.pushSubscription.deleteMany({
                where: { userId, endpoint }
            })
        } else {
            await prisma.pushSubscription.deleteMany({
                where: { userId }
            })
        }
    }

    async sendNotificationToUser(userId: string, payload: any) {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId }
        })

        const stringPayload = JSON.stringify(payload)

        const promises = subscriptions.map(async (sub) => {
            const pushSub = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            }
            try {
                await webPush.sendNotification(pushSub, stringPayload)
            } catch (err: any) {
                // If subscription has gone away (status 404 or 410)
                if (err.statusCode === 404 || err.statusCode === 410) {
                    await prisma.pushSubscription.delete({ where: { id: sub.id } })
                } else {
                    console.error('Error sending push notification', err)
                }
            }
        })

        await Promise.all(promises)
    }

    async sendNotificationToUsersByRole(roles: string[], payload: any) {
        const users = await prisma.user.findMany({
            where: { role: { in: roles as any } },
            select: { id: true }
        })

        for (const u of users) {
            await this.sendNotificationToUser(u.id, payload)
        }
    }
}
