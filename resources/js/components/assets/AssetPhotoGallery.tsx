'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import assets from '@/routes/assets';
import { router } from '@inertiajs/react';
import { Star, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface AssetPhoto {
    id: string;
    file_path: string;
    file_name: string;
    caption: string | null;
    is_primary: boolean;
}

interface AssetPhotoGalleryProps {
    assetId: string;
    photos?: AssetPhoto[];
    className?: string;
}

export function AssetPhotoGallery({
    assetId,
    photos: initialPhotos = [],
    className,
}: AssetPhotoGalleryProps) {
    const [photos, setPhotos] = useState(initialPhotos);
    const [selectedPhoto, setSelectedPhoto] = useState<AssetPhoto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (photoId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
            return;
        }

        setIsDeleting(true);

        try {
            await router.delete(
                assets.photos.destroy.url([assetId, photoId]),
                {
                    onSuccess: () => {
                        setPhotos((prev) =>
                            prev.filter((p) => p.id !== photoId),
                        );
                        if (selectedPhoto?.id === photoId) {
                            setSelectedPhoto(null);
                        }
                    },
                    onError: (errors) => {
                        console.error('Failed to delete photo:', errors);
                        alert('Gagal menghapus foto');
                    },
                    onFinish: () => {
                        setIsDeleting(false);
                    },
                },
            );
        } catch (error) {
            console.error('Delete error:', error);
            setIsDeleting(false);
        }
    };

    const handleSetPrimary = async (photoId: string) => {
        try {
            await router.put(
                assets.photos.update.url([assetId, photoId]),
                {
                    is_primary: true,
                },
                {
                    onSuccess: () => {
                        setPhotos((prev) =>
                            prev.map((p) => ({
                                ...p,
                                is_primary: p.id === photoId,
                            })),
                        );
                    },
                    onError: (errors) => {
                        console.error('Failed to set primary photo:', errors);
                        alert('Gagal mengatur foto utama');
                    },
                },
            );
        } catch (error) {
            console.error('Set primary error:', error);
        }
    };

    const getPhotoUrl = (photo: AssetPhoto) => {
        return `/storage/${photo.file_path}`;
    };

    if (photos.length === 0) {
        return (
            <div
                className={cn(
                    'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center',
                    className,
                )}
            >
                <p className="text-sm text-gray-500">
                    Belum ada foto aset. Unggah foto pertama Anda.
                </p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Thumbnail Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {photos.map((photo) => (
                    <div
                        key={photo.id}
                        className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                    >
                        <img
                            src={getPhotoUrl(photo)}
                            alt={photo.caption || photo.file_name}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            onClick={() => setSelectedPhoto(photo)}
                        />

                        {/* Primary Badge */}
                        {photo.is_primary && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                                <Star className="h-3 w-3 fill-current" />
                                Utama
                            </div>
                        )}

                        {/* Actions Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex h-full items-center justify-center gap-2">
                                {!photo.is_primary && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSetPrimary(photo.id);
                                        }}
                                        disabled={isDeleting}
                                    >
                                        <Star className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(photo.id);
                                    }}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div
                        className="relative max-h-[90vh] max-w-[90vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-0 right-0 -mt-12 -mr-12 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Photo */}
                        <img
                            src={getPhotoUrl(selectedPhoto)}
                            alt={
                                selectedPhoto.caption || selectedPhoto.file_name
                            }
                            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                        />

                        {/* Caption */}
                        {selectedPhoto.caption && (
                            <div className="mt-4 text-center text-white">
                                <p className="text-lg">
                                    {selectedPhoto.caption}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-4 flex items-center justify-center gap-4">
                            {!selectedPhoto.is_primary && (
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        handleSetPrimary(selectedPhoto.id)
                                    }
                                    disabled={isDeleting}
                                >
                                    <Star className="mr-2 h-4 w-4" />
                                    Jadikan Foto Utama
                                </Button>
                            )}
                            <Button
                                variant="destructive"
                                onClick={() => handleDelete(selectedPhoto.id)}
                                disabled={isDeleting}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Foto
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
