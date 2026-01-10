'use client';

import { Button } from '@/components/ui/button';
import { useInstallPWA } from '@/Composables/useInstallPWA';
import { Download, X } from 'lucide-react';

interface InstallPromptProps {
    variant?: 'banner' | 'floating';
}

export function InstallPrompt({ variant = 'banner' }: InstallPromptProps) {
    const { showInstallPrompt, install, dismissPrompt, canInstall } =
        useInstallPWA();

    if (!showInstallPrompt || !canInstall) {
        return null;
    }

    if (variant === 'floating') {
        return (
            <div className="fixed right-4 bottom-20 z-50 md:bottom-24">
                <div className="flex animate-in items-end gap-2 duration-300 fade-in slide-in-from-right">
                    <div className="max-w-xs rounded-lg border border-border bg-card p-4 text-card-foreground shadow-lg">
                        <p className="mb-1 text-sm font-medium">Install App</p>
                        <p className="mb-3 text-xs text-muted-foreground">
                            Install Aset PA PPU for the best experience
                        </p>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={install} className="h-8">
                                <Download className="size-4" />
                                Install
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={dismissPrompt}
                                className="h-8 px-2"
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-0 right-0 left-0 z-50 animate-in border-b border-border bg-background duration-300 fade-in slide-in-from-top">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Download className="size-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">
                                Install Aset PA PPU
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Quick access from your home screen
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={install}>
                            Install
                        </Button>
                        <button
                            onClick={dismissPrompt}
                            className="rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground"
                            aria-label="Dismiss"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
