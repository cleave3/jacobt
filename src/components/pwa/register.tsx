'use client'

import { useEffect } from 'react'

export function PWARegister() {
    useEffect(() => {
        // Check if the browser supports Service Workers and if we're on a secure connection
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js') // Points to public/sw.js
                    .then((registration) => {
                        console.log('SW registered with scope:', registration.scope);
                    })
                    .catch((error) => {
                        console.error('SW registration failed:', error);
                    });
            });
        }
    }, []);

    return null;
}