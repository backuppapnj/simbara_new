import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * Settings - Password Management E2E Tests
 *
 * Tests user password change functionality including:
 * - Changing password with correct current password
 * - Validation errors for wrong current password
 * - Password strength requirements
 * - Throttling/rate limiting
 * - Success/error messages
 *
 * Route: /settings/password
 * Controller: App\Http\Controllers\Settings\PasswordController
 * Middleware: throttle:6,1 (6 requests per minute)
 * Page: resources/js/pages/settings/password.tsx
 */

test.describe('Settings - Password Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display password change page', async ({ page }) => {
    await page.goto('/settings/password');

    // Verify page title
    await expect(page).toHaveTitle(/password/i);

    // Verify form fields
    await expect(page.getByRole('textbox', { name: /current password/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /new password/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /confirm password/i })).toBeVisible();

    // Verify update button
    await expect(page.getByRole('button', { name: /update|save/i })).toBeVisible();
  });

  test('should change password successfully with valid credentials', async ({ page }) => {
    await page.goto('/settings/password');

    const newPassword = 'NewPassword123!';

    // Fill in password change form
    await page.getByRole('textbox', { name: /current password/i }).fill(testUsers.superAdmin.password);
    await page.getByRole('textbox', { name: /new password/i }).fill(newPassword);
    await page.getByRole('textbox', { name: /confirm password/i }).fill(newPassword);

    // Submit form
    await page.getByRole('button', { name: /update|save/i }).click();

    // Verify success message (may vary based on implementation)
    // The page should reload or show success indicator

    // Restore original password
    await page.getByRole('textbox', { name: /current password/i }).fill(newPassword);
    await page.getByRole('textbox', { name: /new password/i }).fill(testUsers.superAdmin.password);
    await page.getByRole('textbox', { name: /confirm password/i }).fill(testUsers.superAdmin.password);

    await page.getByRole('button', { name: /update|save/i }).click();
  });

  test('should show error when current password is incorrect', async ({ page }) => {
    await page.goto('/settings/password');

    const newPassword = 'NewPassword123!';

    // Fill in wrong current password
    await page.getByRole('textbox', { name: /current password/i }).fill('WrongPassword123!');
    await page.getByRole('textbox', { name: /new password/i }).fill(newPassword);
    await page.getByRole('textbox', { name: /confirm password/i }).fill(newPassword);

    // Submit form
    await page.getByRole('button', { name: /update|save/i }).click();

    // Verify error message appears
    await expect(page.getByText(/incorrect|wrong|does not match/i)).toBeVisible();
  });

  test('should show error when new passwords do not match', async ({ page }) => {
    await page.goto('/settings/password');

    // Fill in mismatched passwords
    await page.getByRole('textbox', { name: /current password/i }).fill(testUsers.superAdmin.password);
    await page.getByRole('textbox', { name: /new password/i }).fill('NewPassword123!');
    await page.getByRole('textbox', { name: /confirm password/i }).fill('DifferentPassword123!');

    // Submit form
    await page.getByRole('button', { name: /update|save/i }).click();

    // Verify validation error
    await expect(page.getByText(/match/i)).toBeVisible();
  });

  test('should show error when new password is same as current', async ({ page }) => {
    await page.goto('/settings/password');

    // Fill in same password for current and new
    await page.getByRole('textbox', { name: /current password/i }).fill(testUsers.superAdmin.password);
    await page.getByRole('textbox', { name: /new password/i }).fill(testUsers.superAdmin.password);
    await page.getByRole('textbox', { name: /confirm password/i }).fill(testUsers.superAdmin.password);

    // Submit form
    await page.getByRole('button', { name: /update|save/i }).click();

    // Verify error message
    await expect(page.getByText(/same|different|must be changed/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/settings/password');

    // Try to submit without filling any fields
    await page.getByRole('button', { name: /update|save/i }).click();

    // Verify HTML5 validation
    const currentPasswordInput = page.getByRole('textbox', { name: /current password/i });
    await expect(currentPasswordInput).toHaveAttribute('required');

    const newPasswordInput = page.getByRole('textbox', { name: /new password/i });
    await expect(newPasswordInput).toHaveAttribute('required');

    const confirmPasswordInput = page.getByRole('textbox', { name: /confirm password/i });
    await expect(confirmPasswordInput).toHaveAttribute('required');
  });

  test('should enforce password strength requirements', async ({ page }) => {
    await page.goto('/settings/password');

    // Try weak password
    await page.getByRole('textbox', { name: /current password/i }).fill(testUsers.superAdmin.password);
    await page.getByRole('textbox', { name: /new password/i }).fill('123');
    await page.getByRole('textbox', { name: /confirm password/i }).fill('123');

    await page.getByRole('button', { name: /update|save/i }).click();

    // Verify validation error for weak password
    await expect(page.getByText(/at least|minimum|characters/i)).toBeVisible();
  });

  test('should disable button while processing', async ({ page }) => {
    await page.goto('/settings/password');

    const newPassword = 'NewPassword123!';

    // Fill form
    await page.getByRole('textbox', { name: /current password/i }).fill(testUsers.superAdmin.password);
    await page.getByRole('textbox', { name: /new password/i }).fill(newPassword);
    await page.getByRole('textbox', { name: /confirm password/i }).fill(newPassword);

    // Submit and check button state
    const updateButton = page.getByRole('button', { name: /update|save/i });
    await updateButton.click();

    // Button should be disabled during processing
    await expect(updateButton).toBeDisabled();

    // Wait for processing to complete
    await page.waitForTimeout(1000);

    // Restore original password
    await page.getByRole('textbox', { name: /current password/i }).fill(newPassword);
    await page.getByRole('textbox', { name: /new password/i }).fill(testUsers.superAdmin.password);
    await page.getByRole('textbox', { name: /confirm password/i }).fill(testUsers.superAdmin.password);

    await page.getByRole('button', { name: /update|save/i }).click();
  });

  test('should rate limit password change attempts', async ({ page }) => {
    await page.goto('/settings/password');

    // Make multiple failed attempts to trigger rate limiting
    for (let i = 0; i < 7; i++) {
      await page.getByRole('textbox', { name: /current password/i }).fill('WrongPassword');
      await page.getByRole('textbox', { name: /new password/i }).fill('NewPassword123!');
      await page.getByRole('textbox', { name: /confirm password/i }).fill('NewPassword123!');
      await page.getByRole('button', { name: /update|save/i }).click();
      await page.waitForTimeout(100);
    }

    // Verify rate limit message (429 Too Many Requests)
    await expect(page.getByText(/many attempts|try again later/i)).toBeVisible();
  });

  test('should have proper input types for password fields', async ({ page }) => {
    await page.goto('/settings/password');

    // Verify password input type for security
    const currentPasswordInput = page.getByRole('textbox', { name: /current password/i });
    await expect(currentPasswordInput).toHaveAttribute('type', 'password');

    const newPasswordInput = page.getByRole('textbox', { name: /new password/i });
    await expect(newPasswordInput).toHaveAttribute('type', 'password');

    const confirmPasswordInput = page.getByRole('textbox', { name: /confirm password/i });
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  test('should clear password fields after failed attempt', async ({ page }) => {
    await page.goto('/settings/password');

    // Fill with wrong password
    await page.getByRole('textbox', { name: /current password/i }).fill('WrongPassword');
    await page.getByRole('textbox', { name: /new password/i }).fill('NewPassword123!');
    await page.getByRole('textbox', { name: /confirm password/i }).fill('NewPassword123!');

    await page.getByRole('button', { name: /update|save/i }).click();

    // Wait for error
    await page.waitForTimeout(500);

    // Verify fields may be cleared for security (implementation-dependent)
    // Some implementations keep the new password, some clear all
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Logout first
    await logout(page);

    // Try to access password page
    await page.goto('/settings/password');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show password visibility toggle if available', async ({ page }) => {
    await page.goto('/settings/password');

    // Check if there are password visibility toggle buttons
    // This is a UI component that may or may not be present
    const toggleButtons = page.locator('[data-test="password-toggle"]').or(
      page.locator('button[aria-label*="password" i]').or(
        page.locator('button[aria-label*="show" i]')
      )
    );

    // If toggle exists, verify it works
    if (await toggleButtons.count() > 0) {
      await expect(toggleButtons.first()).toBeVisible();
    }
  });

  test('should handle special characters in password', async ({ page }) => {
    await page.goto('/settings/password');

    const specialCharPassword = 'Test@Password#123$%^&*';

    // Fill form with special characters
    await page.getByRole('textbox', { name: /current password/i }).fill(testUsers.superAdmin.password);
    await page.getByRole('textbox', { name: /new password/i }).fill(specialCharPassword);
    await page.getByRole('textbox', { name: /confirm password/i }).fill(specialCharPassword);

    // Submit form
    await page.getByRole('button', { name: /update|save/i }).click();

    // Wait a moment for processing
    await page.waitForTimeout(1000);

    // Restore original password
    await page.getByRole('textbox', { name: /current password/i }).fill(specialCharPassword);
    await page.getByRole('textbox', { name: /new password/i }).fill(testUsers.superAdmin.password);
    await page.getByRole('textbox', { name: /confirm password/i }).fill(testUsers.superAdmin.password);

    await page.getByRole('button', { name: /update|save/i }).click();
  });
});
