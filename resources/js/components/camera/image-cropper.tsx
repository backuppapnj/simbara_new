'use client';

import { Button } from '@/components/ui/button';
import { dataUrlToSize, formatBytes, rotateImage } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { Check, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

export interface ImageCropperProps {
    image: string;
    onConfirm: (processedImage: string) => void;
    onCancel: () => void;
    className?: string;
    aspectRatio?: number | null;
    maxWidth?: number;
    maxHeight?: number;
}

export function ImageCropper({
    image,
    onConfirm,
    onCancel,
    className,
    aspectRatio = null,
    maxWidth = 1920,
    maxHeight = 1920,
}: ImageCropperProps) {
    const [processedImage, setProcessedImage] = useState<string>(image);
    const [rotation, setRotation] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scale, setScale] = useState(1);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const imageSize = dataUrlToSize(processedImage);

    const handleRotate = useCallback(async () => {
        setIsProcessing(true);
        try {
            const rotated = await rotateImage(processedImage);
            setProcessedImage(rotated);
            setRotation((prev) => prev + 90);
        } catch (error) {
            console.error('Failed to rotate image:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [processedImage]);

    const handleConfirm = useCallback(() => {
        onConfirm(processedImage);
    }, [processedImage, onConfirm]);

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.1, 3));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.1, 0.5));
    };

    return (
        <div className={cn('flex flex-col bg-gray-900', className)}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-3">
                <div>
                    <h3 className="text-lg font-semibold text-white">
                        Edit Image
                    </h3>
                    <p className="text-sm text-gray-400">
                        {formatBytes(imageSize)}
                        {rotation > 0 && ` • Rotated ${rotation % 360}°`}
                    </p>
                </div>
                <Button
                    onClick={onCancel}
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Image preview */}
            <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
                <div
                    className="relative"
                    style={{
                        transform: `scale(${scale})`,
                        transition: 'transform 0.2s ease-out',
                    }}
                >
                    <img
                        src={processedImage}
                        alt="Preview"
                        className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-2xl"
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="border-t border-gray-700 bg-gray-800 p-4">
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {/* Rotate */}
                    <Button
                        onClick={handleRotate}
                        disabled={isProcessing}
                        variant="secondary"
                        size="lg"
                        className="gap-2"
                    >
                        <RotateCw
                            className={cn(
                                'h-5 w-5',
                                isProcessing && 'animate-spin',
                            )}
                        />
                        Rotate
                    </Button>

                    {/* Zoom controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleZoomOut}
                            variant="outline"
                            size="icon"
                            disabled={scale <= 0.5}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center text-sm text-gray-400">
                            {Math.round(scale * 100)}%
                        </span>
                        <Button
                            onClick={handleZoomIn}
                            variant="outline"
                            size="icon"
                            disabled={scale >= 3}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex gap-3">
                    <Button
                        onClick={onCancel}
                        variant="outline"
                        className="flex-1"
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant="default"
                        className="flex-1 gap-2"
                        disabled={isProcessing}
                    >
                        <Check className="h-5 w-5" />
                        {isProcessing ? 'Processing...' : 'Confirm'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
