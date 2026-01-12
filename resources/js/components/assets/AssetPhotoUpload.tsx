'use client';

import { CameraCapture } from '@/components/camera/camera-capture';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import assets from '@/routes/assets';
import { router } from '@inertiajs/react';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import { useState } from 'react';

interface AssetPhotoUploadProps {
    assetId: string;
    onUploadSuccess?: () => void;
    className?: string;
}

export function AssetPhotoUpload({
    assetId,
    onUploadSuccess,
    className,
}: AssetPhotoUploadProps) {
    const [showCamera, setShowCamera] = useState(false);
    const [photoData, setPhotoData] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoData(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleCameraCapture = (dataUrl: string) => {
        setPhotoData(dataUrl);
        setShowCamera(false);
    };

    const handleUpload = async () => {
        if (!photoData) return;

        setIsUploading(true);

        try {
            // Convert data URL to blob
            const response = await fetch(photoData);
            const blob = await response.blob();
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('photo', file);
            if (caption) {
                formData.append('caption', caption);
            }

            await router.post(assets.photos.store.url(assetId), formData, {
                onSuccess: () => {
                    setPhotoData(null);
                    setCaption('');
                    onUploadSuccess?.();
                },
                onError: (errors) => {
                    console.error('Upload failed:', errors);
                    alert('Gagal mengunggah foto');
                },
                onFinish: () => {
                    setIsUploading(false);
                },
            });
        } catch (error) {
            console.error('Upload error:', error);
            setIsUploading(false);
            alert('Gagal mengunggah foto');
        }
    };

    const handleCancel = () => {
        setPhotoData(null);
        setCaption('');
    };

    return (
        <div className={cn('space-y-4', className)}>
            {!photoData ? (
                <>
                    {/* Upload Options */}
                    <div className="flex flex-col gap-3 sm:flex-row">
                        {/* File Upload Button */}
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="photo-upload"
                            />
                            <Label
                                htmlFor="photo-upload"
                                className="flex h-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:bg-gray-100"
                            >
                                <Upload className="mb-2 h-8 w-8 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">
                                    Pilih File
                                </span>
                                <span className="text-xs text-gray-500">
                                    JPG, PNG hingga 5MB
                                </span>
                            </Label>
                        </div>

                        {/* Camera Button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="flex h-full flex-1 flex-col items-center justify-center gap-2"
                            onClick={() => setShowCamera(true)}
                        >
                            <Camera className="h-8 w-8" />
                            <span className="text-sm font-medium">
                                Buka Kamera
                            </span>
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    {/* Photo Preview */}
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 sm:aspect-video">
                        <img
                            src={photoData}
                            alt="Preview"
                            className="h-full w-full object-contain"
                        />

                        {/* Cancel Button */}
                        <button
                            onClick={handleCancel}
                            className="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Caption Input */}
                    <div className="space-y-2">
                        <Label htmlFor="caption">
                            Keterangan Foto (Opsional)
                        </Label>
                        <Textarea
                            id="caption"
                            value={caption}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCaption(e.target.value)}
                            placeholder="Masukkan keterangan foto..."
                            rows={2}
                            maxLength={255}
                        />
                        <p className="text-xs text-gray-500">
                            {caption.length}/255 karakter
                        </p>
                    </div>

                    {/* Upload Button */}
                    <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="w-full"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mengunggah...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Unggah Foto
                            </>
                        )}
                    </Button>
                </>
            )}

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
