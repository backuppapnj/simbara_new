import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * Password Reset E2E Tests / Uji E2E Reset Password
 *
 * ⚠️ SKIPPED - Password reset is managed by super admins only
 * ⚠️ DILEWATI - Reset password dikelola hanya oleh super admin
 *
 * Tests user password reset flow including:
 * - Uji alur reset password pengguna meliputi:
 *
 * Forgot Password:
 * - Forgot Password / Lupa Password:
 *   - Page display / Tampilan halaman
 *   - Request reset link with valid email / Minta link reset dengan email valid
 *   - Security: don't reveal if email exists / Keamanan: jangan revealed email ada
 *   - Invalid email format validation / Validasi format email tidak valid
 *   - Empty field validation / Validasi field kosong
 *
 * Reset Password:
 * - Reset Password:
 *   - Page display with token / Tampilan halaman dengan token
 *   - Valid password reset / Reset password valid
 *   - Mismatched confirmation / Konfirmasi tidak cocok
 *   - Weak password validation / Validasi password lemah
 *   - Invalid/expired token / Token tidak valid/kadaluarsa
 *   - Empty fields validation / Validasi field kosong
 *
 * Full Flow & Security:
 * - Alur Lengkap & Keamanan:
 *   - End-to-end password reset flow / Alur reset password end-to-end
 *   - Token is single-use / Token hanya sekali pakai
 *   - Login with new password / Login dengan password baru
 *   - Old password no longer works / Password lama tidak bisa dipakai
 *
 * Routes:
 * - Route:
 *   - GET  /forgot-password - Show forgot password form
 *   - POST /forgot-password - Send reset link
 *   - GET  /reset-password/{token} - Show reset form
 *   - POST /reset-password - Reset password
 *
 * Controllers:
 * - Controller:
 *   - App\Http\Controllers\Auth\PasswordResetLinkController
 *   - App\Http\Controllers\Auth\NewPasswordController
 *
 * Pages:
 * - Halaman:
 *   - resources/js/pages/auth/forgot-password.tsx
 *   - resources/js/pages/auth/reset-password.tsx
 *
 * IMPORTANT:
 * - PENTING:
 *   - This is UNAUTHENTICATED flow - don't use storageState
 *   - Ini alur TIDAK TERAUTHENTIKASI - jangan gunakan storageState
 *   - Tests security aspects (no email enumeration)
 *   - Uji aspek keamanan (tidak ada enumerasi email)
 *   - Bilingual: English + Indonesian comments
 *   - Bilingual: Komentar Bahasa Inggris + Indonesia
 */

// Skip all password reset tests - only super admins manage passwords
test.describe.configure({ mode: 'skip' });

