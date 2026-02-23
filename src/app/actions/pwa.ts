'use server'

import webpush from 'web-push'
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

webpush.setVapidDetails(
    process.env.VAPID_CONTACT || 'mailto:admin@jacobt.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeUser(sub: any) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.pushSubscription.upsert({
            where: { endpoint: sub.endpoint },
            update: {
                userId: session.user.id,
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
            },
            create: {
                userId: session.user.id,
                endpoint: sub.endpoint,
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
            },
        });
        return { success: true };
    } catch (error) {
        console.error("Error saving subscription:", error);
        return { success: false, error: "Failed to save subscription" };
    }
}

export async function unsubscribeUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        // We'd ideally want to delete specific endpoint if we had it, 
        // but for now delete all for this user or handle via endpoint if possible.
        // Simplified: delete all for user during unsubscribe
        await prisma.pushSubscription.deleteMany({
            where: { userId: session.user.id }
        });
        return { success: true };
    } catch (error) {
        console.error("Error unsubscribing:", error);
        return { success: false, error: "Failed to unsubscribe" };
    }
}

export async function broadcastNotification(title: string, body: string, icon = '/icon-192x192.png') {
    const subscriptions = await prisma.pushSubscription.findMany();

    const notifications = subscriptions.map(async (sub) => {
        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                },
                JSON.stringify({ title, body, icon })
            );
        } catch (error: any) {
            if (error.statusCode === 410 || error.statusCode === 404) {
                // Subscription has expired or is no longer valid
                await prisma.pushSubscription.delete({ where: { id: sub.id } });
            } else {
                console.error("Error sending notification:", error);
            }
        }
    });

    await Promise.all(notifications);
}

export async function notifyUser(userId: string, title: string, body: string, icon = '/icon-192x192.png') {
    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
    });

    const notifications = subscriptions.map(async (sub) => {
        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                },
                JSON.stringify({ title, body, icon })
            );
        } catch (error: any) {
            if (error.statusCode === 410 || error.statusCode === 404) {
                await prisma.pushSubscription.delete({ where: { id: sub.id } });
            } else {
                console.error("Error sending notification:", error);
            }
        }
    });

    await Promise.all(notifications);
}

export async function sendNotification(message: string, subscription: any) {
    try {
        await webpush.sendNotification(
            subscription,
            JSON.stringify({
                title: 'Jacobt Notification',
                body: message,
                icon: '/icon-192x192.png',
            })
        )
        return { success: true }
    } catch (error) {
        console.error('Error sending push notification:', error)
        return { success: false, error: 'Failed to send notification' }
    }
}
