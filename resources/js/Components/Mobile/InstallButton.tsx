'use client';

import { Button } from '@/components/ui/button';
import { useInstallPWA } from '@/Composables/useInstallPWA';
import { CheckCircle2, Download } from 'lucide-react';

export function InstallButton() {
    const { install, isInstalled, canInstall } = useInstallPWA();

    if (isInstalled) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-green-600 dark:text-green-500" />
                <span>App is installed</span>
            </div>
        );
    }

    if (!canInstall) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <p className="text-xs">
                    To install: Tap Share button and select &quot;Add to Home
                    Screen&quot;
                </p>
            </div>
        );
    }

    return (
        <Button
            onClick={install}
            variant="outline"
            className="w-full sm:w-auto"
        >
            <Download className="size-4" />
            Install App
        </Button>
    );
}
