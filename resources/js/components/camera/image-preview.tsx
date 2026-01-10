'use client';

import { Check, Trash2, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CapturedImage {
    id: string;
    dataUrl: string;
    isPrimary?: boolean;
}

export interface ImagePreviewProps {
    images: CapturedImage[];
    onDelete?: (id: string) => void;
    onSetPrimary?: (id: string) => void;
    onPreview?: (image: CapturedImage) => void;
    maxImages?: number;
    className?: string;
}

export function ImagePreview({
    images,
    onDelete,
    onSetPrimary,
    onPreview,
    maxImages = 5,
    className,
}: ImagePreviewProps) {
    if (images.length === 0) {
        return (
            <div
                className={cn(
                    'flex min-h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50',
                    className
                )}
            >
                <p className="text-sm text-gray-500">No images captured</p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Image grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image, index) => (
                    <div
                        key={image.id}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                    >
                        {/* Image */}
                        <img
                            src={image.dataUrl}
                            alt={`Captured ${index + 1}`}
                            className="h-full w-full object-cover"
                        />

                        {/* Primary badge */}
                        {image.isPrimary && (
                            <div className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                                Primary
                            </div>
                        )}

                        {/* Overlay with actions */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex gap-2">
                                {onPreview && (
                                    <button
                                        onClick={() => onPreview(image)}
                                        className="rounded-full bg-white p-2 text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
                                        aria-label="Preview image"
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                    </button>
                                )}
                                {onSetPrimary && !image.isPrimary && (
                                    <button
                                        onClick={() => onSetPrimary(image.id)}
                                        className="rounded-full bg-white p-2 text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
                                        aria-label="Set as primary"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(image.id)}
                                        className="rounded-full bg-red-600 p-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        aria-label="Delete image"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Image number */}
                        <div className="absolute right-2 bottom-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white">
                            {index + 1}
                        </div>
                    </div>
                ))}

                {/* Add more indicator */}
                {images.length < maxImages && (
                    <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                        <p className="text-center text-sm text-gray-500">
                            {maxImages - images.length} more
                            <br />
                            allowed
                        </p>
                    </div>
                )}
            </div>

            {/* Image count */}
            <p className="text-sm text-gray-600">
                {images.length} of {maxImages} images
            </p>
        </div>
    );
}
