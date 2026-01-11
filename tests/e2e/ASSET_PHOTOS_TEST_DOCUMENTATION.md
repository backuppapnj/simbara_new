# Asset Photos E2E Tests Documentation
# Dokumentasi Pengujian E2E Foto Aset

## Overview / Ringkasan

Comprehensive end-to-end test suite for the Asset Photos management feature in the PA Penajam Asset & Persediaan System.

Test suite lengkap untuk fitur pengelolaan Foto Aset dalam Sistem Asset & Persediaan PA Penajam.

## Test File / File Pengujian

**Location / Lokasi:** `/tests/e2e/asset-photos.spec.ts`

**Support Files / File Pendukung:**
- `/tests/e2e/support/test-images.ts` - Test image generation utilities
- `/tests/e2e/support/auth.ts` - Authentication helpers
- `/tests/e2e/support/test-users.ts` - Test user credentials

## Test Coverage / Cakupan Pengujian

### Main Test Scenarios / Skenario Utama

| # | Test Name | Indonesia | Route | Description |
|---|-----------|-----------|-------|-------------|
| 1 | View Asset Photos Gallery | Melihat Galeri Foto Aset | `GET /assets/{id}/photos` | Verify gallery displays all photos correctly |
| 2 | Upload Photo from File | Mengunggah Foto dari File | `POST /assets/{id}/photos` | Upload photo from system file picker |
| 3 | Upload Photo from Camera | Mengunggah Foto dari Kamera | `POST /assets/{id}/photos` | Capture and upload via device camera |
| 4 | Crop Image Before Upload | Memotong Gambar Sebelum Unggah | - | Use image cropper before saving |
| 5 | Set Photo as Primary | Menetapkan Foto Utama | `PUT /assets/{assetId}/photos/{photoId}` | Mark photo as primary/main |
| 6 | Update Photo Caption | Memperbarui Keterangan Foto | `PUT /assets/{assetId}/photos/{photoId}` | Add/edit photo caption |
| 7 | Delete Photo | Menghapus Foto | `DELETE /assets/{assetId}/photos/{photoId}` | Remove photo with confirmation |
| 8 | Delete Primary Photo | Menghapus Foto Utama | `DELETE /assets/{assetId}/photos/{photoId}` | Handle primary photo deletion |
| 9 | Multiple Photo Upload | Unggah Banyak Foto | `POST /assets/{id}/photos` | Upload multiple photos simultaneously |
| 10 | Photo File Validation | Validasi File Foto | `POST /assets/{id}/photos` | Validate file type and size |
| 11 | Photo Gallery Pagination | Paginasi Galeri Foto | `GET /assets/{id}/photos` | Navigate through paginated gallery |
| 12 | Download Photo | Mengunduh Foto | - | Download photo to local device |
| 13 | Photo Lightbox/Fullscreen | Lightbox/Tampilan Penuh | - | View photos in fullscreen mode |
| 14 | Permission Checks | Pemeriksaan Izin | All | Verify RBAC for photo operations |
| 15 | Responsive Design | Desain Responsif | - | Test on mobile viewport |
| 16 | Empty State Display | Tampilan Kosong | `GET /assets/{id}/photos` | Show message when no photos |
| 17 | Photo Loading States | State Loading Foto | `POST /assets/{id}/photos` | Display loading indicators |
| 18 | Photo Order/Rearrange | Urutan Foto | - | Verify primary photo is first |

### Additional Test Suites / Suite Pengujian Tambahan

**Accessibility / Aksesibilitas:**
- ARIA labels on buttons
- Keyboard navigation support
- Focus management

**Performance / Performa:**
- Lazy loading for images
- Optimized rendering

**Error Handling / Penanganan Error:**
- Network error handling
- Invalid file handling
- Server error responses

## Component Integration / Integrasi Komponen

### Tested Components / Komponen yang Diuji

1. **AssetPhotoGallery** (`/resources/js/components/assets/AssetPhotoGallery.tsx`)
   - Photo grid display
   - Primary photo badge
   - Hover actions (set primary, delete)
   - Lightbox modal
   - Empty state

2. **AssetPhotoUpload** (`/resources/js/components/assets/AssetPhotoUpload.tsx`)
   - File upload button
   - Camera capture button
   - Caption input
   - Upload progress
   - Form validation

3. **CameraCapture** (`/resources/js/components/camera/camera-capture.tsx`)
   - Video stream display
   - Capture button
   - Camera switch (mobile)
   - Permission handling

4. **ImageCropper** (`/resources/js/components/camera/image-cropper.tsx`)
   - Image preview
   - Rotate controls
   - Zoom controls
   - Confirm/cancel actions

