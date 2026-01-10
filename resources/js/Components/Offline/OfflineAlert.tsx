'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { useOffline } from '@/Composables/useOffline';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface OfflineAlertProps {
    title?: string;
    message?: string;
}

export function OfflineAlert({
    title = 'Offline Mode',
    message = 'You are currently offline. Showing cached data.',
}: OfflineAlertProps) {
    const { isOffline } = useOffline();

    if (!isOffline) {
        return null;
    }

    return (
        <Alert variant="destructive" className="mb-4">
            <AlertCircle className="size-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}

interface StaleDataAlertProps {
    dataTimestamp?: number;
}

export function StaleDataAlert({ dataTimestamp }: StaleDataAlertProps) {
    const { isOffline, isDataStale } = useOffline();
    const isStale = isDataStale(dataTimestamp);

    if (!isOffline && !isStale) {
        return null;
    }

    if (isOffline) {
        return <OfflineAlert />;
    }

    return (
        <Alert variant="default" className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
            <Loader2 className="size-4 animate-spin" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">
                Data May Be Outdated
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
                This data was last updated recently. It may not reflect the latest changes.
            </AlertDescription>
        </Alert>
    );
}
