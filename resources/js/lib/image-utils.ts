export interface CompressImageOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'image/jpeg' | 'image/png';
}

export interface CompressedImageResult {
    dataUrl: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    dimensions: {
        width: number;
        height: number;
    };
}

/**
 * Compress an image to reduce file size while maintaining quality
 * @param dataUrl - The base64 data URL of the image
 * @param options - Compression options
 * @returns Promise with compressed image data and metadata
 */
export async function compressImage(
    dataUrl: string,
    options: CompressImageOptions = {},
): Promise<CompressedImageResult> {
    const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 0.8,
        format = 'image/jpeg',
    } = options;

    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            try {
                // Calculate new dimensions
                const { width, height } = calculateDimensions(
                    img.width,
                    img.height,
                    maxWidth,
                    maxHeight,
                );

                // Create canvas for resizing
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Draw image to canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed data URL
                const compressedDataUrl = canvas.toDataURL(format, quality);

                // Calculate sizes
                const originalSize = dataUrlToSize(dataUrl);
                const compressedSize = dataUrlToSize(compressedDataUrl);
                const compressionRatio =
                    originalSize > 0
                        ? ((originalSize - compressedSize) / originalSize) * 100
                        : 0;

                resolve({
                    dataUrl: compressedDataUrl,
                    originalSize,
                    compressedSize,
                    compressionRatio,
                    dimensions: {
                        width,
                        height,
                    },
                });
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = dataUrl;
    });
}

/**
 * Calculate new dimensions that fit within max width/height
 * while maintaining aspect ratio
 */
function calculateDimensions(
    width: number,
    height: number,
    maxWidth: number,
    maxHeight: number,
): { width: number; height: number } {
    // If image is already smaller than max dimensions, return original
    if (width <= maxWidth && height <= maxHeight) {
        return { width, height };
    }

    // Calculate scale factor
    const widthScale = maxWidth / width;
    const heightScale = maxHeight / height;
    const scale = Math.min(widthScale, heightScale);

    return {
        width: Math.round(width * scale),
        height: Math.round(height * scale),
    };
}

/**
 * Convert data URL to size in bytes
 */
function dataUrlToSize(dataUrl: string): number {
    const base64 = dataUrl.split(',')[1];
    if (!base64) return 0;
    return Math.round((base64.length * 3) / 4);
}

/**
 * Rotate an image by 90 degrees
 * @param dataUrl - The base64 data URL of the image
 * @param times - Number of 90-degree rotations (default: 1)
 * @returns Promise with rotated image data URL
 */
export async function rotateImage(
    dataUrl: string,
    times: number = 1,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Normalize rotations to 0-3
                const rotations = ((times % 4) + 4) % 4;

                // Swap dimensions for odd rotations
                if (rotations % 2 === 1) {
                    canvas.width = img.height;
                    canvas.height = img.width;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }

                // Rotate and draw
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((rotations * 90 * Math.PI) / 180);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);

                resolve(canvas.toDataURL('image/jpeg', 0.9));
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = dataUrl;
    });
}

/**
 * Crop an image to the specified rectangle
 * @param dataUrl - The base64 data URL of the image
 * @param x - X coordinate of crop area
 * @param y - Y coordinate of crop area
 * @param width - Width of crop area
 * @param height - Height of crop area
 * @returns Promise with cropped image data URL
 */
export async function cropImage(
    dataUrl: string,
    x: number,
    y: number,
    width: number,
    height: number,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = dataUrl;
    });
}

/**
 * Convert data URL to Blob
 * @param dataUrl - The base64 data URL
 * @returns Promise with Blob
 */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        try {
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);

            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }

            resolve(new Blob([u8arr], { type: mime }));
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Format bytes to human-readable string
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
