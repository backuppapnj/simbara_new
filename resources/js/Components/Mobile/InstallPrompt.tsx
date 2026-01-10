'use client';

import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstallPWA } from '@/Composables/useInstallPWA';

interface InstallPromptProps {
    variant?: 'banner' | 'floating';
}

export function InstallPrompt({ variant = 'banner' }: InstallPromptProps) {
    const { showInstallPrompt, install, dismissPrompt, canInstall } = useInstallPWA();

    if (!showInstallPrompt || !canInstall) {
        return null;
    }

    if (variant === 'floating') {
        return (
            <div className="fixed bottom-20 right-4 z-50 md:bottom-24">
                <div className="flex items-end gap-2 animate-in slide-in-from-right fade-in duration-300">
                    <div className="bg-card text-card-foreground rounded-lg shadow-lg border border-border p-4 max-w-xs">
                        <p className="text-sm font-medium mb-1">Install App</p>
                        <p className="text-xs text-muted-foreground mb-3">
                            Install Aset PA PPU for the best experience
                        </p>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={install} className="h-8">
                                <Download className="size-4" />
                                Install
                            </Button>
                            <Button size="sm" variant="ghost" onClick={dismissPrompt} className="h-8 px-2">
                                <X className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border animate-in slide-in-from-top fade-in duration-300">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                            <Download className="size-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Install Aset PA PPU</p>
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
                            className="rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
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
