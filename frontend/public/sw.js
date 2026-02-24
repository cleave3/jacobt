const CACHE_NAME = "jacobt";
const OFFLINE_URL = "/offline";

// 1. Install - Pre-cache the offline page
self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    // Clean up old caches if version changes
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            )
        )
    );
    event.waitUntil(self.clients.claim());
});

// 2. Fetch - Network First Strategy
self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(OFFLINE_URL);
            })
        );
    }
});

// 3. Push - With better error handling
self.addEventListener("push", function (event) {
    if (event.data) {
        let data = {};
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: "New Notification", body: event.data.text() };
        }

        const options = {
            body: data.body,
            icon: data.icon || "/icon-192x192.png",
            badge: "/icon-192x192.png",
            vibrate: [100, 50, 100],
            data: { url: data.url || "/" } // Store the target URL
        };
        event.waitUntil(self.registration.showNotification(data.title, options));
    }
});

// 4. Notification Click - Navigate to specific URL
self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    const targetUrl = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === targetUrl && "focus" in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});