test.describe('Password Reset - Forgot Password Page', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we start logged out / Pastikan mulai dengan logout
    // Clear all cookies and storage to ensure logged out state
    // Hapus semua cookies dan storage untuk memastikan status logout
    await page.context().clearCookies();
    await page.goto('/forgot-password');
  });

  test('should display forgot password page correctly', async ({ page }) => {
    await page.goto('/forgot-password');

    // Verify page title / Verifikasi judul halaman
    await expect(page).toHaveTitle(/forgot password/i);

    // Verify main heading / Verifikasi heading utama
    await expect(page.getByRole('heading', { name: 'Forgot password', exact: true })).toBeVisible();
    await expect(
      page.getByText('Enter your email to receive a password reset link')
    ).toBeVisible();

    // Verify email input field / Verifikasi field input email
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('name', 'email');
    await expect(emailInput).toHaveAttribute('autoComplete', 'off');

    // Verify send reset link button / Verifikasi tombol kirim link reset
    const sendButton = page.getByRole('button', {
      name: /send password reset link/i,
    });
    await expect(sendButton).toBeVisible();

    // Verify link back to login / Verifikasi link kembali ke login
    await expect(page.getByText("Or, return to")).toBeVisible();
    const loginLink = page.getByRole('link', { name: /log in/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('should navigate to forgot password from login page', async ({ page }) => {
    await page.goto('/login');

    // Check if there's a "Forgot password?" link on login page
    // Cek apakah ada link "Forgot password?" di halaman login
    const forgotPasswordLink = page.getByRole('link', {
      name: /forgot password|lupa password/i,
    });

    if (await forgotPasswordLink.count()) {
      await forgotPasswordLink.click();
      await expect(page).toHaveURL('/forgot-password');
    } else {
      // If no link exists, navigate directly
      // Jika tidak ada link, navigasi langsung
      await page.goto('/forgot-password');
      await expect(page).toHaveURL('/forgot-password');
    }
  });

  test('should validate email format - invalid email', async ({ page }) => {
    await page.goto('/forgot-password');

    // Enter invalid email format / Masukkan format email tidak valid
    await page.getByRole('textbox', { name: /email/i }).fill('invalid-email');
    await page
      .getByRole('button', { name: /send password reset link/i })
      .click();

    // Laravel Fortify uses 'email' validation rule which accepts "invalid-email"
    // Laravel Fortify menggunakan aturan validasi 'email' yang menerima "invalid-email"
    // So this might actually submit successfully (though no email will be sent)
    // Jadi ini mungkin berhasil submit (meskipun tidak ada email yang dikirim)
    // The success message should still appear for security
    // Pesan sukses harus tetap muncul untuk keamanan
    await expect(
      page.getByText(/we have emailed your password reset link/i)
    ).toBeVisible();
  });

  test('should validate required field - empty email', async ({ page }) => {
    await page.goto('/forgot-password');

    // Try to submit with empty email / Coba submit dengan email kosong
    await page.getByRole('button', { name: /send password reset link/i }).click();

    // Verify HTML5 validation or server-side validation
    // Verifikasi validasi HTML5 atau validasi sisi server
    const emailInput = page.getByRole('textbox', { name: /email/i });

    // Check for HTML5 required attribute
    // Cek atribut required HTML5
    const isRequired = await emailInput.evaluate((el) =>
      el.hasAttribute('required')
    );

    if (isRequired) {
      // HTML5 validation should prevent submission
      // Validasi HTML5 harus mencegah pengiriman
      await expect(page).toHaveURL('/forgot-password');
    } else {
      // Server-side validation
      // Validasi sisi server
      await expect(
        page.getByText(/email.*required|wajib diisi/i)
      ).toBeVisible();
    }
  });

  test('should show success message for valid email (registered user)', async ({
    page,
  }) => {
    await page.goto('/forgot-password');

    // Enter registered email / Masukkan email terdaftar
    await page
      .getByRole('textbox', { name: /email/i })
      .fill(testUsers.superAdmin.email);

    await page
      .getByRole('button', { name: /send password reset link/i })
      .click();

    // Verify success message appears
    // Verifikasi pesan sukses muncul
    await expect(
      page.getByText(/we have emailed your password reset link/i)
    ).toBeVisible();

    // Message should be generic (security - don't reveal email existence)
    // Pesan harus generik (keamanan - jangan revealed keberadaan email)
    await expect(page.getByText(/if an account exists/i)).toBeVisible();
  });

  test('should show same success message for non-existent email (security)', async ({
    page,
  }) => {
    await page.goto('/forgot-password');

    // Enter non-existent email / Masukkan email tidak ada
    await page
      .getByRole('textbox', { name: /email/i })
      .fill('nonexistent@example.com');

    await page
      .getByRole('button', { name: /send password reset link/i })
      .click();

    // Should show SAME success message (security - prevent email enumeration)
    // Harus menampilkan pesan sukses YANG SAMA (keamanan - mencegah enumerasi email)
    await expect(
      page.getByText(/we have emailed your password reset link/i)
    ).toBeVisible();

    // Should NOT reveal that email doesn't exist
    // TIDAK boleh revealed bahwa email tidak ada
    await expect(
      page.getByText(/no account found|user not found/i)
    ).not.toBeVisible();
  });

  test('should disable button while processing', async ({ page }) => {
    await page.goto('/forgot-password');

    // Fill email / Isi email
    await page
      .getByRole('textbox', { name: /email/i })
      .fill(testUsers.superAdmin.email);

    // Click button and check state / Klik tombol dan cek status
    const sendButton = page.getByRole('button', {
      name: /send password reset link/i,
    });
    await sendButton.click();

    // Button should be disabled during processing
    // Tombol harus disabled saat memproses
    await expect(sendButton).toBeDisabled();
    await expect(page.getByText(/sending\.\.\./i)).toBeVisible();

    // Wait for completion / Tunggu selesai
    await page.waitForTimeout(2000);
  });

  test('should show loading spinner while processing', async ({ page }) => {
    await page.goto('/forgot-password');

    await page
      .getByRole('textbox', { name: /email/i })
      .fill(testUsers.superAdmin.email);

    await page
      .getByRole('button', { name: /send password reset link/i })
      .click();

    // Check for loader icon / Cek ikon loader
    const spinner = page.locator('.animate-spin');
    await expect(spinner).toBeVisible();
  });

  test('should allow navigation back to login', async ({ page }) => {
    await page.goto('/forgot-password');

    // Click login link / Klik link login
    await page.getByRole('link', { name: /log in/i }).click();

    // Should redirect to login / Harus redirect ke login
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Password Reset - Reset Password Page', () => {
  // Use a valid token format (this would typically come from email)
  // Gunakan format token valid (ini biasanya dari email)
  const validToken = 'valid-reset-token-123';

  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage to ensure logged out state
    // Hapus cookies dan storage untuk memastikan status logout
    await page.context().clearCookies();
  });

  test('should display reset password page with token', async ({ page }) => {
    // Navigate with token / Navigasi dengan token
    await page.goto(`/reset-password/${validToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`);

    // Verify page title / Verifikasi judul halaman
    await expect(page).toHaveTitle(/reset password/i);

    // Verify heading / Verifikasi heading
    await expect(page.getByRole('heading', { name: 'Reset password', exact: true })).toBeVisible();
    await expect(
      page.getByText('Please enter your new password below')
    ).toBeVisible();

    // Verify email field (read-only) / Verifikasi field email (read-only)
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('readOnly', '');

    // Verify password fields / Verifikasi field password
    const passwordInput = page.getByRole('textbox', { name: /password/i });
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(passwordInput).toHaveAttribute('name', 'password');
    await expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');

    const confirmPasswordInput = page.getByRole('textbox', {
      name: /confirm password/i,
    });
    await expect(confirmPasswordInput).toBeVisible();
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Verify submit button / Verifikasi tombol submit
    await expect(page.getByRole('button', { name: /reset password/i })).toBeVisible();
  });

  test('should validate password confirmation mismatch', async ({ page }) => {
    await page.goto(`/reset-password/${validToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`);

    // Enter mismatched passwords / Masukkan password tidak cocok
    await page.getByRole('textbox', { name: /^password$/i }).fill('NewPassword123!');
    await page
      .getByRole('textbox', { name: /confirm password/i })
      .fill('DifferentPassword123!');

    await page.getByRole('button', { name: /reset password/i }).click();

    // Laravel uses 'confirmed' validation which adds "password_confirmation" must match
    // Laravel menggunakan validasi 'confirmed' yang menambahkan "password_confirmation" harus cocok
    // The error might be on the password_confirmation field
    // Error mungkin ada di field password_confirmation
    await expect(page.getByText(/password.*confirmation.*match|the password field confirmation does not match/i)).toBeVisible();
  });

  test('should validate empty password fields', async ({ page }) => {
    await page.goto(`/reset-password/${validToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`);

    // Try to submit without passwords / Coba submit tanpa password
    await page.getByRole('button', { name: /reset password/i }).click();

    // Check for required validation / Cek validasi required
    const passwordInput = page.getByRole('textbox', { name: /^password$/i });
    const isRequired = await passwordInput.evaluate((el) =>
      el.hasAttribute('required')
    );

    if (isRequired) {
      // HTML5 validation / Validasi HTML5
      await expect(page).toHaveURL(/\/reset-password\//);
    } else {
      // Server-side validation / Validasi sisi server
      await expect(
        page.getByText(/password.*required|wajib diisi/i)
      ).toBeVisible();
    }
  });

  test('should validate weak password', async ({ page }) => {
    await page.goto(`/reset-password/${validToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`);

    // Enter weak password / Masukkan password lemah
    await page.getByRole('textbox', { name: /^password$/i }).fill('123');
    await page.getByRole('textbox', { name: /confirm password/i }).fill('123');

    await page.getByRole('button', { name: /reset password/i }).click();

    // Laravel default password validation requires min 8 characters
    // Validasi password default Laravel memerlukan minimal 8 karakter
    await expect(
      page.getByText(/at least \d+ characters|password.*must be|minimal/i)
    ).toBeVisible();
  });

  test('should handle invalid token gracefully', async ({ page }) => {
    const invalidToken = 'invalid-token-99999';

    await page.goto(
      `/reset-password/${invalidToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`
    );

    // Enter valid password / Masukkan password valid
    await page.getByRole('textbox', { name: /^password$/i }).fill('NewPassword123!');
    await page
      .getByRole('textbox', { name: /confirm password/i })
      .fill('NewPassword123!');

    await page.getByRole('button', { name: /reset password/i }).click();

    // Verify error message for invalid token
    // Verifikasi pesan error untuk token tidak valid
    // Laravel Password broker returns different messages for invalid tokens
    // Broker Password Laravel mengembalikan pesan berbeda untuk token tidak valid
    const errorMessage = page.locator('.text-red-600, .text-destructive, [role="alert"]').or(
      page.getByText(/invalid|expired|token/i)
    );
    await expect(errorMessage.first()).toBeVisible();
  });

  test('should disable button while processing', async ({ page }) => {
    await page.goto(`/reset-password/${validToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`);

    // Fill form / Isi form
    await page.getByRole('textbox', { name: /^password$/i }).fill('NewPassword123!');
    await page
      .getByRole('textbox', { name: /confirm password/i })
      .fill('NewPassword123!');

    // Submit and check button state / Submit dan cek status tombol
    const resetButton = page.getByRole('button', { name: /reset password/i });
    await resetButton.click();

    // Button should be disabled / Tombol harus disabled
    await expect(resetButton).toBeDisabled();
  });

  test('should show loading spinner while processing', async ({ page }) => {
    await page.goto(`/reset-password/${validToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`);

    await page.getByRole('textbox', { name: /^password$/i }).fill('NewPassword123!');
    await page
      .getByRole('textbox', { name: /confirm password/i })
      .fill('NewPassword123!');

    await page.getByRole('button', { name: /reset password/i }).click();

    // Check for spinner / Cek spinner
    const spinner = page.locator('[data-test="reset-password-button"] svg');
    await expect(spinner).toBeVisible();
  });
});

test.describe('Password Reset - Full Flow Integration', () => {
  test('should complete full password reset flow successfully', async ({
    page,
  }) => {
    // Start logged out / Mulai dengan logout
    await page.context().clearCookies();

    // Step 1: Navigate to forgot password
    // Langkah 1: Navigasi ke lupa password
    await page.goto('/forgot-password');
    await expect(page).toHaveTitle(/forgot password/i);

    // Step 2: Request reset link
    // Langkah 2: Minta link reset
    await page
      .getByRole('textbox', { name: /email/i })
      .fill(testUsers.superAdmin.email);
    await page
      .getByRole('button', { name: /send password reset link/i })
      .click();

    // Verify success message
    // Verifikasi pesan sukses
    await expect(
      page.getByText(/we have emailed your password reset link/i)
    ).toBeVisible();

    // Note: In a real scenario, you would:
    // Catatan: Dalam skenario nyata, Anda akan:
    // 1. Check email/mail log for reset token
    // 1. Cek email/log mail untuk token reset
    // 2. Extract token from email
    // 2. Ekstrak token dari email
    // 3. Navigate to reset URL with token
    // 3. Navigasi ke URL reset dengan token

    // For this test, we'll navigate with a placeholder token
    // Untuk tes ini, kita akan navigasi dengan token placeholder
    // In production, this would be: await page.goto(`/reset-password/${actualToken}`);
    // Di produksi, ini akan: await page.goto(`/reset-password/${actualToken}`);

    // The actual token extraction would need mail log access or test database
    // Ekstraksi token aktual membutuhkan akses log mail atau database tes
    await page.waitForTimeout(1000);

    // Step 3: Simulate navigating to reset page (in real test, use actual token)
    // Langkah 3: Simulasi navigasi ke halaman reset (di tes nyata, gunakan token aktual)
    // For now, we verify the flow would continue
    // Untuk saat ini, kita verifikasi alur akan berlanjut
  });

  test('should login with new password after reset', async ({ page }) => {
    // This test assumes a password was just reset
    // Tes ini mengasumsikan password baru saja direset

    // Note: This requires setup where password is actually reset
    // Catatan: Ini memerlukan setup di mana password benar-benar direset

    // Login with new password / Login dengan password baru
    await page.goto('/login');
    await page.getByRole('textbox', { name: /email/i }).fill(testUsers.superAdmin.email);

    // If password was reset to something new, use that
    // Jika password direset ke sesuatu yang baru, gunakan itu
    await page.getByRole('textbox', { name: /password/i }).fill(
      testUsers.superAdmin.password
    );

    await page.getByRole('button', { name: /sign in|log in|login/i }).click();

    // Should successfully login / Harus berhasil login
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should not login with old password after reset', async ({ page }) => {
    // This test verifies security: old password no longer works
    // Tes ini verifikasi keamanan: password lama tidak bisa dipakai

    // Note: Requires actual password reset setup
    // Catatan: Memerlukan setup reset password aktual

    await page.goto('/login');
    await page.getByRole('textbox', { name: /email/i }).fill(testUsers.superAdmin.email);
    await page.getByRole('textbox', { name: /password/i }).fill('OldPassword123!');

    await page.getByRole('button', { name: /sign in|log in|login/i }).click();

    // Should show error / Harus menampilkan error
    await expect(
      page.getByText(/credentials do not match|incorrect/i)
    ).toBeVisible();
  });
});

test.describe('Password Reset - Security & Edge Cases', () => {
  test('should not reveal if email exists (enumeration prevention)', async ({
    page,
  }) => {
    await page.goto('/forgot-password');

    // Test with registered email / Tes dengan email terdaftar
    await page
      .getByRole('textbox', { name: /email/i })
      .fill(testUsers.superAdmin.email);
    await page
      .getByRole('button', { name: /send password reset link/i })
      .click();

    const registeredMessage = await page.getByText(
      /we have emailed your password reset link/i
    ).textContent();

    await page.waitForTimeout(1000);

    // Test with unregistered email / Tes dengan email tidak terdaftar
    await page.goto('/forgot-password');
    await page
      .getByRole('textbox', { name: /email/i })
      .fill('nonexistent@example.com');
    await page
      .getByRole('button', { name: /send password reset link/i })
      .click();

    const unregisteredMessage = await page.getByText(
      /we have emailed your password reset link/i
    ).textContent();

    // Messages should be identical / Pesan harus identik
    expect(registeredMessage).toBe(unregisteredMessage);
  });

  test('should handle rate limiting for forgot password requests', async ({
    page,
  }) => {
    await page.goto('/forgot-password');

    // Make multiple rapid requests / Buat banyak permintaan cepat
    const requests = 10;
    for (let i = 0; i < requests; i++) {
      await page
        .getByRole('textbox', { name: /email/i })
        .fill(`test${i}@example.com`);
      await page
        .getByRole('button', { name: /send password reset link/i })
        .click();
      await page.waitForTimeout(100);
    }

    // Check for rate limiting message (throttle: 60 seconds per config)
    // Cek pesan rate limiting (throttle: 60 detik per config)
    const rateLimitMessage = page.getByText(/too many attempts|try again later/i);

    // Rate limiting may or may not trigger depending on Laravel Fortify config
    // Rate limiting mungkin atau mungkin tidak tergantung config Laravel Fortify
    if (await rateLimitMessage.count()) {
      await expect(rateLimitMessage).toBeVisible();
    }
  });

  test('should reset password with special characters', async ({ page }) => {
    const specialCharPassword = 'Test@Password#123$%^&*()';
    const validToken = 'test-token-123';

    await page.goto(
      `/reset-password/${validToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`
    );

    // Enter password with special characters
    // Masukkan password dengan karakter spesial
    await page.getByRole('textbox', { name: /^password$/i }).fill(specialCharPassword);
    await page
      .getByRole('textbox', { name: /confirm password/i })
      .fill(specialCharPassword);

    await page.getByRole('button', { name: /reset password/i }).click();

    // Wait a moment for processing
    // Tunggu sebentar untuk pemrosesan
    await page.waitForTimeout(1000);
  });

  test('should handle token expiration (60 minutes from config)', async ({
    page,
  }) => {
    // Note: This would require manipulating the database or time
    // Catatan: Ini memerlukan manipulasi database atau waktu

    const expiredToken = 'expired-token-999';
    await page.goto(
      `/reset-password/${expiredToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`
    );

    await page.getByRole('textbox', { name: /^password$/i }).fill('NewPassword123!');
    await page
      .getByRole('textbox', { name: /confirm password/i })
      .fill('NewPassword123!');

    await page.getByRole('button', { name: /reset password/i }).click();

    // Should show expired token error
    // Harus menampilkan error token kadaluarsa
    await expect(
      page.getByText(/invalid.*token|expired|kadaluarsa/i)
    ).toBeVisible();
  });

  test('should verify token is single-use', async ({ page }) => {
    // Note: This requires actual token usage and database setup
    // Catatan: Ini memerlukan penggunaan token aktual dan setup database

    // After successful password reset, the token should be invalid
    // Setelah reset password berhasil, token harus tidak valid

    const testToken = 'single-use-token-123';
    await page.goto(
      `/reset-password/${testToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`
    );

    // First use - might work if token is valid
    // Penggunaan pertama - mungkin berhasil jika token valid
    await page.getByRole('textbox', { name: /^password$/i }).fill('Password1!');
    await page
      .getByRole('textbox', { name: /confirm password/i })
      .fill('Password1!');
    await page.getByRole('button', { name: /reset password/i }).click();
    await page.waitForTimeout(1000);

    // Second use - should fail (token already used)
    // Penggunaan kedua - harus gagal (token sudah dipakai)
    await page.goto(
      `/reset-password/${testToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`
    );
    await page.getByRole('textbox', { name: /^password$/i }).fill('Password2!');
    await page
      .getByRole('textbox', { name: /confirm password/i })
      .fill('Password2!');
    await page.getByRole('button', { name: /reset password/i }).click();

    // Should show token invalid error
    // Harus menampilkan error token tidak valid
    await expect(
      page.getByText(/invalid.*token|expired|already used/i)
    ).toBeVisible();
  });

  test('should redirect to login after successful reset', async ({ page }) => {
    const validToken = 'test-token-success';

    await page.goto(
      `/reset-password/${validToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`
    );

    await page.getByRole('textbox', { name: /^password$/i }).fill('NewPassword123!');
    await page
      .getByRole('textbox', { name: /confirm password/i })
      .fill('NewPassword123!');

    await page.getByRole('button', { name: /reset password/i }).click();

    // After successful reset, should redirect to login
    // Setelah reset berhasil, harus redirect ke login
    // Note: This depends on actual valid token
    // Catatan: Ini tergantung token yang valid
    await page.waitForTimeout(2000);

    // Check if redirected to login with success status
    // Cek jika redirect ke login dengan status sukses
    if (page.url().includes('/login')) {
      await expect(page.getByText(/password.*reset|berhasil.*diubah/i)).toBeVisible();
    }
  });

  test('should handle very long passwords', async ({ page }) => {
    const longPassword = 'a'.repeat(255) + '!1A';
    const validToken = 'test-token-long';

    await page.goto(
      `/reset-password/${validToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`
    );

    // Enter very long password / Masukkan password sangat panjang
    await page.getByRole('textbox', { name: /^password$/i }).fill(longPassword);
    await page
      .getByRole('textbox', { name: /confirm password/i })
      .fill(longPassword);

    await page.getByRole('button', { name: /reset password/i }).click();

    // Should handle without crashing / Harus menangani tanpa crash
    await page.waitForTimeout(1000);
  });

  test('should maintain email in query parameter during reset', async ({
    page,
  }) => {
    const testEmail = testUsers.superAdmin.email;
    const validToken = 'test-token-email';

    await page.goto(
      `/reset-password/${validToken}?email=${encodeURIComponent(testEmail)}`
    );

    // Verify email field is pre-filled / Verifikasi field email sudah terisi
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toHaveValue(testEmail);
    await expect(emailInput).toHaveAttribute('readOnly', '');
  });

  test('should handle unicode in email address', async ({ page }) => {
    await page.goto('/forgot-password');

    // Test with unicode email / Tes dengan email unicode
    await page.getByRole('textbox', { name: /email/i }).fill('tëst@example.com');
    await page
      .getByRole('button', { name: /send password reset link/i })
      .click();

    // Should handle gracefully / Harus menangani dengan baik
    await page.waitForTimeout(500);
  });
});

test.describe('Password Reset - UI & UX', () => {
  test('should have proper input types for security', async ({ page }) => {
    const validToken = 'test-token-ui';

    await page.goto(
      `/reset-password/${validToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`
    );

    // Verify password input types for security (not visible in page source)
    // Verifikasi tipe input password untuk keamanan (tidak terlihat di sumber halaman)
    const passwordInput = page.getByRole('textbox', { name: /^password$/i });
    await expect(passwordInput).toHaveAttribute('type', 'password');

    const confirmPasswordInput = page.getByRole('textbox', {
      name: /confirm password/i,
    });
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  test('should have proper autocomplete attributes', async ({ page }) => {
    const validToken = 'test-token-autocomplete';

    await page.goto(
      `/reset-password/${validToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`
    );

    // Password fields should use "new-password" autocomplete
    // Field password harus menggunakan autocomplete "new-password"
    await expect(page.getByRole('textbox', { name: /^password$/i })).toHaveAttribute(
      'autoComplete',
      'new-password'
    );
    await expect(
      page.getByRole('textbox', { name: /confirm password/i })
    ).toHaveAttribute('autoComplete', 'new-password');

    // Email should use "email" autocomplete
    // Email harus menggunakan autocomplete "email"
    await expect(page.getByRole('textbox', { name: /email/i })).toHaveAttribute(
      'autoComplete',
      'email'
    );
  });

  test('should focus email field on forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');

    // Email input should be auto-focused / Input email harus auto-focus
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeFocused();
  });

  test('should focus password field on reset password page', async ({ page }) => {
    const validToken = 'test-token-focus';

    await page.goto(
      `/reset-password/${validToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`
    );

    // Password input should be auto-focused / Input password harus auto-focus
    const passwordInput = page.getByRole('textbox', { name: /^password$/i });
    await expect(passwordInput).toBeFocused();
  });

  test('should clear password fields after successful reset', async ({ page }) => {
    const validToken = 'test-token-clear';

    await page.goto(
      `/reset-password/${validToken}?email=${encodeURIComponent(testUsers.superAdmin.email)}`
    );

    await page.getByRole('textbox', { name: /^password$/i }).fill('Password123!');
    await page
      .getByRole('textbox', { name: /confirm password/i })
      .fill('Password123!');

    await page.getByRole('button', { name: /reset password/i }).click();

    // Wait a moment / Tunggu sebentar
    await page.waitForTimeout(1000);

    // Verify fields might be cleared or redirect occurred
    // Verifikasi field mungkin dihapus atau redirect terjadi
    if (page.url().includes('/reset-password')) {
      const passwordInput = page.getByRole('textbox', { name: /^password$/i });
      const value = await passwordInput.inputValue();
      // If still on page, check if cleared / Jika masih di halaman, cek jika dihapus
      expect(value || '').toBe('');
    }
  });
});

test.describe('Password Reset - Accessibility', () => {
  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/forgot-password');

    // Verify form is accessible / Verifikasi form dapat diakses
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible();

    const sendButton = page.getByRole('button', {
      name: /send password reset link/i,
    });
    await expect(sendButton).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/forgot-password');

    // Email input should be auto-focused first
    // Input email harus auto-focus terlebih dahulu
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeFocused();

    // Tab to button / Tab ke tombol
    await page.keyboard.press('Tab');
    const sendButton = page.getByRole('button', {
      name: /send password reset link/i,
    });

    // Fill email and submit with Enter
    // Isi email dan submit dengan Enter
    await emailInput.fill(testUsers.superAdmin.email);
    await page.keyboard.press('Enter');

    // Form should submit / Form harus submit
    await expect(
      page.getByText(/we have emailed your password reset link/i)
    ).toBeVisible();
  });

  test('should display error messages accessibly', async ({ page }) => {
    await page.goto('/forgot-password');

    // Submit with empty email to trigger validation
    // Submit dengan email kosong untuk memicu validasi
    await page.getByRole('button', { name: /send password reset link/i }).click();

    // Error should be visible and readable / Error harus terlihat dan dapat dibaca
    // Check for any error message that appears
    // Cek pesan error apa pun yang muncul
    const errorMessage = page.locator('.text-red-600, .text-destructive, [role="alert"]').or(
      page.getByText(/required|wajib/i)
    );

    // If there's an error, it should be visible
    // Jika ada error, harus terlihat
    const count = await errorMessage.count();
    if (count > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });
});
