import { useState, useEffect } from 'react'
import { axios } from '@/lib/axios';
import { BellOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(null)

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            registerServiceWorker()
        }
    }, [])

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
        })
        const sub = await registration.pushManager.getSubscription()
        setSubscription(sub)
    }

    async function subscribeToPush() {
        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                import.meta.env.VITE_VAPID_PUBLIC_KEY || "dummy"
            ),
        })
        setSubscription(sub)
        const serializedSub = JSON.parse(JSON.stringify(sub))
        try {
            await axios.post('/push/subscribe', serializedSub)
        } catch (e) {
            console.error("Failed to subscribe on server", e);
        }
    }

    async function unsubscribeFromPush() {
        if (!subscription) return;
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe()
        setSubscription(null)
        try {
            await axios.post('/push/unsubscribe', { endpoint })
        } catch (e) {
            console.error("Failed to unsubscribe on server", e);
        }
    }

    async function sendTestNotification() {
        if (subscription) {
            try {
                await axios.post('/push/test', {});
            } catch (e) {
                console.error("Failed to send test notification", e);
            }
        }
    }

    if (!isSupported) {
        return null; // Or show a silent fallback
    }

    return (
        <div className="space-y-4">
            {subscription ? (
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        You are currently subscribed to push notifications on this device.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            onClick={sendTestNotification}
                            className="bg-finance-gold w-full hover:bg-finance-goldLight text-white h-10 font-bold px-6"
                        >
                            <Send className="w-4 h-4 mr-2" /> Send Test
                        </Button>
                    </div>
                    <Button
                        onClick={unsubscribeFromPush}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-9 border-slate-200 dark:border-slate-800 text-slate-500"
                    >
                        <BellOff className="w-3 h-3 mr-2" /> Unsubscribe from notifications
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Enable notifications to get real-time updates on your payments, new property listings, and community news.
                    </p>
                    <Button
                        onClick={subscribeToPush}
                        className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white h-12 font-bold text-sm shadow-md"
                    >
                        Enable Notifications
                    </Button>
                </div>
            )}
        </div>
    )
}
