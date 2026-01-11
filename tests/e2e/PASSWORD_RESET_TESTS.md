# Password Reset E2E Tests / Uji E2E Reset Password

## Overview / Ringkasan

Comprehensive Playwright E2E test suite for the password reset functionality in the Asset & Persediaan Management System. This suite covers the complete password reset flow from forgot password to successful login with new password.

Uji E2E Playwright komprehensif untuk fungsionalitas reset password di Sistem Manajemen Aset & Persediaan. Suite ini mencakup alur reset password lengkap dari lupa password hingga login sukses dengan password baru.

## File Location / Lokasi File

```
tests/e2e/auth-password-reset.spec.ts
```

## Test Coverage / Cakupan Tes

### Total Tests: 36

#### 1. Forgot Password Page (9 tests)
- Page display verification / Verifikasi tampilan halaman
- Navigation from login page / Navigasi dari halaman login
- Email format validation / Validasi format email
- Required field validation / Validasi field wajib
- Success message for valid email / Pesan sukses untuk email valid
- Security: same message for non-existent email / Keamanan: pesan sama untuk email tidak ada
- Button disabled during processing / Tombol disabled saat memproses
- Loading spinner / Spinner loading
- Navigation back to login / Navigasi kembali ke login

#### 2. Reset Password Page (6 tests)
- Page display with token / Tampilan halaman dengan token
- Password confirmation mismatch validation / Validasi konfirmasi password tidak cocok
- Empty password fields validation / Validasi field password kosong
- Weak password validation / Validasi password lemah
- Invalid token handling / Penanganan token tidak valid
- Button state during processing / Status tombol saat memproses

#### 3. Full Flow Integration (3 tests)
- Complete password reset flow / Alur reset password lengkap
- Login with new password after reset / Login dengan password baru setelah reset
- Old password no longer works / Password lama tidak bisa dipakai

#### 4. Security & Edge Cases (9 tests)
- Email enumeration prevention / Pencegahan enumerasi email
- Rate limiting for requests / Rate limiting untuk permintaan
- Special characters in password / Karakter spesial dalam password
- Token expiration (60 minutes) / Kadaluarsa token (60 menit)
- Token is single-use / Token hanya sekali pakai
- Redirect to login after success / Redirect ke login setelah sukses
- Very long passwords / Password sangat panjang
- Email in query parameter / Email di parameter query
- Unicode in email address / Unicode di alamat email

#### 5. UI & UX (5 tests)
- Proper input types for security / Tipe input yang benar untuk keamanan
- Autocomplete attributes / Atribut autocomplete
- Auto-focus on fields / Auto-focus pada field
- Clear fields after successful reset / Hapus field setelah reset sukses
- Loading spinner display / Tampilan spinner loading

#### 6. Accessibility (4 tests)
- ARIA labels and roles / Label dan peran ARIA
- Keyboard navigation / Navigasi keyboard
- Error message accessibility / Aksesibilitas pesan error
- Form structure / Struktur form

## Routes Tested / Route yang Diuji

```php
GET  /forgot-password              - Show forgot password form
POST /forgot-password              - Send reset link
GET  /reset-password/{token}       - Show reset form
POST /reset-password               - Reset password
```

## Controllers Tested / Controller yang Diuji

- `App\Http\Controllers\Auth\PasswordResetLinkController`
- `App\Http\Controllers\Auth\NewPasswordController`

## Pages Tested / Halaman yang Diuji

- `resources/js/pages/auth/forgot-password.tsx`
- `resources/js/pages/auth/reset-password.tsx`

## Running the Tests / Menjalankan Tes

### Run all password reset tests / Jalankan semua tes reset password:
```bash
npx playwright test tests/e2e/auth-password-reset.spec.ts
```

### Run specific test group / Jalankan grup tes tertentu:
```bash
# Forgot password tests only
npx playwright test tests/e2e/auth-password-reset.spec.ts --grep "Forgot Password"

# Reset password tests only
npx playwright test tests/e2e/auth-password-reset.spec.ts --grep "Reset Password"

# Security tests only
npx playwright test tests/e2e/auth-password-reset.spec.ts --grep "Security"
```

### Run with specific reporter / Jalankan dengan reporter tertentu:
```bash
# HTML reporter
npx playwright test tests/e2e/auth-password-reset.spec.ts --reporter=html

# Line reporter
npx playwright test tests/e2e/auth-password-reset.spec.ts --reporter=line

# List reporter
npx playwright test tests/e2e/auth-password-reset.spec.ts --reporter=list
```

### Debug mode / Mode debug:
```bash
npx playwright test tests/e2e/auth-password-reset.spec.ts --debug
```

### UI mode / Mode UI:
```bash
npx playwright test tests/e2e/auth-password-reset.spec.ts --ui
```

## Key Features Tested / Fitur Utama yang Diuji

### Security / Keamanan
1. **Email Enumeration Prevention**: The same success message is shown regardless of whether the email exists in the database or not
   / **Pencegahan Enumerasi Email**: Pesan sukses yang sama ditampilkan terlepas dari apakah email ada di database atau tidak

2. **Token Security**: Tokens are single-use and expire after 60 minutes
   / **Keamanan Token**: Token hanya sekali pakai dan kadaluarsa setelah 60 menit

