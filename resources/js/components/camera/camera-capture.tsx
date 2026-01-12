'use client';

import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/use-camera';
import { cn } from '@/lib/utils';
import { AlertCircle, Camera, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export interface CameraCaptureProps {
    onCapture?: (dataUrl: string) => void;
    onClose?: () => void;
    className?: string;
    showCloseButton?: boolean;
}

export function CameraCapture({
    onCapture,
    onClose,
    className,
    showCloseButton = true,
}: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const {
        stream,
        error,
        isLoading,
        startCamera,
        stopCamera,
        switchCamera,
        capturePhoto,
    } = useCamera();

    useEffect(() => {
        // Start camera automatically on mount
        startCamera();

        return () => {
            stopCamera();
        };
         
    }, []);

    useEffect(() => {
        // Attach stream to video element when available
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const handleCapture = () => {
        const dataUrl = capturePhoto(videoRef);
        if (dataUrl && onCapture) {
            onCapture(dataUrl);
        }
    };

    const handleSwitchCamera = () => {
        switchCamera();
    };

    const hasMultipleCameras = /iPhone|iPad|iPod|Android/i.test(
        navigator.userAgent,
    );

    return (
        <div
            className={cn(
                'relative flex flex-col items-center justify-center bg-black',
                className,
            )}
        >
            {/* Close button */}
            {showCloseButton && onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:ring-2 focus:ring-white focus:outline-none"
                    aria-label="Close camera"
                >
                    <X className="h-5 w-5" />
                </button>
            )}

            {/* Video preview */}
            <div className="relative h-full w-full overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
                        <div className="text-center text-white">
                            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
                            <p className="text-sm">Starting camera...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/90">
                        <div className="max-w-md px-6 text-center">
                            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                            <h3 className="mb-2 text-lg font-semibold text-white">
                                Camera Error
                            </h3>
                            <p className="mb-4 text-sm text-gray-300">
                                {error.message}
                            </p>
                            <Button
                                onClick={() => startCamera()}
                                variant="default"
                                size="sm"
                            >
                                <Camera className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                        'h-full w-full object-cover',
                        !stream && 'hidden',
                    )}
                />
            </div>

            {/* Controls */}
            {stream && !error && (
                <div className="absolute right-0 bottom-0 left-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-6">
                    {/* Switch camera button */}
                    {hasMultipleCameras && (
                        <Button
                            onClick={handleSwitchCamera}
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20"
                        >
                            <RotateCcw className="h-6 w-6" />
                        </Button>
                    )}

                    {/* Capture button */}
                    <button
                        onClick={handleCapture}
                        className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-transparent transition-all hover:scale-105 focus:ring-4 focus:ring-white/50 focus:outline-none"
                        aria-label="Capture photo"
                    >
                        <div className="h-12 w-12 rounded-full bg-white" />
                    </button>

                    {/* Spacer for balance */}
                    <div className="h-12 w-12" />
                </div>
            )}
        </div>
    );
}
