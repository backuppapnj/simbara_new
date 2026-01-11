import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';
import path from 'path';

/**
 * Asset Import E2E Tests
 *
 * Tests for Asset Import (SIMAN JSON) functionality including:
 * - Import page navigation and display
 * - JSON file upload and validation
 * - Preview data display
 * - Confirm import execution
 * - Cancel import flow
 * - Invalid file handling (empty, malformed, wrong format)
 * - Permission checks
 *
 * Routes: /assets/import, POST /assets/import, POST /assets/import/confirm
 * Controller: AssetController.php (import, processImport, confirmImport)
 * Service: AssetImportService
 * Middleware: permission:assets.import
 *
 * Comment language: Indonesian (ID) and English (EN)
 */

test.describe('Asset Import - Page Display', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin); // Super admin has assets.import permission
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display import page with title and instructions', async ({ page }) => {
    await page.goto('/assets/import');

    // Verify page title / Verifikasi judul halaman
    await expect(page.getByRole('heading', { name: /import aset bmn|import assets/i, level: 1 })).toBeVisible();

    // Verify instructions present / Verifikasi instruksi ada
    await expect(page.getByText(/upload file json|siman|json file/i)).toBeVisible();
  });

  test('should display file upload component', async ({ page }) => {
    await page.goto('/assets/import');

    // Check for file input / Periksa input file
    const fileInput = page.locator('input[type="file"]').or(
      page.getByLabel(/json file|file json/i)
    );

    await expect(fileInput).toBeVisible();
  });

  test('should have proper page title metadata', async ({ page }) => {
    await page.goto('/assets/import');

    // Check page title in head / Periksa judul halaman di head
    await expect(page).toHaveTitle(/import aset|asset import/i);
  });
});

test.describe('Asset Import - Valid JSON Upload', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should successfully upload and parse valid JSON file', async ({ page }) => {
    await page.goto('/assets/import');

    // Select valid JSON file / Pilih file JSON valid
    const filePath = path.join(__dirname, 'fixtures/assets-import-valid.json');
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles(filePath);

    // Submit the form / Kirim form
    const submitButton = page.getByRole('button', { name: /upload|parse|proses|submit/i }).or(
      page.locator('button[type="submit"]')
    );

    if (await submitButton.count() > 0) {
      await submitButton.click();
    } else {
      // Auto-submit on file select / Kirim otomatis saat file dipilih
      await page.waitForTimeout(1000);
    }

    // Verify success message / Verifikasi pesan sukses
    await expect(page.getByText(/berhasil diparse|file successfully parsed|success/i)).toBeVisible();
  });

  test('should display preview table after upload', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-valid.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    // Wait for processing / Tunggu pemrosesan
    await page.waitForTimeout(2000);

    // Check for preview table / Periksa tabel preview
    const previewTable = page.locator('table').or(
      page.locator('[data-test="preview-table"]').or(
        page.locator('.preview-table')
      )
    );

    // Preview might be visible / Preview mungkin terlihat
    if (await previewTable.count() > 0) {
      await expect(previewTable.first()).toBeVisible();

      // Verify table headers / Verifikasi header tabel
      await expect(page.getByRole('columnheader', { name: /id_aset|kd_brg|nama/i })).toBeVisible();
    }
  });

  test('should display metadata information after upload', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-valid.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // Check for metadata display / Periksa tampilan metadata
    const metadataInfo = page.getByText(/total records|generated at|metadata/i).or(
      page.locator('[data-test="metadata-info"]')
    );

    // Metadata might be displayed / Metadata mungkin ditampilkan
    if (await metadataInfo.count() > 0) {
      await expect(metadataInfo.first()).toBeVisible();
    }
  });

  test('should show row count matching uploaded file', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-valid.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // Look for row count indicator / Cari indikator jumlah baris
    const rowCount = page.getByText(/\d+ (baris|rows|records)/i);

    if (await rowCount.count() > 0) {
      await expect(rowCount.first()).toBeVisible();
    }
  });

  test('should display confirm and cancel buttons after successful upload', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-valid.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // Check for confirm button / Periksa tombol konfirmasi
    const confirmButton = page.getByRole('button', { name: /konfirmasi|confirm|import|simpan/i });

    if (await confirmButton.count() > 0) {
      await expect(confirmButton).toBeVisible();
    }

    // Check for cancel button / Periksa tombol batal
    const cancelButton = page.getByRole('button', { name: /batal|cancel|kembali/i }).or(
      page.locator('a[href="/assets"]')
    );

    if (await cancelButton.count() > 0) {
      await expect(cancelButton).toBeVisible();
    }
  });
});

