'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Scan, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { cn } from '@/lib/utils';

export interface BarcodeScannerProps {
    onScanSuccess?: (code: string, result?: any) => void;
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
    const scannerElementId = useRef(`barcode-scanner-${Date.now()}`);
    const hasScannedRef = useRef(false);

    const handleDetected = (decodedText: string, decodedResult?: any) => {
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
        if (!continuousScan) {
            setTimeout(() => {
                stopScanning();
            }, 500);
        }
    };

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

    useEffect(() => {
        // Start scanner on mount
        startScanning(scannerElementId.current);

        return () => {
            cleanup();
        };
    }, []);

    const handleRestart = () => {
        hasScannedRef.current = false;
        setLastScannedCode(null);
        startScanning(scannerElementId.current);
    };

    const handleClose = () => {
        stopScanning();
        if (onClose) {
            onClose();
        }
    };

    return (
        <div
            className={cn(
                'relative flex flex-col bg-black',
                className
            )}
        >
            {/* Close button */}
            {showCloseButton && onClose && (
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"
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
                            <p className="mb-4 text-sm text-gray-300">{error.message}</p>
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
                    id={scannerElementId.current}
                    className={cn('h-full w-full', !isLoading && !error && 'block')}
                />

                {/* Scan result overlay */}
                {lastScannedCode && !continuousScan && (
                    <div className="absolute bottom-20 left-4 right-4 z-10 rounded-lg bg-green-600 p-4 text-white">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">Scanned Successfully</p>
                                <p className="text-xs opacity-90 truncate">{lastScannedCode}</p>
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
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Corner brackets */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48">
                            <div className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-white" />
                            <div className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-white" />
                            <div className="absolute left-0 bottom-0 h-8 w-8 border-l-4 border-b-4 border-white" />
                            <div className="absolute right-0 bottom-0 h-8 w-8 border-r-4 border-b-4 border-white" />
                        </div>

                        {/* Scan line animation */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48">
                            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
                        </div>

                        {/* Instructions */}
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                            <p className="text-sm text-white/80">
                                Align barcode or QR code within the frame
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex-1">
                    {isScanning && (
                        <p className="text-sm text-white/80">
                            Scanning...
                        </p>
                    )}
                </div>

                {continuousScan && lastScannedCode && (
                    <Button
                        onClick={handleRestart}
                        variant="default"
                        size="sm"
                    >
                        <Scan className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
