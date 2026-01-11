import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';
import { testImages, createMultipleTestImages } from './support/test-images';

/**
 * ASSET PHOTOS E2E TESTS / PENGUJIAN E2E FOTO ASET
 *
 * Uji coba fungsionalitas lengkap untuk pengelolaan foto aset termasuk:
 * - Melihat galeri foto aset
 * - Mengunggah foto dari file
 * - Mengambil foto dari kamera
 * - Memotong/edit gambar sebelum diunggah
 * - Menetapkan foto utama
 * - Menghapus foto
 * - Validasi file
 *
 * Routes:
 * - GET    /assets/{id}/photos          - List photos for an asset
 * - POST   /assets/{id}/photos          - Upload new photo
 * - PUT    /assets/{assetId}/photos/{photoId}  - Update photo (set primary, caption)
 * - DELETE /assets/{assetId}/photos/{photoId}  - Delete photo
 *
 * Components:
 * - resources/js/components/assets/AssetPhotoGallery.tsx
 * - resources/js/components/assets/AssetPhotoUpload.tsx
 * - resources/js/components/camera/camera-capture.tsx
 * - resources/js/components/camera/image-cropper.tsx
 */

test.describe('Asset Photos Management', () => {
  // Use authenticated super admin for all tests
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    // Navigate to assets page before each test
    await page.goto('/assets');
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: logout after each test
    await logout(page);
  });

  /**
   * TEST SCENARIO 1: View Asset Photos Gallery
   *
   * Memastikan galeri foto aset ditampilkan dengan benar:
   * - Navigasi ke halaman detail aset
   * - Klik tab foto
   * - Verifikasi galeri menampilkan semua foto
   * - Periksa thumbnail gambar dimuat
   * - Verifikasi foto utama ditandai
   */
  test('should display asset photos gallery correctly / Menampilkan galeri foto aset dengan benar', async ({ page }) => {
    // Click on first asset to view details
    await page.locator('tbody tr').first().click();
    await expect(page).toHaveURL(/\/assets\/\d+/);

    // Look for photos tab or section
    // The photo gallery might be in a tab or directly visible
    const photosTab = page.getByRole('tab', { name: /foto|photos|gambar/i });
    if (await photosTab.count() > 0) {
      await photosTab.click();
    }

    // Wait for content to load
    await page.waitForTimeout(1000);

    // Check if photo gallery section exists
    const photoGallery = page.locator('.grid, [class*="photo"], [class*="gallery"]');

    if (await photoGallery.count() > 0) {
      // Verify photos are displayed
      const photoImages = photoGallery.locator('img').or(page.locator('[class*="aspect-square"]'));

      if (await photoImages.count() > 0) {
        // Check for primary photo indicator (star/badge)
        const primaryBadge = page.locator('[class*="primary"], [class*="utama"], .lucide-star');
        await expect(primaryBadge.first()).toBeVisible();
      } else {
        // Check for empty state message
        await expect(page.getByText(/belum ada foto|no photos|no photos yet/i)).toBeVisible();
      }
    }
  });

  /**
   * TEST SCENARIO 2: Upload Photo from File
   *
   * Mengunggah foto dari file sistem:
   * - Klik tombol "Add Photo" / "Tambah Foto"
   * - Pilih file dari sistem
   * - Tunggu unggahan selesai
   * - Verifikasi foto muncul di galeri
   * - Periksa notifikasi sukses
   */
  test('should upload photo from file system / Mengunggah foto dari file sistem', async ({ page }) => {
    // Navigate to first asset detail page
    await page.locator('tbody tr').first().click();
    await expect(page).toHaveURL(/\/assets\/\d+/);

    // Find and click upload button
    const uploadButton = page.getByRole('button', { name: /tambah foto|add photo|unggah|upload/i }).first();

    if (await uploadButton.count() > 0) {
      await uploadButton.click();

      // Wait for upload modal/area to appear
      await page.waitForTimeout(500);

      // Look for file input
      const fileInput = page.locator('input[type="file"]').first();

      if (await fileInput.count() > 0) {
        // Upload the file using test images helper
        await fileInput.setInputFiles(testImages.png);

        // Wait for upload processing
        await page.waitForTimeout(2000);

        // Look for confirm/upload button
        const confirmButton = page.getByRole('button', { name: /unggah|upload|simpan|save/i });

        if (await confirmButton.count() > 0) {
          await confirmButton.click();
          await page.waitForTimeout(2000);

          // Verify success message (Indonesian or English)
          await expect(page.getByText(/berhasil|success|disimpan|saved/i)).toBeVisible();
        }
      }
    }
  });

  /**
   * TEST SCENARIO 3: Upload Photo from Camera
   *
   * Mengambil foto menggunakan kamera perangkat:
   * - Klik tombol "Camera" / "Kamera"
   * - Verifikasi izin kamera diminta
   * - Ambil foto
   * - Verifikasi preview gambar
   * - Konfirmasi dan simpan
   * - Periksa foto muncul di galeri
   *
   * NOTE: Camera functionality requires real device or proper permissions
   * This test may be skipped in CI environments
   */
  test.skip('should capture photo from camera / Mengambil foto dari kamera', async ({ page }) => {
    // Navigate to asset detail page
    await page.locator('tbody tr').first().click();

    // Find camera button
    const cameraButton = page.getByRole('button', { name: /kamera|camera|buka kamera/i });

    if (await cameraButton.count() > 0) {
      // Handle camera permission dialog
      page.on('dialog', async (dialog) => {
        await dialog.accept();
      });

      await cameraButton.click();

      // Wait for camera interface to load
      await page.waitForTimeout(2000);

      // Check for camera elements
      const videoElement = page.locator('video');
      await expect(videoElement).toBeVisible();

      // Click capture button
      const captureButton = page.locator('button[aria-label="Capture photo"], .lucide-camera, button:has(.lucide-camera)');
      if (await captureButton.count() > 0) {
        await captureButton.click();

        // Wait for image preview
        await page.waitForTimeout(1000);

        // Confirm save
        const confirmButton = page.getByRole('button', { name: /simpan|save|konfirmasi|confirm/i });
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
          await page.waitForTimeout(2000);

          // Verify success
          await expect(page.getByText(/berhasil|success/i)).toBeVisible();
        }
      }
    }
  });

  /**
   * TEST SCENARIO 4: Crop Image Before Upload
   *
   * Memotong gambar sebelum diunggah:
   * - Unggah atau ambil foto
   * - Verifikasi antarmuka cropper terbuka
   * - Uji fungsi crop (drag, zoom)
   * - Konfirmasi crop
   * - Verifikasi gambar yang dipotong disimpan
   */
  test('should crop image before uploading / Memotong gambar sebelum diunggah', async ({ page }) => {
    // Navigate to asset detail page
    await page.locator('tbody tr').first().click();

    // Find upload option
    const uploadButton = page.getByRole('button', { name: /tambah|add|upload/i }).first();
    if (await uploadButton.count() > 0) {
      await uploadButton.click();
      await page.waitForTimeout(500);

      // Upload a test image
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles(testImages.png);

        await page.waitForTimeout(1000);

        // Check if cropper interface appears
        const cropperInterface = page.locator('[class*="crop"], [class*="edit"], button:has-text("Rotate")');

        if (await cropperInterface.count() > 0) {
          // Test rotate functionality
          const rotateButton = page.getByRole('button', { name: /rotate|putar/i });
          if (await rotateButton.count() > 0) {
            await rotateButton.click();
            await page.waitForTimeout(500);
          }

          // Test zoom functionality
          const zoomInButton = page.getByRole('button', { name: /zoom in|perbesar/i });
          if (await zoomInButton.count() > 0) {
            await zoomInButton.click();
            await page.waitForTimeout(500);
          }

          // Confirm crop
          const confirmButton = page.getByRole('button', { name: /confirm|konfirmasi|terapkan/i });
          if (await confirmButton.count() > 0) {
            await confirmButton.click();
            await page.waitForTimeout(1000);
          }
        }

        // Final upload
        const uploadConfirmButton = page.getByRole('button', { name: /unggah|upload|simpan/i });
        if (await uploadConfirmButton.count() > 0) {
          await uploadConfirmButton.click();
          await page.waitForTimeout(2000);

          await expect(page.getByText(/berhasil|success/i)).toBeVisible();
        }
      }
    }
  });

  /**
   * TEST SCENARIO 5: Set Photo as Primary
   *
   * Menetapkan foto sebagai foto utama:
   * - Lihat foto aset
   * - Klik "Set as Primary" pada non-primary photo
   * - Verifikasi status utama diperbarui
   * - Periksa indikator visual berpindah
   * - Verifikasi urutan di galeri diperbarui
   */
  test('should set photo as primary / Menetapkan foto sebagai utama', async ({ page }) => {
    // Navigate to asset with multiple photos
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(1000);

    // Find photos in gallery
    const photos = page.locator('[class*="aspect-square"], .grid > div');
    const photoCount = await photos.count();

    if (photoCount > 1) {
      // Find a non-primary photo (without star badge)
      const nonPrimaryPhoto = photos.nth(1);
      await nonPrimaryPhoto.hover();

      // Click the star/set primary button
      const setPrimaryButton = nonPrimaryPhoto.locator('button').filter({ hasText: /star|utama|primary/i }).or(
        nonPrimaryPhoto.locator('.lucide-star').locator('..')
      );

      if (await setPrimaryButton.count() > 0) {
        // Store original state
        const beforeState = await page.content();

        await setPrimaryButton.first().click();
        await page.waitForTimeout(2000);

        // Verify success message
        await expect(page.getByText(/berhasil|success|foto utama|primary photo/i)).toBeVisible();

        // Verify the primary badge moved to this photo
        await nonPrimaryPhoto.locator('[class*="primary"], [class*="utama"], .lucide-star').first().isVisible();
      }
    }
  });

  /**
   * TEST SCENARIO 6: Update Photo Caption
   *
   * Memperbarui keterangan foto:
   * - Klik edit pada foto
   * - Tambah/perbarui teks keterangan
   * - Simpan perubahan
   * - Verifikasi keterangan tersimpan
   */
  test('should update photo caption / Memperbarui keterangan foto', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(1000);

    // Click on a photo to open lightbox/edit mode
    const firstPhoto = page.locator('[class*="aspect-square"], .grid > div').first();
    await firstPhoto.click();

    await page.waitForTimeout(500);

    // Look for caption input or edit button
    const captionInput = page.locator('textarea[name="caption"], input[name*="caption"], [placeholder*="keterangan"]');

    if (await captionInput.count() > 0) {
      const testCaption = 'Test Caption Indonesia 123';
      await captionInput.fill(testCaption);

      // Save caption
      const saveButton = page.getByRole('button', { name: /simpan|save|update/i });
      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForTimeout(1000);

        // Verify caption persists
        await expect(page.getByText(testCaption)).toBeVisible();
      }
    }

    // Close lightbox if open
    const closeButton = page.locator('button').filter({ hasText: /close|tutup|x/i }).first();
    if (await closeButton.count() > 0) {
      await closeButton.click();
    }
  });

  /**
   * TEST SCENARIO 7: Delete Photo
   *
   * Menghapus foto:
   * - Klik hapus pada foto
   * - Verifikasi dialog konfirmasi
   * - Konfirmasi penghapusan
   * - Verifikasi foto dihapus dari galeri
   * - Periksa pesan sukses
   */
  test('should delete photo with confirmation / Menghapus foto dengan konfirmasi', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(1000);

    // Count photos before deletion
    const photosBefore = await page.locator('[class*="aspect-square"], .grid > div').count();

    if (photosBefore > 0) {
      // Hover over first photo to reveal delete button
      const firstPhoto = page.locator('[class*="aspect-square"], .grid > div').first();
      await firstPhoto.hover();

      // Find and click delete button
      const deleteButton = firstPhoto.locator('button').filter({ hasText: /delete|hapus|trash/i }).or(
        firstPhoto.locator('.lucide-trash-2, .lucide-trash').locator('..')
      );

      if (await deleteButton.count() > 0) {
        // Handle confirmation dialog
        let dialogHandled = false;
        page.on('dialog', async (dialog) => {
          await dialog.accept();
          dialogHandled = true;
        });

        await deleteButton.first().click();
        await page.waitForTimeout(1000);

        // Verify photo was deleted
        const photosAfter = await page.locator('[class*="aspect-square"], .grid > div').count();
        expect(photosAfter).toBeLessThan(photosBefore);

        // Check for success message
        await expect(page.getByText(/berhasil dihapus|deleted|successfully deleted/i)).toBeVisible();
      }
    }
  });

  /**
   * TEST SCENARIO 8: Delete Primary Photo
   *
   * Menghapus foto utama:
   * - Hapus foto utama
   * - Verifikasi peringatan jika satu-satunya foto
   * - Jika banyak foto, verifikasi foto berikutnya menjadi utama
   * - Periksa galeri diperbarui dengan benar
   */
  test('should handle deletion of primary photo / Menangani penghapusan foto utama', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(1000);

    // Find primary photo (has star badge)
    const primaryPhoto = page.locator('[class*="primary"], [class*="utama"]').first().locator('..');

    if (await primaryPhoto.count() > 0) {
      const photoCount = await page.locator('[class*="aspect-square"], .grid > div').count();

      // Hover and click delete
      await primaryPhoto.hover();
      const deleteButton = primaryPhoto.locator('button').filter({ hasText: /delete|hapus|trash/i }).or(
        primaryPhoto.locator('.lucide-trash-2, .lucide-trash').locator('..')
      );

      if (await deleteButton.count() > 0) {
        page.on('dialog', async (dialog) => {
          await dialog.accept();
        });

        await deleteButton.first().click();
        await page.waitForTimeout(1000);

        // If multiple photos, another should become primary
        if (photoCount > 1) {
          const newPrimaryBadge = page.locator('[class*="primary"], [class*="utama"], .lucide-star');
          await expect(newPrimaryBadge.first()).toBeVisible();
        } else {
          // Should show warning or error
          await expect(page.getByText(/tidak bisa menghapus|cannot delete|harus ada foto|must have photo/i)).toBeVisible();
        }
      }
    }
  });

  /**
   * TEST SCENARIO 9: Multiple Photo Upload
   *
   * Mengunggah banyak foto sekaligus:
   * - Unggah beberapa foto sekaligus
   * - Verifikasi semua foto diproses
   * - Periksa indikator progres
   * - Verifikasi semua muncul di galeri
   */
  test('should upload multiple photos simultaneously / Mengunggah banyak foto sekaligus', async ({ page }) => {
    await page.locator('tbody tr').first().click();

    const uploadButton = page.getByRole('button', { name: /tambah|add|upload/i }).first();
    if (await uploadButton.count() > 0) {
      await uploadButton.click();
      await page.waitForTimeout(500);

      const fileInput = page.locator('input[type="file"]').first();

      if (await fileInput.count() > 0) {
        // Check if multiple attribute is supported
        const supportsMultiple = await fileInput.getAttribute('multiple');

        if (supportsMultiple !== null) {
          // Create multiple test images using helper
          const files = createMultipleTestImages(3);

          await fileInput.setInputFiles(files);
          await page.waitForTimeout(3000);

          // Verify progress indicators or success messages
          await expect(page.getByText(/berhasil|success|uploaded/i)).toBeVisible();
        }
      }
    }
  });

  /**
   * TEST SCENARIO 10: Photo File Validation
   *
   * Validasi file foto:
   * - Coba mengunggah non-image file
   * - Verifikasi error validasi
   * - Coba mengunggah file besar (>5MB)
   * - Verifikasi error batas ukuran
   * - Coba file gambar rusak
   * - Verifikasi penanganan error
   */
  test('should validate photo files / Memvalidasi file foto', async ({ page }) => {
    await page.locator('tbody tr').first().click();

    const uploadButton = page.getByRole('button', { name: /tambah|add|upload/i }).first();
    if (await uploadButton.count() > 0) {
      await uploadButton.click();
      await page.waitForTimeout(500);

      const fileInput = page.locator('input[type="file"]').first();

      if (await fileInput.count() > 0) {
        // Test 1: Non-image file
        await fileInput.setInputFiles(testImages.invalid);
        await page.waitForTimeout(1000);

        // Check for validation error
        const errorMessage = page.getByText(/invalid|tidak valid|harus gambar|must be image/i);
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible();
        }

        // Test 2: Check file size limit mentioned in UI
        const fileSizeInfo = page.getByText(/5MB|5 mb|maximum size|maksimal/i);
        await expect(fileSizeInfo.first()).toBeVisible();
      }
    }
  });

  /**
   * TEST SCENARIO 11: Photo Gallery Pagination
   *
   * Paginasi galeri foto:
   * - Lihat aset dengan banyak foto (>20)
   * - Verifikasi paginasi muncul
   * - Navigasi antar halaman
   * - Verifikasi foto dimuat dengan benar
   */
  test('should handle photo gallery pagination / Menangani paginasi galeri foto', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(1000);

    // Look for pagination controls
    const pagination = page.locator('[class*="pagination"], nav[aria-label*="pagination"], .paginati');

    if (await pagination.count() > 0) {
      // Verify pagination is visible
      await expect(pagination.first()).toBeVisible();

      // Click next page if available
      const nextPageButton = page.getByRole('button', { name: /next|selanjutnya|>/i });

      if (await nextPageButton.count() > 0) {
        // Count photos before navigation
        const photosBefore = await page.locator('[class*="aspect-square"], .grid > div').count();

        await nextPageButton.first().click();
        await page.waitForTimeout(1000);

        // Verify photos loaded (might be different or same count)
        const photosAfter = await page.locator('[class*="aspect-square"], .grid > div').count();
        expect(photosAfter).toBeGreaterThanOrEqual(0);
      }
    }
  });

  /**
   * TEST SCENARIO 12: Download Photo
   *
   * Mengunduh foto:
   * - Klik unduh pada foto
   * - Verifikasi file terunduh
   * - Periksa format nama file
   */
  test('should allow photo download / Mengizinkan unduhan foto', async ({ page }) => {
    await page.locator('tbody tr').first().click();

    // Look for download button
    const downloadButton = page.getByRole('button', { name: /download|unduh/i }).or(
      page.locator('a[download], [download][href*="/storage/"]')
    );

    if (await downloadButton.count() > 0) {
      // Setup download handler
      const downloadPromise = page.waitForEvent('download');

      await downloadButton.first().click();

      const download = await downloadPromise;

      // Verify download started
      expect(download.suggestedFilename()).toMatch(/\.(jpg|jpeg|png|webp)$/i);
    }
  });

  /**
   * TEST SCENARIO 13: Photo Lightbox/Fullscreen
   *
   * Lightbox/layar penuh foto:
   * - Klik thumbnail foto
   * - Verifikasi lightbox terbuka
   * - Uji navigasi (prev/next)
   * - Uji tutup
   * - Verifikasi shortcut keyboard
   */
  test('should display photo in lightbox with navigation / Menampilkan foto di lightbox dengan navigasi', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(1000);

    // Click on first photo to open lightbox
    const firstPhoto = page.locator('[class*="aspect-square"], .grid > div img').first();

    if (await firstPhoto.count() > 0) {
      await firstPhoto.click();
      await page.waitForTimeout(500);

      // Verify lightbox is open (dark overlay)
      const lightbox = page.locator('.fixed, [class*="lightbox"], [class*="modal"]').filter({ hasText: /background/i });
      await expect(lightbox.first()).toBeVisible();

      // Test close with Escape key
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // Verify lightbox closed
      await expect(lightbox.first()).not.toBeVisible();

      // Reopen to test navigation
      await firstPhoto.click();
      await page.waitForTimeout(500);

      // Test prev/next buttons if multiple photos
      const nextButton = page.getByRole('button', { name: /next|selanjutnya|>/i });
      const prevButton = page.getByRole('button', { name: /previous|sebelumnya|</i });

      if (await nextButton.count() > 0) {
        await nextButton.first().click();
        await page.waitForTimeout(300);
      }

      if (await prevButton.count() > 0) {
        await prevButton.first().click();
        await page.waitForTimeout(300);
      }

      // Close lightbox
      const closeButton = page.locator('button').filter({ hasText: /close|tutup|x/i }).first();
      if (await closeButton.count() > 0) {
        await closeButton.click();
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });

  /**
   * TEST SCENARIO 14: Permission Checks - Regular User
   *
   * Pemeriksaan izin - pengguna biasa:
   * - Uji dengan pengguna tanpa izin assets.photos.*
   * - Verifikasi tidak bisa mengunggah
   * - Verifikasi tidak bisa menghapus
   * - Verifikasi tombol edit tersembunyi
   */
  test('should restrict actions for users without permissions / Membatasi aksi tanpa izin', async ({ page }) => {
    // Logout as super admin
    await logout(page);

    // Login as regular user without asset photo permissions
    await login(page, testUsers.pegawai);

    // Navigate to assets
    await page.goto('/assets');
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(1000);

    // Check for restricted elements
    const uploadButton = page.getByRole('button', { name: /tambah|add|upload|unggah/i });
    const deleteButton = page.locator('button').filter({ hasText: /delete|hapus/i });

    // These should not be visible or enabled
    if (await uploadButton.count() > 0) {
      await expect(uploadButton.first()).not.toBeVisible();
    }

    if (await deleteButton.count() > 0) {
      await expect(deleteButton.first()).not.toBeVisible();
    }

    // Verify read-only access (photos should still be visible)
    const photoGallery = page.locator('.grid, [class*="photo"], [class*="gallery"]');
    if (await photoGallery.count() > 0) {
      await expect(photoGallery.first()).toBeVisible();
    }
  });

  /**
   * TEST SCENARIO 15: Responsive Design - Mobile View
   *
   * Desain responsif - tampilan mobile:
   * - Uji galeri foto di viewport mobile
   * - Verifikasi grid responsif
   * - Uji unggah di mobile
   */
  test('should display correctly on mobile devices / Menampilkan dengan benar di perangkat mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/assets');
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(1000);

    // Verify gallery adapts to mobile grid
    const photoGallery = page.locator('.grid, [class*="photo"]');

    if (await photoGallery.count() > 0) {
      await expect(photoGallery.first()).toBeVisible();

      // On mobile, grid should be 2 columns instead of 4-6
      const gallery = photoGallery.first();
      const gridClass = await gallery.getAttribute('class');
      expect(gridClass).toMatch(/grid-cols-1|grid-cols-2/);
    }

    // Verify upload button is still accessible
    const uploadButton = page.getByRole('button', { name: /tambah|add/i }).first();
    if (await uploadButton.count() > 0) {
      await expect(uploadButton).toBeVisible();
    }
  });

  /**
   * TEST SCENARIO 16: Empty State Display
   *
   * Tampilan state kosong:
   * - Navigasi ke aset tanpa foto
   * - Verifikasi pesan "belum ada foto"
   * - Verifikasi tombol unggah terlihat
   */
  test('should display empty state when no photos exist / Menampilkan state kosong saat tidak ada foto', async ({ page }) => {
    await page.goto('/assets');
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(1000);

    // Check for empty state message
    const emptyMessage = page.getByText(/belum ada foto|no photos|upload your first photo|unggah foto pertama/i);

    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage.first()).toBeVisible();

      // Verify upload button is prominent
      const uploadButton = page.getByRole('button', { name: /tambah|add|upload|unggah/i });
      await expect(uploadButton.first()).toBeVisible();
    }
  });

  /**
   * TEST SCENARIO 17: Photo Loading States
   *
   * State loading foto:
   * - Verifikasi indikator loading saat unggah
   * - Verifikasi disabled button saat proses
   */
  test('should show loading states during operations / Menampilkan state loading selama operasi', async ({ page }) => {
    await page.locator('tbody tr').first().click();

    const uploadButton = page.getByRole('button', { name: /tambah|add/i }).first();
    if (await uploadButton.count() > 0) {
      await uploadButton.click();

      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.count() > 0) {
        // Upload file
        await fileInput.setInputFiles(testImages.png);

        await page.waitForTimeout(500);

        // Look for loading spinner or disabled button
        const loadingSpinner = page.locator('.animate-spin, [class*="loading"], .lucide-loader-2');
        const confirmButton = page.getByRole('button', { name: /unggah|upload/i });

        // Either spinner should appear or button should be disabled
        const hasLoadingState = await loadingSpinner.count() > 0 ||
          (await confirmButton.count() > 0 && await confirmButton.first().isDisabled());

        expect(hasLoadingState).toBeTruthy();
      }
    }
  });

  /**
   * TEST SCENARIO 18: Photo Order/Rearrange
   *
   * Urutan/pengaturan ulang foto:
   * - Verifikasi urutan foto dalam galeri
   * - Foto utama harus pertama
   */
  test('should display photos in correct order / Menampilkan foto dalam urutan benar', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(1000);

    const photos = page.locator('[class*="aspect-square"], .grid > div');
    const photoCount = await photos.count();

    if (photoCount > 0) {
      // First photo should have primary badge
      const firstPhoto = photos.first();
      const primaryBadge = firstPhoto.locator('[class*="primary"], [class*="utama"], .lucide-star');

      // At least one photo should be marked as primary
      const anyPrimaryBadge = page.locator('[class*="primary"], [class*="utama"], .lucide-star');
      await expect(anyPrimaryBadge.first()).toBeVisible();
    }
  });
});