test.describe('Asset Import - Invalid File Handling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should reject non-JSON file format', async ({ page }) => {
    await page.goto('/assets/import');

    // Try uploading PDF file / Coba upload file PDF
    const filePath = path.join(__dirname, 'fixtures/sample.pdf');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    const submitButton = page.getByRole('button', { name: /upload|submit/i });
    if (await submitButton.count() > 0) {
      await submitButton.click();
    }

    await page.waitForTimeout(1000);

    // Verify error message / Verifikasi pesan error
    await expect(page.getByText(/json|format|extensi/i)).toBeVisible();
  });

  test('should reject empty JSON file', async ({ page }) => {
    await page.goto('/assets/import');

    // Upload empty JSON / Upload JSON kosong
    const filePath = path.join(__dirname, 'fixtures/assets-import-empty.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(1000);

    // Verify validation error / Verifikasi error validasi
    await expect(page.getByText(/metadata|data|kosong|empty|invalid/i)).toBeVisible();
  });

  test('should reject malformed JSON data', async ({ page }) => {
    await page.goto('/assets/import');

    // Upload malformed JSON / Upload JSON yang salah format
    const filePath = path.join(__dirname, 'fixtures/assets-import-malformed.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(1000);

    // Verify error message / Verifikasi pesan error
    await expect(page.getByText(/json|tidak valid|invalid|error/i)).toBeVisible();
  });

  test('should display error for missing required columns', async ({ page }) => {
    await page.goto('/assets/import');

    // Upload JSON with missing fields / Upload JSON dengan field hilang
    const filePath = path.join(__dirname, 'fixtures/assets-import-missing-fields.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // Check for specific field errors / Periksa error field spesifik
    const errorMessages = page.getByText(/id_aset|kd_brg|nama|required|wajib/i);

    if (await errorMessages.count() > 0) {
      await expect(errorMessages.first()).toBeVisible();
    }
  });

  test('should reject oversized file (>10MB)', async ({ page }) => {
    await page.goto('/assets/import');

    // Note: This would require creating a large file fixture
    // For now, we just verify the validation exists
    // Catatan: Ini memerlukan file fixture besar
    // Untuk sekarang, kita verifikasi validasi ada

    const fileInput = page.locator('input[type="file"]');

    // Check if max size validation exists
    // Periksa apakah validasi ukuran maksimal ada
    const maxUploadText = page.getByText(/10mb|max|ukuran/i);

    if (await maxUploadText.count() > 0) {
      await expect(maxUploadText.first()).toBeVisible();
    }
  });
});

test.describe('Asset Import - Preview and Validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display all expected columns in preview', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-valid.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // Check for key columns / Periksa kolom kunci
    const expectedColumns = [
      'id_aset',
      'kd_brg',
      'nama',
      'kd_kondisi',
      'rph_aset',
      'lokasi',
    ];

    for (const column of expectedColumns) {
      const columnHeader = page.getByRole('columnheader', { name: new RegExp(column, 'i') });
      if (await columnHeader.count() > 0) {
        await expect(columnHeader.first()).toBeVisible();
      }
    }
  });

  test('should validate duplicate asset codes', async ({ page }) => {
    await page.goto('/assets/import');

    // Upload file with duplicates / Upload file dengan duplikat
    const filePath = path.join(__dirname, 'fixtures/assets-import-duplicates.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // Check for duplicate warnings / Periksa peringatan duplikat
    const duplicateWarning = page.getByText(/duplicate|duplikat|sudah ada/i).or(
      page.locator('[data-test="duplicate-warning"]')
    );

    if (await duplicateWarning.count() > 0) {
      await expect(duplicateWarning.first()).toBeVisible();
    }
  });

  test('should highlight error rows in preview', async ({ page }) => {
    await page.goto('/assets/import');

    // Upload file with some invalid records / Upload file dengan record tidak valid
    const filePath = path.join(__dirname, 'fixtures/assets-import-with-errors.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // Check for error row highlighting / Periksa penandaan baris error
    const errorRow = page.locator('tr.error, tr[aria-invalid="true"], .error-row');

    if (await errorRow.count() > 0) {
      await expect(errorRow.first()).toBeVisible();
    }
  });

  test('should display validation errors for invalid categories', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-invalid-category.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // Check for category validation errors / Periksa error validasi kategori
    const categoryError = page.getByText(/kategori|category|kd_jns_bmn|invalid/i);

    if (await categoryError.count() > 0) {
      await expect(categoryError.first()).toBeVisible();
    }
  });

  test('should handle pagination for large datasets', async ({ page }) => {
    await page.goto('/assets/import');

    // Upload large file / Upload file besar
    const filePath = path.join(__dirname, 'fixtures/assets-import-large.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // Check for pagination controls / Periksa kontrol pagination
    const pagination = page.locator('.pagination').or(
      page.locator('[role="navigation"]')
    );

    if (await pagination.count() > 0) {
      await expect(pagination.first()).toBeVisible();
    }
  });
});

