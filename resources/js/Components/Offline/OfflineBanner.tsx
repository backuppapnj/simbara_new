'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { useOffline } from '@/Composables/useOffline';

export function OfflineBanner() {
    const { isOffline, wasOffline } = useOffline();

    if (!isOffline && !wasOffline) {
        return null;
    }

    if (isOffline) {
        return (
            <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/95 backdrop-blur-sm border-b border-amber-600 dark:bg-amber-600/95 dark:border-amber-700 animate-in slide-in-from-top fade-in duration-300">
                <div className="container mx-auto px-4 py-2">
                    <div className="flex items-center justify-center gap-2 text-amber-50">
                        <WifiOff className="size-4" />
                        <p className="text-sm font-medium">
                            You are offline. Some features may be limited.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Back online banner
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-500/95 backdrop-blur-sm border-b border-green-600 dark:bg-green-600/95 dark:border-green-700 animate-in slide-in-from-top fade-in duration-300">
            <div className="container mx-auto px-4 py-2">
                <div className="flex items-center justify-center gap-2 text-green-50">
                    <RefreshCw className="size-4" />
                    <p className="text-sm font-medium">
                        You are back online!
                    </p>
                </div>
            </div>
        </div>
    );
}
