'use client';

import { useOffline } from '@/Composables/useOffline';
import { cn } from '@/lib/utils';
import { WifiOff } from 'lucide-react';

interface OfflineFormProps {
    children: React.ReactNode;
    className?: string;
    disabledMessage?: string;
}

export function OfflineForm({
    children,
    className,
    disabledMessage = 'This form is not available offline.',
}: OfflineFormProps) {
    const { isOffline } = useOffline();

    if (isOffline) {
        return (
            <div
                className={cn(
                    'relative rounded-lg border border-border bg-muted/30 p-8 text-center',
                    className,
                )}
            >
                <WifiOff className="mx-auto mb-4 size-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">Offline Mode</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                    {disabledMessage}
                </p>
                <p className="text-xs text-muted-foreground">
                    Please connect to the internet to use this feature.
                </p>
            </div>
        );
    }

    return <>{children}</>;
}

interface OfflineButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}

export function OfflineButton({
    children,
    onClick,
    disabled,
    className,
}: OfflineButtonProps) {
    const { isOffline } = useOffline();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isOffline) {
            e.preventDefault();
            return;
        }
        onClick?.();
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled || isOffline}
            className={className}
            title={isOffline ? 'Not available offline' : undefined}
        >
            {children}
        </button>
    );
}