## Running the Tests / Menjalankan Pengujian

### Run All Asset Photos Tests / Jalankan Semua Tes
```bash
npx playwright test asset-photos.spec.ts
```

### Run Specific Test / Jalankan Tes Tertentu
```bash
# Run by test name
npx playwright test asset-photos.spec.ts --grep "should upload photo from file"

# Run by line number
npx playwright test asset-photos.spec.ts:95
```

### Run with UI Mode / Jalankan dengan Mode UI
```bash
npx playwright test asset-photos.spec.ts --ui
```

### Run with Debugging / Jalankan dengan Debug
```bash
npx playwright test asset-photos.spec.ts --debug
```

### Run on Specific Browser / Jalankan di Browser Tertentu
```bash
npx playwright test asset-photos.spec.ts --project=chromium
npx playwright test asset-photos.spec.ts --project=firefox
npx playwright test asset-photos.spec.ts --project=webkit
```

## Test Data / Data Pengujian

### Test Images / Gambar Uji

Test images are generated programmatically using the helper in `/tests/e2e/support/test-images.ts`:

Gambar uji dibuat secara terprogram menggunakan helper di `/tests/e2e/support/test-images.ts`:

```typescript
import { testImages, createMultipleTestImages } from './support/test-images';

// Single PNG image
await fileInput.setInputFiles(testImages.png);

// Single JPEG image
await fileInput.setInputFiles(testImages.jpg);

// Invalid file (for validation testing)
await fileInput.setInputFiles(testImages.invalid);

// Multiple images
await fileInput.setInputFiles(createMultipleTestImages(3));
```

### Test Users / Pengguna Uji

The tests use predefined test users from `/tests/e2e/support/test-users.ts`:

Pengujian menggunakan pengguna uji yang telah didefinisikan dari `/tests/e2e/support/test-users.ts`:

- **Super Admin** (`admin@pa-penajam.go.id`) - Full access to all features
- **Pegawai** (`pegawai@demo.com`) - Limited access for permission testing

## Key Features Tested / Fitur Utama yang Diuji

### 1. Photo Upload / Unggah Foto
- ✅ File picker integration
- ✅ Camera capture (device-dependent)
- ✅ Drag and drop support
- ✅ Multiple file upload
- ✅ Progress indicators
- ✅ Success/error messages

### 2. Image Editing / Edit Gambar
- ✅ Crop functionality
- ✅ Rotate controls
- ✅ Zoom controls
- ✅ Preview before save

### 3. Gallery Management / Manajemen Galeri
- ✅ Grid layout display
- ✅ Responsive columns (2-6)
- ✅ Primary photo badge
- ✅ Hover actions
- ✅ Empty state
- ✅ Pagination

### 4. Photo Actions / Aksi Foto
- ✅ Set as primary
- ✅ Delete with confirmation
- ✅ Update caption
- ✅ Download
- ✅ Lightbox view

### 5. Validation / Validasi
- ✅ File type check (images only)
- ✅ File size limit (5MB)
- ✅ Required fields
- ✅ Error messages

### 6. Permissions / Izin
- ✅ RBAC integration
- ✅ Permission-based UI
- ✅ Access control
- ✅ Unauthorized handling

## Known Limitations / Keterbatasan yang Diketahui

### Camera Testing / Pengujian Kamera

Camera functionality tests are marked with `test.skip()` because:

Pengujian fungsionalitas kamera ditandai dengan `test.skip()` karena:

1. **CI Environment** - Most CI environments don't have camera hardware
   - **Lingkungan CI** - Sebagian besar lingkungan CI tidak memiliki perangkat kamera

2. **Permission Requirements** - Requires user interaction to grant permissions
   - **Persyaratan Izin** - Memerlukan interaksi pengguna untuk memberikan izin

3. **Headless Mode** - Playwright's headless mode doesn't support camera access
   - **Mode Headless** - Mode headless Playwright tidak mendukung akses kamera

**Solution / Solusi:** Run camera tests manually on a real device using headed mode:
**Solusi:** Jalankan tes kamera secara manual pada perangkat nyata menggunakan mode headed:

```bash
npx playwright test asset-photos.spec.ts --grep "camera" --headed
```

### Test Fixtures / Fixture Pengujian

The test images are minimal (1x1 pixels) for performance reasons:

Gambar uji minimal (1x1 piksel) karena alasan performa:

- Fast upload times
- Minimal bandwidth usage
- Sufficient for functional testing

For visual testing with real images, generate larger fixtures using:

