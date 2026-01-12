'use client';

import { Button } from '@/components/ui/button';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Scan, X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

export interface BarcodeScannerProps {
    onScanSuccess?: (code: string, result?: unknown) => void;
    onClose?: () => void;
    className?: string;
    continuousScan?: boolean;
    showCloseButton?: boolean;
}

export function BarcodeScanner({
    onScanSuccess,
    onClose,
    className,
    continuousScan = false,
    showCloseButton = true,
}: BarcodeScannerProps) {
    const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
    const id = useId();
    const scannerElementId = `barcode-scanner-${id.replace(/:/g, '')}`;
    const hasScannedRef = useRef(false);
    const stopScanningRef = useRef<(() => Promise<void>) | null>(null);

    const handleDetected = useCallback(
        (decodedText: string, decodedResult?: unknown) => {
            // For non-continuous scan, only process the first scan
            if (!continuousScan && hasScannedRef.current) {
                return;
            }

            hasScannedRef.current = true;
            setLastScannedCode(decodedText);

            if (onScanSuccess) {
                onScanSuccess(decodedText, decodedResult);
            }

            // Auto-stop scanner after successful scan (unless continuous)
            if (!continuousScan && stopScanningRef.current) {
                setTimeout(() => {
                    stopScanningRef.current?.();
                }, 500);
            }
        },
        [continuousScan, onScanSuccess],
    );

    const {
        isScanning,
        isLoading,
        error,
        startScanning,
        stopScanning,
        cleanup,
    } = useBarcodeScanner(handleDetected, {
        fps: 10,
        qrbox: { width: 250, height: 250 },
    });

    // Update ref when stopScanning changes
    useEffect(() => {
        stopScanningRef.current = stopScanning;
    }, [stopScanning]);

    useEffect(() => {
        // Start scanner on mount
        startScanning(scannerElementId);

        return () => {
            cleanup();
        };
         
    }, []);

    const handleRestart = () => {
        hasScannedRef.current = false;
        setLastScannedCode(null);
        startScanning(scannerElementId);
    };

    const handleClose = () => {
        stopScanning();
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className={cn('relative flex flex-col bg-black', className)}>
            {/* Close button */}
            {showCloseButton && onClose && (
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:ring-2 focus:ring-white focus:outline-none"
                    aria-label="Close scanner"
                >
                    <X className="h-5 w-5" />
                </button>
            )}

            {/* Scanner container */}
            <div className="relative h-full w-full">
                {/* Loading state */}
                {isLoading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
                        <div className="text-center text-white">
                            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
                            <p className="text-sm">Starting scanner...</p>
                        </div>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/90">
                        <div className="max-w-md px-6 text-center">
                            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                            <h3 className="mb-2 text-lg font-semibold text-white">
                                Scanner Error
                            </h3>
                            <p className="mb-4 text-sm text-gray-300">
                                {error.message}
                            </p>
                            <Button
                                onClick={handleRestart}
                                variant="default"
                                size="sm"
                            >
                                <Scan className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                {/* Scanner element */}
                <div
                    id={scannerElementId}
                    className={cn(
                        'h-full w-full',
                        !isLoading && !error && 'block',
                    )}
                />

                {/* Scan result overlay */}
                {lastScannedCode && !continuousScan && (
                    <div className="absolute right-4 bottom-20 left-4 z-10 rounded-lg bg-green-600 p-4 text-white">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                    Scanned Successfully
                                </p>
                                <p className="truncate text-xs opacity-90">
                                    {lastScannedCode}
                                </p>
                            </div>
                            <Button
                                onClick={handleRestart}
                                variant="secondary"
                                size="sm"
                                className="flex-shrink-0"
                            >
                                Scan Again
                            </Button>
                        </div>
                    </div>
                )}

                {/* Scanning guide overlay */}
                {isScanning && !lastScannedCode && (
                    <div className="pointer-events-none absolute inset-0">
                        {/* Corner brackets */}
                        <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2">
                            <div className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-white" />
                            <div className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-white" />
                            <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-white" />
                            <div className="absolute right-0 bottom-0 h-8 w-8 border-r-4 border-b-4 border-white" />
                        </div>

                        {/* Scan line animation */}
                        <div className="absolute top-1/2 left-1/2 w-48 -translate-x-1/2 -translate-y-1/2">
                            <div className="h-0.5 w-full animate-pulse bg-gradient-to-r from-transparent via-white to-transparent" />
                        </div>

                        {/* Instructions */}
                        <div className="absolute right-0 bottom-4 left-0 text-center">
                            <p className="text-sm text-white/80">
                                Align barcode or QR code within the frame
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="absolute right-0 bottom-0 left-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex-1">
                    {isScanning && (
                        <p className="text-sm text-white/80">Scanning...</p>
                    )}
                </div>

                {continuousScan && lastScannedCode && (
                    <Button onClick={handleRestart} variant="default" size="sm">
                        <Scan className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