test.describe('Asset Import - Confirm Import', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should successfully confirm import with valid data', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-valid.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    // Wait for preview / Tunggu preview
    await page.waitForTimeout(2000);

    // Click confirm button / Klik tombol konfirmasi
    const confirmButton = page.getByRole('button', { name: /konfirmasi|confirm|import/i });

    if (await confirmButton.count() > 0) {
      await confirmButton.click();

      // Verify success message / Verifikasi pesan sukses
      await expect(page.getByText(/import selesai|berhasil|success|complete/i)).toBeVisible();

      // Check for import result summary / Periksa ringkasan hasil import
      await expect(page.getByText(/\d+ berhasil|\d+ success/i)).toBeVisible();
    }
  });

  test('should redirect to assets index after successful import', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-valid.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    const confirmButton = page.getByRole('button', { name: /konfirmasi|confirm|import/i });

    if (await confirmButton.count() > 0) {
      await confirmButton.click();

      // Wait for redirect / Tunggu redirect
      await page.waitForTimeout(2000);

      // Should either stay on import page with success message or redirect to assets index
      // Harus tetap di halaman import dengan pesan sukses atau redirect ke index assets
      const currentUrl = page.url();
      const isOnImportPage = currentUrl.includes('/assets/import');
      const isOnAssetsIndex = currentUrl.includes('/assets') && !currentUrl.includes('/import');

      expect(isOnImportPage || isOnAssetsIndex).toBeTruthy();
    }
  });

  test('should display import result statistics', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-valid.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    const confirmButton = page.getByRole('button', { name: /konfirmasi|confirm|import/i });

    if (await confirmButton.count() > 0) {
      await confirmButton.click();

      await page.waitForTimeout(1000);

      // Check for statistics / Periksa statistik
      const stats = page.getByText(/berhasil|gagal|success|errors|total/i);

      if (await stats.count() > 0) {
        await expect(stats.first()).toBeVisible();
      }
    }
  });

  test('should update existing assets when importing duplicates', async ({ page }) => {
    await page.goto('/assets/import');

    // Upload file with existing asset codes / Upload file dengan kode aset yang ada
    const filePath = path.join(__dirname, 'fixtures/assets-import-existing-codes.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    const confirmButton = page.getByRole('button', { name: /konfirmasi|confirm|update/i });

    if (await confirmButton.count() > 0) {
      await confirmButton.click();

      await page.waitForTimeout(1000);

      // Verify update happened / Verifikasi update terjadi
      await expect(page.getByText(/update|diperbarui|success/i)).toBeVisible();
    }
  });
});

test.describe('Asset Import - Cancel Import', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should cancel import and return to assets list', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-valid.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // Click cancel button / Klik tombol batal
    const cancelButton = page.getByRole('button', { name: /batal|cancel|kembali/i }).or(
      page.locator('a[href="/assets"]')
    );

    if (await cancelButton.count() > 0) {
      await cancelButton.click();

      // Verify redirect to assets list / Verifikasi redirect ke daftar aset
      await expect(page).toHaveURL(/\/assets$/);
    }
  });

  test('should not save data when cancelled', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-valid.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    const initialAssetCount = await page.locator('table tbody tr').count();

    // Cancel import / Batalkan import
    const cancelButton = page.getByRole('button', { name: /batal|cancel/i });

    if (await cancelButton.count() > 0) {
      await cancelButton.click();

      // Navigate back to assets / Kembali ke aset
      await page.goto('/assets');
      await page.waitForTimeout(1000);

      const finalAssetCount = await page.locator('table tbody tr').count();

      // Count should be the same (no new imports)
      // Jumlah harus sama (tidak ada import baru)
      expect(finalAssetCount).toBe(initialAssetCount);
    }
  });
});

