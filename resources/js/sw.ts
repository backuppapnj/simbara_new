/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

interface PushNotificationData {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    tag?: string;
    url?: string;
    actions?: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
}

// Install event
self.addEventListener('install', (event: ExtendableEvent) => {
    console.log('[Service Worker] Install');
    event.waitUntil(self.skipWaiting());
});

// Activate event
self.addEventListener('activate', (event: ExtendableEvent) => {
    console.log('[Service Worker] Activate');
    event.waitUntil(self.clients.claim());
});

// Push event
self.addEventListener('push', (event: PushEvent) => {
    console.log('[Service Worker] Push received');

    let notificationData: PushNotificationData = {
        title: 'Aset PA PPU',
        body: 'Anda memiliki notifikasi baru',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
    };

    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = { ...notificationData, ...data };
        } catch (error) {
            console.error('[Service Worker] Error parsing push data:', error);
        }
    }

    const options: NotificationOptions = {
        body: notificationData.body,
        icon: notificationData.icon || '/icons/icon-192x192.png',
        badge: notificationData.badge || '/icons/icon-96x96.png',
        image: notificationData.image,
        tag: notificationData.tag || 'default-notification',
        requireInteraction: false,
        silent: false,
        data: {
            url: notificationData.url || '/',
            timestamp: Date.now(),
        },
        actions: notificationData.actions || [
            {
                action: 'open',
                title: 'Buka',
                icon: '/icons/icon-96x96.png',
            },
        ],
    };

    event.waitUntil(self.registration.showNotification(notificationData.title, options));
});

// Notification click event
self.addEventListener('notificationclick', (event: NotificationEvent) => {
    console.log('[Service Worker] Notification click');

    event.notification.close();

    const notificationData = event.notification.data as { url?: string; timestamp?: number };

    // Handle action clicks
    if (event.action) {
        console.log('[Service Worker] Action clicked:', event.action);
    }

    // Navigate to URL or fallback to home
    const url = notificationData?.url || '/';

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Find an existing window with the same URL
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }

                // If no existing window, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// Notification close event
self.addEventListener('notificationclose', (event: NotificationEvent) => {
    console.log('[Service Worker] Notification closed', event.notification.data);
});

// Sync event for background sync
self.addEventListener('sync', (event: ExtendableEvent) => {
    console.log('[Service Worker] Sync event:', event.tag);

    if (event.tag === 'sync-forms') {
        event.waitUntil(
            // Handle form synchronization
            Promise.resolve()
        );
    }
});

// Fetch event for offline support
self.addEventListener('fetch', (event: FetchEvent) => {
    // Let the default workbox caching handle this
    // We can add custom caching logic here if needed
});

export {};
