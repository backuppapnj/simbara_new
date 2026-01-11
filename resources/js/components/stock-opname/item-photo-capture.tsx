'use client';

import { CameraCapture } from '@/components/camera/camera-capture';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Camera, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface CapturedPhoto {
    dataUrl: string;
    file: File;
    timestamp: number;
}

interface ItemPhotoCaptureProps {
    photos?: CapturedPhoto[];
    onPhotosChange?: (photos: CapturedPhoto[]) => void;
    maxPhotos?: number;
    className?: string;
    disabled?: boolean;
}

export function ItemPhotoCapture({
    photos: initialPhotos = [],
    onPhotosChange,
    maxPhotos = 3,
    className,
    disabled = false,
}: ItemPhotoCaptureProps) {
    const [showCamera, setShowCamera] = useState(false);
    const [photos, setPhotos] = useState<CapturedPhoto[]>(initialPhotos);
    const [isUploading, setIsUploading] = useState(false);

    // Sync internal state with prop changes
    useEffect(() => {
        setPhotos(initialPhotos);
    }, [initialPhotos]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const newPhoto: CapturedPhoto = {
                dataUrl: reader.result as string,
                file,
                timestamp: Date.now(),
            };
            const updatedPhotos = [...photos, newPhoto];
            setPhotos(updatedPhotos);
            onPhotosChange?.(updatedPhotos);
        };
        reader.readAsDataURL(file);
    };

    const handleCameraCapture = (dataUrl: string) => {
        // Convert data URL to blob
        fetch(dataUrl)
            .then((res) => res.blob())
            .then((blob) => {
                const file = new File([blob], `photo-${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                });
                const newPhoto: CapturedPhoto = {
                    dataUrl,
                    file,
                    timestamp: Date.now(),
                };
                const updatedPhotos = [...photos, newPhoto];
                setPhotos(updatedPhotos);
                onPhotosChange?.(updatedPhotos);
                setShowCamera(false);
            });
    };

    const handleRemovePhoto = (index: number) => {
        const updatedPhotos = photos.filter((_, i) => i !== index);
        setPhotos(updatedPhotos);
        onPhotosChange?.(updatedPhotos);
    };

    const canAddMore = photos.length < maxPhotos;

    return (
        <div className={cn('space-y-4', className)}>
            {/* Photos Grid */}
            {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {photos.map((photo, index) => (
                        <div
                            key={photo.timestamp}
                            className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                        >
                            <img
                                src={photo.dataUrl}
                                alt={`Photo ${index + 1}`}
                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />

                            {/* Remove Button */}
                            <button
                                type="button"
                                onClick={() => handleRemovePhoto(index)}
                                disabled={disabled}
                                className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X className="h-3 w-3" />
                            </button>

                            {/* Photo Number Badge */}
                            <div className="absolute top-1 left-1 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Options */}
            {canAddMore && !disabled && (
                <div className="flex flex-col gap-3 sm:flex-row">
                    {/* File Upload Button */}
                    <div className="flex-1">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="item-photo-upload"
                            disabled={disabled}
                        />
                        <Label
                            htmlFor="item-photo-upload"
                            className="flex h-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Upload className="mb-1 h-6 w-6 text-gray-400" />
                            <span className="text-xs font-medium text-gray-700">
                                Pilih File
                            </span>
                            <span className="text-xs text-gray-500">
                                JPG, PNG
                            </span>
                        </Label>
                    </div>

                    {/* Camera Button */}
                    <Button
                        type="button"
                        variant="outline"
                        className="flex h-full flex-1 flex-col items-center justify-center gap-1 py-4"
                        onClick={() => setShowCamera(true)}
                        disabled={disabled}
                    >
                        <Camera className="h-6 w-6" />
                        <span className="text-xs font-medium">Buka Kamera</span>
                    </Button>
                </div>
            )}

            {/* Photo Limit Info */}
            <p className="text-xs text-gray-500">
                {photos.length}/{maxPhotos} foto
            </p>

            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black">
                    <CameraCapture
                        onCapture={handleCameraCapture}
                        onClose={() => setShowCamera(false)}
                        className="h-full w-full"
                    />
                </div>
            )}
        </div>
    );
}
