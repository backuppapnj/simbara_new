import { Html5Qrcode, Html5QrcodeError } from 'html5-qrcode';
import { useRef, useState } from 'react';

export interface BarcodeScannerError {
    message: string;
    code?: string;
}

export interface BarcodeScannerConfig {
    fps?: number;
    qrbox?: { width: number; height: number };
    aspectRatio?: number;
}

export function useBarcodeScanner(
    onDetected: (decodedText: string, decodedResult?: any) => void,
    config: BarcodeScannerConfig = {},
) {
    const {
        fps = 10,
        qrbox = { width: 250, height: 250 },
        aspectRatio = 1.0,
    } = config;

    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<BarcodeScannerError | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const elementIdRef = useRef<string>('');

    const startScanning = async (elementId: string) => {
        setIsLoading(true);
        setError(null);
        elementIdRef.current = elementId;

        try {
            // Create scanner instance if it doesn't exist
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(elementId);
            }

            const cameraConfig = {
                fps: fps,
                qrbox: qrbox,
                aspectRatio: aspectRatio,
            };

            await scannerRef.current.start(
                { facingMode: 'environment' },
                cameraConfig,
                (decodedText: string, decodedResult: any) => {
                    // On successful scan
                    onDetected(decodedText, decodedResult);

                    // Vibrate on success (if supported)
                    if ('vibrate' in navigator) {
                        navigator.vibrate(200);
                    }
                },
                (errorMessage: string, error: Html5QrcodeError) => {
                    // Ignore scan errors - they happen frequently when no code is in view
                    // Only log for debugging
                    if (process.env.NODE_ENV === 'development') {
                        console.debug('Scan error:', errorMessage);
                    }
                },
            );

            setIsScanning(true);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to start scanner';
            setError({
                message: errorMessage,
                code: (err as { name?: string }).name || 'SCANNER_ERROR',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
                setIsScanning(false);
                setError(null);
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Failed to stop scanner';
                setError({
                    message: errorMessage,
                    code: 'STOP_ERROR',
                });
            }
        }
    };

    const pauseScanning = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.pause();
                setIsScanning(false);
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Failed to pause scanner';
                setError({
                    message: errorMessage,
                    code: 'PAUSE_ERROR',
                });
            }
        }
    };

    const resumeScanning = async () => {
        if (scannerRef.current && !isScanning) {
            try {
                await scannerRef.current.resume();
                setIsScanning(true);
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Failed to resume scanner';
                setError({
                    message: errorMessage,
                    code: 'RESUME_ERROR',
                });
            }
        }
    };

    // Cleanup on unmount
    const cleanup = async () => {
        if (scannerRef.current) {
            try {
                if (isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
                scannerRef.current = null;
            } catch (err) {
                console.error('Scanner cleanup error:', err);
            }
        }
    };

    return {
        isScanning,
        isLoading,
        error,
        startScanning,
        stopScanning,
        pauseScanning,
        resumeScanning,
        cleanup,
    };
}
