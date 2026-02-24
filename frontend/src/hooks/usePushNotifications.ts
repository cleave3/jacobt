import { useEffect } from 'react'
import { axios } from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export function usePushNotifications() {
    const { user } = useAuth()

    useEffect(() => {
        if (!user || !VAPID_PUBLIC_KEY || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            return
        }

        const subscribeToPush = async () => {
            try {
                // Wait for SW to be ready
                const registration = await navigator.serviceWorker.ready

                // Ask for permission if not granted
                if (Notification.permission === 'default') {
                    const permission = await Notification.requestPermission()
                    if (permission !== 'granted') return
                }

                if (Notification.permission !== 'granted') return

                // Retrieve existing subscription or create new
                let subscription = await registration.pushManager.getSubscription()

                if (!subscription) {
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                    })
                }

                // Send subscription to backend
                await axios.post('/push/subscribe', subscription)
            } catch (error) {
                console.error('Failed to subscribe to push notifications:', error)
            }
        }

        subscribeToPush()
    }, [user])
}
