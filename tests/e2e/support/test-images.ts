/**
 * Test Image Utilities
 *
 * Utility functions for generating test images in E2E tests.
 * Creates simple base64-encoded images for testing photo uploads.
 */

/**
 * Creates a minimal 1x1 PNG image buffer
 * Useful for testing photo upload functionality without external dependencies
 */
export function createTestPngImage(): Buffer {
  // 1x1 transparent PNG in base64
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return Buffer.from(base64Png, 'base64');
}

/**
 * Creates a minimal 2x2 JPEG image buffer
 */
export function createTestJpgImage(): Buffer {
  // Minimal valid JPEG in base64
  const base64Jpg = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q==';
  return Buffer.from(base64Jpg, 'base64');
}

/**
 * Creates a test file object for Playwright file input
 */
export function createTestFileObject(filename: string, mimeType: string, buffer: Buffer) {
  return {
    name: filename,
    mimeType: mimeType,
    buffer: buffer,
  };
}

/**
 * Predefined test image configurations
 */
export const testImages = {
  png: createTestFileObject('test-photo.png', 'image/png', createTestPngImage()),
  jpg: createTestFileObject('test-photo.jpg', 'image/jpeg', createTestJpgImage()),
  invalid: createTestFileObject('test-file.txt', 'text/plain', Buffer.from('This is not an image', 'utf-8')),
};

/**
 * Creates multiple test image objects
 */
export function createMultipleTestImages(count: number = 3) {
  return Array.from({ length: count }, (_, i) =>
    createTestFileObject(`test-photo-${i + 1}.png`, 'image/png', createTestPngImage())
  );
}
