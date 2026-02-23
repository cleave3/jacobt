'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser, sendNotification } from '@/app/actions/pwa'
import { Bell, BellOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    const [message, setMessage] = useState('')

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
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
            ),
        })
        setSubscription(sub)
        const serializedSub = JSON.parse(JSON.stringify(sub))
        await subscribeUser(serializedSub)
    }

    async function unsubscribeFromPush() {
        await subscription?.unsubscribe()
        setSubscription(null)
        await unsubscribeUser()
    }

    async function sendTestNotification() {
        if (subscription) {
            await sendNotification(message, JSON.parse(JSON.stringify(subscription)))
            setMessage('')
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
                        <Input
                            type="text"
                            placeholder="Test message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="h-10 text-sm"
                        />
                        <Button
                            onClick={sendTestNotification}
                            disabled={!message}
                            className="bg-finance-gold hover:bg-finance-goldLight text-white h-10 font-bold px-6"
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
