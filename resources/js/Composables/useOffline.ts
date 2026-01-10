import { useEffect, useState } from 'react';

interface OfflineState {
    isOffline: boolean;
    wasOffline: boolean;
    lastOnlineTime: number | null;
}

export function useOffline() {
    const [offlineState, setOfflineState] = useState<OfflineState>({
        isOffline: !navigator.onLine,
        wasOffline: false,
        lastOnlineTime: null,
    });

    useEffect(() => {
        const handleOnline = () => {
            setOfflineState((prev) => ({
                ...prev,
                isOffline: false,
                wasOffline: prev.isOffline,
                lastOnlineTime: Date.now(),
            }));
        };

        const handleOffline = () => {
            setOfflineState((prev) => ({
                ...prev,
                isOffline: true,
            }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const isOffline = offlineState.isOffline;
    const wasOffline = offlineState.wasOffline;
    const lastOnlineTime = offlineState.lastOnlineTime;

    return {
        isOffline,
        wasOffline,
        lastOnlineTime,
        // Helper to check if data is stale (older than 5 minutes)
        isDataStale: (dataTimestamp?: number) => {
            if (!dataTimestamp || !lastOnlineTime) {
                return true;
            }
            const fiveMinutes = 5 * 60 * 1000;
            return Date.now() - dataTimestamp > fiveMinutes;
        },
    };
}