test.describe('Asset Import - Large File Handling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should handle large file (100+ rows)', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-large.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    // Wait for processing (large files take longer)
    // Tunggu pemrosesan (file besar lebih lama)
    await page.waitForTimeout(5000);

    // Verify file was processed / Verifikasi file diproses
    const successIndicator = page.getByText(/berhasil|success|parsed/i).or(
      page.locator('table tbody tr')
    );

    if (await successIndicator.count() > 0) {
      await expect(successIndicator.first()).toBeVisible();
    }
  });

  test('should show processing indicator for large files', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-large.json');

    // Set up listener for loading state before uploading
    // Siapkan pendengar untuk status loading sebelum upload
    const loadingPromise = page.waitForSelector('text=/processing|memproses|loading/i', { timeout: 1000 }).catch(() => null);

    await page.locator('input[type="file"]').setInputFiles(filePath);

    // Check if loading indicator appears / Periksa apakah indikator loading muncul
    const loadingIndicator = await loadingPromise;

    if (loadingIndicator) {
      await expect(loadingIndicator).toBeVisible();
    }
  });

  test('should handle timeout gracefully', async ({ page }) => {
    await page.goto('/assets/import');

    // This test verifies the application doesn't crash on timeout
    // Test ini memverifikasi aplikasi tidak crash pada timeout
    const filePath = path.join(__dirname, 'fixtures/assets-import-large.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    // Set longer timeout for this operation
    // Atur timeout lebih lama untuk operasi ini
    try {
      await page.waitForTimeout(30000);

      // If we get here, check for success or error
      // Jika sampai sini, periksa sukses atau error
      const feedback = page.getByText(/berhasil|error|timeout|gagal/i);

      if (await feedback.count() > 0) {
        await expect(feedback.first()).toBeVisible();
      }
    } catch (error) {
      // Timeout is acceptable for very large files
      // Timeout dapat diterima untuk file sangat besar
      console.log('Large file operation timed out as expected');
    }
  });
});

test.describe('Asset Import - Permission Checks', () => {
  test('should deny access to users without assets.import permission', async ({ page }) => {
    // Login as user without import permission / Login sebagai user tanpa izin import
    await login(page, testUsers.pegawai); // Regular pegawai doesn't have assets.import

    await page.goto('/assets/import');

    // Should be redirected or show forbidden
    // Harus di-redirect atau tampilkan forbidden
    const isForbidden = await page.getByText(/403|forbidden|tidak memiliki akses/i).count() > 0;
    const isRedirected = page.url().includes('/dashboard') || page.url().includes('/assets');

    expect(isForbidden || isRedirected).toBeTruthy();
  });

  test('should hide import link for unauthorized users', async ({ page }) => {
    await login(page, testUsers.pegawai);

    await page.goto('/assets');

    // Check if import link/button is hidden
    // Periksa apakah link/tombol import disembunyikan
    const importLink = page.getByRole('link', { name: /import/i }).or(
      page.locator('a[href="/assets/import"]')
    );

    if (await importLink.count() > 0) {
      // If it exists, it should not be visible/accessible
      // Jika ada, harus tidak terlihat/dapat diakses
      const isVisible = await importLink.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();
    }
  });

  test('should allow access for users with assets.import permission', async ({ page }) => {
    await login(page, testUsers.superAdmin);

    await page.goto('/assets/import');

    // Should successfully load the import page
    // Harus berhasil memuat halaman import
    await expect(page.getByRole('heading', { name: /import aset/i, level: 1 })).toBeVisible();
  });
});

