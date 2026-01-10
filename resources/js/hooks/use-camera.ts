import { useRef, useState } from 'react';

type FacingMode = 'user' | 'environment';

export interface CameraError {
    message: string;
    code?: string;
}

export function useCamera() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<CameraError | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [facingMode, setFacingMode] = useState<FacingMode>('environment');

    const startCamera = async (preferredFacingMode: FacingMode = 'environment') => {
        setIsLoading(true);
        setError(null);

        try {
            // Stop existing stream if any
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }

            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: preferredFacingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: false,
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            setFacingMode(preferredFacingMode);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Camera access denied';
            setError({
                message: errorMessage,
                code: (err as { name?: string }).name || 'UNKNOWN_ERROR',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        setError(null);
    };

    const switchCamera = () => {
        const newFacingMode: FacingMode = facingMode === 'user' ? 'environment' : 'user';
        startCamera(newFacingMode);
    };

    const capturePhoto = (videoRef: React.RefObject<HTMLVideoElement>): string | null => {
        const video = videoRef.current;
        if (!video || !stream) {
            return null;
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return null;
        }

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to data URL (JPEG format with 0.9 quality)
        return canvas.toDataURL('image/jpeg', 0.9);
    };

    // Cleanup on unmount
    const cleanup = () => {
        stopCamera();
    };

    return {
        stream,
        error,
        isLoading,
        facingMode,
        startCamera,
        stopCamera,
        switchCamera,
        capturePhoto,
        cleanup,
    };
}
