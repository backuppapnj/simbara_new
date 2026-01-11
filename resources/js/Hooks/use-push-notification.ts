import { useEffect, useState } from 'react';

interface PushSubscription {
    endpoint: string;
    keys?: {
        p256dh: string;
        auth: string;
    };
}

interface UsePushNotificationReturn {
    permission: NotificationPermission;
    isSupported: boolean;
    isSubscribed: boolean;
    vapidPublicKey: string | null;
    requestPermission: () => Promise<NotificationPermission>;
    subscribe: () => Promise<PushSubscription | null>;
    unsubscribe: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

export function usePushNotification(): UsePushNotificationReturn {
    const [permission, setPermission] =
        useState<NotificationPermission>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSupported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

    useEffect(() => {
        if (isSupported) {
            setPermission(Notification.permission);
            fetchVapidKey();
            checkSubscription();
        }
    }, [isSupported]);

    const fetchVapidKey = async () => {
        try {
            const response = await fetch('/push-subscriptions/vapid-key');
            if (!response.ok) {
                throw new Error('Failed to fetch VAPID key');
            }
            const data = await response.json();
            setVapidPublicKey(data.public_key);
        } catch (err) {
            console.error('Error fetching VAPID key:', err);
            setError('Failed to initialize push notifications');
        }
    };

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription =
                await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (err) {
            console.error('Error checking subscription:', err);
        }
    };

    const requestPermission = async (): Promise<NotificationPermission> => {
        if (!isSupported) {
            setError('Push notifications are not supported in this browser');
            return 'denied';
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                await subscribe();
            }

            return result;
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to request permission';
            setError(message);
            return 'denied';
        } finally {
            setIsLoading(false);
        }
    };

    const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    };

    const subscribe = async (): Promise<PushSubscription | null> => {
        if (!isSupported || !vapidPublicKey) {
            setError('Push notifications not ready');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const registration = await navigator.serviceWorker.ready;

            // Check if already subscribed
            let subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                setIsSubscribed(true);
                return subscription.toJSON() as PushSubscription;
            }

            // Subscribe to push
            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            };

            subscription =
                await registration.pushManager.subscribe(subscribeOptions);

            // Send subscription to server
            const subscriptionData = subscription.toJSON();
            await fetch('/push-subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    endpoint: subscriptionData.endpoint,
                    key: subscriptionData.keys?.p256dh,
                    token: subscriptionData.keys?.auth,
                    content_encoding: subscriptionData.encoding || 'aesgcm',
                }),
            });

            setIsSubscribed(true);
            return subscriptionData as PushSubscription;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to subscribe';
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const unsubscribe = async () => {
        if (!isSupported) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription =
                await registration.pushManager.getSubscription();

            if (subscription) {
                // Unsubscribe from push service
                await subscription.unsubscribe();

                // Remove subscription from server
                await fetch('/push-subscriptions', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        endpoint: subscription.endpoint,
                    }),
                });

                setIsSubscribed(false);
            }
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to unsubscribe';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        permission,
        isSupported,
        isSubscribed,
        vapidPublicKey,
        requestPermission,
        subscribe,
        unsubscribe,
        isLoading,
        error,
    };
}