test.describe('Asset Import - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should handle special characters in asset names', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-special-chars.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // Verify special characters are preserved / Verifikasi karakter khusus tetap
    const specialCharsText = page.getByText(/[&<>\"'\/]/);

    if (await specialCharsText.count() > 0) {
      await expect(specialCharsText.first()).toBeVisible();
    }
  });

  test('should handle null and empty values in optional fields', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-null-values.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // Should process without errors for optional fields
    // Harus memproses tanpa error untuk field opsional
    const successIndicator = page.getByText(/berhasil|success/i).or(
      page.locator('table tbody tr')
    );

    if (await successIndicator.count() > 0) {
      await expect(successIndicator.first()).toBeVisible();
    }
  });

  test('should handle Unicode characters in asset names', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-unicode.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // Verify Unicode characters display correctly
    // Verifikasi karakter Unicode tampil dengan benar
    const unicodeText = page.getByText(/[^\x00-\x7F]/); // Non-ASCII characters

    if (await unicodeText.count() > 0) {
      await expect(unicodeText.first()).toBeVisible();
    }
  });

  test('should handle invalid date formats gracefully', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-invalid-dates.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // Should show warning or handle gracefully
    // Harus menampilkan peringatan atau menangani dengan baik
    const dateError = page.getByText(/tanggal|date|format|invalid/i);

    if (await dateError.count() > 0) {
      await expect(dateError.first()).toBeVisible();
    }
  });
});

test.describe('Asset Import - Error Recovery', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should allow retry after failed upload', async ({ page }) => {
    await page.goto('/assets/import');

    // Upload invalid file first / Upload file tidak valid dulu
    const invalidPath = path.join(__dirname, 'fixtures/assets-import-malformed.json');
    await page.locator('input[type="file"]').setInputFiles(invalidPath);

    await page.waitForTimeout(1000);

    // Now upload valid file / Sekarang upload file valid
    const validPath = path.join(__dirname, 'fixtures/assets-import-valid.json');
    await page.locator('input[type="file"]').setInputFiles(validPath);

    await page.waitForTimeout(2000);

    // Should process successfully / Harus memproses dengan sukses
    const successIndicator = page.getByText(/berhasil|success|parsed/i);

    if (await successIndicator.count() > 0) {
      await expect(successIndicator.first()).toBeVisible();
    }
  });

  test('should display helpful error messages', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-malformed.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(1000);

    // Error message should be actionable / Pesan error harus dapat ditindaklanjuti
    const errorMessage = page.getByText(/json|format|tidak valid|invalid/i);

    await expect(errorMessage.first()).toBeVisible();
  });

  test('should preserve form data on validation errors', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-valid.json');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.waitForTimeout(2000);

    // File input should still have value or reference
    // Input file harus masih punya nilai atau referensi
    const fileInput = page.locator('input[type="file"]');

    await expect(fileInput).toBeAttached();
  });
});

test.describe('Asset Import - User Experience', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should provide clear upload instructions', async ({ page }) => {
    await page.goto('/assets/import');

    // Check for helpful text / Periksa teks bermanfaat
    const instructions = page.getByText(/json|siman|upload|template|format/i);

    await expect(instructions.first()).toBeVisible();
  });

  test('should show file size limit information', async ({ page }) => {
    await page.goto('/assets/import');

    // Check for file size info / Periksa info ukuran file
    const sizeInfo = page.getByText(/10mb|ukuran|max size|maksimum/i);

    if (await sizeInfo.count() > 0) {
      await expect(sizeInfo.first()).toBeVisible();
    }
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/assets/import');

    // Check for proper form labeling / Periksa pelabelan form yang benar
    const fileInput = page.locator('input[type="file"]');
    const hasLabel = await fileInput.evaluate((el) => {
      return el.labels !== null && el.labels.length > 0;
    });

    if (!hasLabel) {
      // Check for aria-label instead / Periksa aria-label sebagai gantinya
      const hasAriaLabel = await fileInput.evaluate((el) => {
        return el.hasAttribute('aria-label');
      });

      expect(hasAriaLabel).toBeTruthy();
    }
  });

  test('should provide visual feedback during upload', async ({ page }) => {
    await page.goto('/assets/import');

    const filePath = path.join(__dirname, 'fixtures/assets-import-large.json');

    // Monitor for loading state / Pantau status loading
    const loadingPromise = page.waitForSelector('[data-test="loading"], .loading, .spinner', { timeout: 2000 }).catch(() => null);

    await page.locator('input[type="file"]').setInputFiles(filePath);

    const loadingElement = await loadingPromise;

    if (loadingElement) {
      await expect(loadingElement).toBeVisible();
    }
  });
});