Untuk pengujian visual dengan gambar nyata, buat fixture yang lebih besar menggunakan:

```bash
cd tests/e2e/fixtures
./setup-fixtures.sh
```

## Best Practices / Praktik Terbaik

### Writing New Tests / Menulis Tes Baru

1. **Use Test Helpers / Gunakan Helper Tes**
   ```typescript
   import { testImages } from './support/test-images';
   import { login, logout } from './support/auth';
   ```

2. **Bilingual Comments / Komentar Bilingual**
   - Always provide both Indonesian and English descriptions
   - Selalu berikan deskripsi bahasa Indonesia dan Inggris

3. **Selector Strategy / Strategi Selektor**
   - Prefer ARIA roles: `page.getByRole('button', { name: /upload/i })`
   - Use test IDs when available: `page.locator('[data-testid="upload-btn"]')`
   - Avoid fragile CSS selectors

4. **Wait Strategies / Strategi Tunggu**
   - Use `waitForTimeout()` sparingly
   - Prefer explicit waits: `await expect(element).toBeVisible()`
   - Wait for network responses when uploading

5. **Cleanup / Pembersihan**
   - Always logout after each test
   - Restore original state when modifying data
   - Use `test.afterEach()` for cleanup

### Debugging Failed Tests / Debug Tes Gagal

1. **Run with UI Mode / Jalankan dengan Mode UI**
   ```bash
   npx playwright test asset-photos.spec.ts --ui
   ```

2. **Use Debug Mode / Gunakan Mode Debug**
   ```bash
   npx playwright test asset-photos.spec.ts --debug
   ```

3. **Check Screenshots / Periksa Screenshot**
   Screenshots are saved to `/test-results/` on failure.

4. **View Trace / Lihat Trace**
   ```bash
   npx playwright show-trace test-results/trace.zip
   ```

## Troubleshooting / Pemecahan Masalah

### Common Issues / Masalah Umum

**Issue:** Tests timeout when uploading files
**Issue:** Tes waktu habis saat mengunggah file
**Solution:** Check network speed, increase timeout, verify file size
**Solusi:** Periksa kecepatan jaringan, tingkatkan batas waktu, verifikasi ukuran file

**Issue:** Element not found errors
**Issue:** Elemen tidak ditemukan
**Solution:** Verify selectors, check if element is in shadow DOM, use `page.waitForSelector()`
**Solusi:** Verifikasi selektor, periksa apakah elemen di shadow DOM, gunakan `page.waitForSelector()`

**Issue:** File input not working
**Issue:** Input file tidak berfungsi
**Solution:** Ensure input is visible, not hidden, and has correct attributes
**Solusi:** Pastikan input terlihat, tidak tersembunyi, dan memiliki atribut yang benar

**Issue:** Permission denied errors
**Issue:** Izin ditolak
**Solution:** Check user permissions, verify RBAC configuration
**Solusi:** Periksa izin pengguna, verifikasi konfigurasi RBAC

## Continuous Integration / Integrasi Berkelanjutan

The tests are configured to run in CI:

Pengujian dikonfigurasi untuk berjalan di CI:

```yaml
# .github/workflows/e2e.yml
- name: Run E2E Tests
  run: npx playwright test asset-photos.spec.ts
```

**CI Considerations / Pertimbangan CI:**
- Tests run in headless mode by default
- Camera tests are skipped in CI
- Screenshots and videos captured on failure
- Results published as HTML reports

## Related Documentation / Dokumentasi Terkait

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Laravel Boost Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Project E2E README](/tests/e2e/README.md)

## Contributing / Berkontribusi

When adding new tests:

Saat menambahkan tes baru:

1. Follow existing patterns in this file
2. Add both Indonesian and English comments
3. Use helper functions where available
4. Update this documentation
5. Run `vendor/bin/pint` before committing
6. Test locally before pushing

1. Ikuti pola yang ada di file ini
2. Tambahkan komentar bahasa Indonesia dan Inggris
3. Gunakan fungsi helper jika tersedia
4. Perbarui dokumentasi ini
5. Jalankan `vendor/bin/pint` sebelum melakukan commit
6. Uji secara lokal sebelum push

## Version History / Riwayat Versi

- **v1.0.0** (2025-01-11) - Initial comprehensive test suite
- **v1.0.0** (2025-01-11) - Suite pengujian komprehensif awal

---

**Last Updated / Terakhir Diperbarui:** 2025-01-11
**Test Suite Maintainer / Pengelola Suite Pengujian:** E2E Testing Team
**Project / Proyek:** Asset & Persediaan Management System (PA Penajam)