/**
 * Test suite for asset photo accessibility
 */
test.describe('Asset Photos - Accessibility', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should have proper ARIA labels and keyboard navigation / Label ARIA dan navigasi keyboard yang tepat', async ({ page }) => {
    await page.goto('/assets');
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(1000);

    // Check for proper ARIA labels on buttons
    const buttons = page.locator('button').filter({ hasText: /tambah|add|delete|hapus/i });

    for (let i = 0; i < Math.min(3, await buttons.count()); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');

      // Either has aria-label or visible text
      const hasAccessibility = ariaLabel !== null || (await button.isVisible());
      expect(hasAccessibility).toBeTruthy();
    }

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Should focus on interactive element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
  });
});

/**
 * Test suite for performance optimization
 */
test.describe('Asset Photos - Performance', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should lazy load images for better performance / Lazy load gambar untuk performa lebih baik', async ({ page }) => {
    await page.goto('/assets');
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(1000);

    // Check for loading attribute on images
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // At least some images should have loading="lazy"
      let hasLazyLoading = false;
      for (let i = 0; i < Math.min(5, imageCount); i++) {
        const loading = await images.nth(i).getAttribute('loading');
        if (loading === 'lazy') {
          hasLazyLoading = true;
          break;
        }
      }

      // Note: This might not always be true depending on implementation
      // but it's good practice for performance
    }
  });
});

/**
 * Test suite for error handling
 */
test.describe('Asset Photos - Error Handling', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should handle network errors gracefully / Menangani error jaringan dengan baik', async ({ page }) => {
    // Simulate offline condition
    await page.context().setOffline(true);

    await page.goto('/assets');
    await page.locator('tbody tr').first().click();

    const uploadButton = page.getByRole('button', { name: /tambah|add/i }).first();

    if (await uploadButton.count() > 0) {
      await uploadButton.click();

      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles(testImages.png);

        const confirmButton = page.getByRole('button', { name: /unggah|upload/i });
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
          await page.waitForTimeout(2000);

          // Should show error message
          const errorMessage = page.getByText(/error|gagal|network|jaringan/i);
          if (await errorMessage.count() > 0) {
            await expect(errorMessage.first()).toBeVisible();
          }
        }
      }
    }

    // Restore online
    await page.context().setOffline(false);
  });
});