3. **Rate Limiting**: Multiple rapid requests are throttled (60 seconds per config)
   / **Rate Limiting**: Banyak permintaan cepat di-throttle (60 detik per config)

### User Experience / Pengalaman Pengguna
1. **Clear Feedback**: Users receive clear success/error messages at each step
   / **Umpan Balik Jelas**: Pengguna menerima pesan sukses/error yang jelas di setiap langkah

2. **Input Validation**: Client and server-side validation for email and password fields
   / **Validasi Input**: Validasi klien dan sisi server untuk field email dan password

3. **Loading States**: Buttons are disabled and show loading indicators during processing
   / **Status Loading**: Tombol disabled dan menampilkan indikator loading saat memproses

4. **Accessibility**: Proper ARIA labels, keyboard navigation, and focus management
   / **Aksesibilitas**: Label ARIA yang benar, navigasi keyboard, dan manajemen fokus

### Password Requirements / Persyaratan Password
- Minimum 8 characters (Laravel default)
  / Minimal 8 karakter (default Laravel)
- Password confirmation must match
  / Konfirmasi password harus cocok
- Special characters supported
  / Karakter spesial didukung

## Test Data / Data Tes

The tests use predefined test users from `tests/e2e/support/test-users.ts`:
/ Tes menggunakan pengguna uji yang telah ditentukan dari `tests/e2e/support/test-users.ts`:

```typescript
testUsers.superAdmin = {
  email: 'admin@pa-penajam.go.id',
  password: 'password',
}
```

## Important Notes / Catatan Penting

### Unauthenticated Flow / Alur Tidak Terauthentikasi
These tests do NOT use `storageState` because password reset is an unauthenticated flow. Each test clears cookies and storage to ensure a clean state.
/ Tes ini TIDAK menggunakan `storageState` karena reset password adalah alur yang tidak terautentikasi. Setiap tes menghapus cookies dan storage untuk memastikan status bersih.

### Token Handling / Penanganan Token
The tests use placeholder tokens. In a real scenario, you would:
/ Tes menggunakan token placeholder. Dalam skenario nyata, Anda akan:

1. Extract the actual token from email logs
   / Mengekstrak token aktual dari log email
2. Or use a test database with known tokens
   / Atau menggunakan database tes dengan token yang diketahui
3. Or mock the password reset functionality
   / Atau meniru fungsionalitas reset password

### Email Verification / Verifikasi Email
For full end-to-end testing, you would need to:
/ Untuk pengujian end-to-end lengkap, Anda perlu:

1. Check the mail log for reset tokens
   / Memeriksa log mail untuk token reset
2. Use Laravel's log mail driver (already configured in .env.e2e)
   / Menggunakan driver mail log Laravel (sudah dikonfigurasi di .env.e2e)
3. Parse the email content to extract the reset link
   / Mengurai konten email untuk mengekstrak link reset

## Future Enhancements / Peningkatan Masa Depan

1. **Actual Token Testing**: Implement actual token generation and testing by parsing mail logs
   / **Pengujian Token Aktual**: Implementasi pembuatan dan pengujian token aktual dengan mengurai log mail

2. **Mail Log Parsing**: Add helper functions to extract reset tokens from Laravel mail logs
   / **Penguraian Log Mail**: Tambahkan fungsi pembantu untuk mengekstrak token reset dari log mail Laravel

3. **Database Cleanup**: Ensure proper cleanup of password reset tokens after tests
   / **Pembersihan Database**: Memastikan pembersihan token reset password yang benar setelah tes

4. **Visual Regression**: Add visual regression tests for the password reset pages
   / **Regressi Visual**: Tambahkan tes regressi visual untuk halaman reset password

## Troubleshooting / Pemecahan Masalah

### Tests timing out / Tes timeout
- Increase timeout in `playwright.config.ts`
  / Tingkatkan timeout di `playwright.config.ts`
- Check if the web server is running
  / Periksa apakah server web berjalan

### Database errors / Error database
- Ensure `.env.e2e` file exists and is properly configured
  / Pastikan file `.env.e2e` ada dan dikonfigurasi dengan benar
- Run `php artisan migrate:fresh --seed --env=e2e` to reset the database
  / Jalankan `php artisan migrate:fresh --seed --env=e2e` untuk mereset database

### Missing dependencies / Dependensi hilang
- Run `npm install` to ensure all dependencies are installed
  / Jalankan `npm install` untuk memastikan semua dependensi terinstal
- Run `npx playwright install` to install Playwright browsers
  / Jalankan `npx playwright install` untuk menginstal browser Playwright

## Related Documentation / Dokumentasi Terkait

- [Laravel Fortify Documentation](https://laravel.com/docs/fortify)
- [Playwright Documentation](https://playwright.dev/)
- [Inertia.js Documentation](https://inertiajs.com/)
- Project E2E Test README: `tests/e2e/README.md`
- Project Test Documentation: `tests/e2e/TEST_DOCUMENTATION.md`

## Bilingual Support / Dukungan Bilingual

All test code comments are provided in both English and Indonesian to support the international development team.
/ Semua komentar kode tes disediakan dalam Bahasa Inggris dan Indonesia untuk mendukung tim pengembangan internasional.

---

**Created**: 2026-01-11
**Last Updated**: 2026-01-11
**Test Count**: 36 tests
**Status**: Active / Aktif
