'use client';

import { CameraCapture } from './camera-capture';
import type { CameraCaptureProps } from './camera-capture';
import { ImageCropper } from './image-cropper';
import type { ImageCropperProps } from './image-cropper';
import { ImagePreview } from './image-preview';
import type { CapturedImage, ImagePreviewProps } from './image-preview';

export interface ImageUploadFlowProps {
    onUpload: (images: UploadedImage[]) => void;
    maxImages?: number;
    accept?: string;
    className?: string;
}

export interface UploadedImage {
    id: string;
    dataUrl: string;
    size: number;
    capturedAt: Date;
}

export function ImageUploadFlow({
    onUpload,
    maxImages = 5,
    accept = 'image/*',
    className,
}: ImageUploadFlowProps) {
    // Placeholder implementation
    return null;
}

export type { CameraCaptureProps, ImageCropperProps, CapturedImage, ImagePreviewProps };
