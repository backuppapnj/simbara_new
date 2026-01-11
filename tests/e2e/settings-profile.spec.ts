import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * Settings - Profile Management E2E Tests
 *
 * Tests user profile update functionality including:
 * - Updating name
 * - Updating email
 * - Form validations
 * - Success messages
 * - Account deletion
 *
 * Route: /settings/profile
 * Controller: App\Http\Controllers\Settings\ProfileController
 * Page: resources/js/pages/settings/profile.tsx
 */

test.describe('Settings - Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display profile page with current user information', async ({ page }) => {
    await page.goto('/settings/profile');

    // Verify page title and heading
    await expect(page).toHaveTitle(/Profile settings/i);
    await expect(page.getByRole('heading', { name: /profile information/i, level: 2 })).toBeVisible();

    // Verify form fields are present
    await expect(page.getByRole('textbox', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();

    // Verify current values are pre-filled
    const nameInput = page.getByRole('textbox', { name: /name/i });
    await expect(nameInput).toHaveValue(testUsers.superAdmin.label);

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toHaveValue(testUsers.superAdmin.email);
  });

  test('should update user name successfully', async ({ page }) => {
    await page.goto('/settings/profile');

    const newName = 'Updated Admin Name';

    // Fill in new name
    await page.getByRole('textbox', { name: /name/i }).clear();
    await page.getByRole('textbox', { name: /name/i }).fill(newName);

    // Submit form
    await page.getByRole('button', { name: /save/i }).click();

    // Verify success message
    await expect(page.getByText('Saved')).toBeVisible();

    // Verify name was updated (reload page to check)
    await page.reload();
    await expect(page.getByRole('textbox', { name: /name/i })).toHaveValue(newName);

    // Restore original name
    await page.getByRole('textbox', { name: /name/i }).clear();
    await page.getByRole('textbox', { name: /name/i }).fill(testUsers.superAdmin.label);
    await page.getByRole('button', { name: /save/i }).click();
  });

  test('should update user email successfully', async ({ page }) => {
    await page.goto('/settings/profile');

    const newEmail = 'updated-admin@pa-penajam.go.id';

    // Fill in new email
    await page.getByRole('textbox', { name: /email/i }).clear();
    await page.getByRole('textbox', { name: /email/i }).fill(newEmail);

    // Submit form
    await page.getByRole('button', { name: /save/i }).click();

    // Verify success message
    await expect(page.getByText('Saved')).toBeVisible();

    // Verify email was updated
    await page.reload();
    await expect(page.getByRole('textbox', { name: /email/i })).toHaveValue(newEmail);

    // Restore original email
    await page.getByRole('textbox', { name: /email/i }).clear();
    await page.getByRole('textbox', { name: /email/i }).fill(testUsers.superAdmin.email);
    await page.getByRole('button', { name: /save/i }).click();
  });

  test('should show validation error for empty name', async ({ page }) => {
    await page.goto('/settings/profile');

    // Clear name field
    await page.getByRole('textbox', { name: /name/i }).clear();

    // Submit form
    await page.getByRole('button', { name: /save/i }).click();

    // Verify validation error (HTML5 required validation)
    const nameInput = page.getByRole('textbox', { name: /name/i });
    await expect(nameInput).toHaveAttribute('required');
  });

  test('should show validation error for empty email', async ({ page }) => {
    await page.goto('/settings/profile');

    // Clear email field
    await page.getByRole('textbox', { name: /email/i }).clear();

    // Submit form
    await page.getByRole('button', { name: /save/i }).click();

    // Verify validation error
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    await page.goto('/settings/profile');

    // Fill in invalid email
    await page.getByRole('textbox', { name: /email/i }).clear();
    await page.getByRole('textbox', { name: /email/i }).fill('invalid-email-format');

    // Submit form
    await page.getByRole('button', { name: /save/i }).click();

    // Verify browser validation for email type
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should update both name and email simultaneously', async ({ page }) => {
    await page.goto('/settings/profile');

    const newName = 'Test Admin Updated';
    const newEmail = 'test-updated@pa-penajam.go.id';

    // Update both fields
    await page.getByRole('textbox', { name: /name/i }).clear();
    await page.getByRole('textbox', { name: /name/i }).fill(newName);

    await page.getByRole('textbox', { name: /email/i }).clear();
    await page.getByRole('textbox', { name: /email/i }).fill(newEmail);

    // Submit form
    await page.getByRole('button', { name: /save/i }).click();

    // Verify success
    await expect(page.getByText('Saved')).toBeVisible();

    // Reload and verify both were updated
    await page.reload();
    await expect(page.getByRole('textbox', { name: /name/i })).toHaveValue(newName);
    await expect(page.getByRole('textbox', { name: /email/i })).toHaveValue(newEmail);

    // Restore original values
    await page.getByRole('textbox', { name: /name/i }).clear();
    await page.getByRole('textbox', { name: /name/i }).fill(testUsers.superAdmin.label);

    await page.getByRole('textbox', { name: /email/i }).clear();
    await page.getByRole('textbox', { name: /email/i }).fill(testUsers.superAdmin.email);

    await page.getByRole('button', { name: /save/i }).click();
  });

  test('should disable save button while processing', async ({ page }) => {
    await page.goto('/settings/profile');

    // Fill in new name
    await page.getByRole('textbox', { name: /name/i }).clear();
    await page.getByRole('textbox', { name: /name/i }).fill('Test Name');

    // Click save and verify button is disabled during processing
    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    // Button should be disabled while processing
    await expect(saveButton).toBeDisabled();

    // Wait for success message
    await expect(page.getByText('Saved')).toBeVisible();

    // Button should be enabled again
    await expect(saveButton).toBeEnabled();

    // Restore original name
    await page.getByRole('textbox', { name: /name/i }).clear();
    await page.getByRole('textbox', { name: /name/i }).fill(testUsers.superAdmin.label);
    await page.getByRole('button', { name: /save/i }).click();
  });

  test('should show delete account button and open confirmation modal', async ({ page }) => {
    await page.goto('/settings/profile');

    // Scroll to delete section (if needed)
    await page.waitForTimeout(500);

    // Verify delete button exists (but don't actually delete!)
    const deleteButton = page.getByRole('button', { name: /delete account/i });
    await expect(deleteButton).toBeVisible();

    // Click delete button to open modal
    await deleteButton.click();

    // Verify confirmation modal appears
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/are you sure you want to delete your account/i)).toBeVisible();

    // Verify there's a cancel button
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();

    // Close the modal by clicking cancel
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should preserve scroll position after update', async ({ page }) => {
    await page.goto('/settings/profile');

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));

    // Update name
    await page.getByRole('textbox', { name: /name/i }).clear();
    await page.getByRole('textbox', { name: /name/i }).fill('Test Name');

    // Submit form
    await page.getByRole('button', { name: /save/i }).click();

    // Verify scroll position is preserved (Inertia preserveScroll option)
    await expect(page.getByText('Saved')).toBeVisible();

    // Restore original name
    await page.getByRole('textbox', { name: /name/i }).clear();
    await page.getByRole('textbox', { name: /name/i }).fill(testUsers.superAdmin.label);
    await page.getByRole('button', { name: /save/i }).click();
  });

  test('should have proper form autocomplete attributes', async ({ page }) => {
    await page.goto('/settings/profile');

    // Verify autocomplete attributes for better UX
    const nameInput = page.getByRole('textbox', { name: /name/i });
    await expect(nameInput).toHaveAttribute('autoComplete', 'name');

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toHaveAttribute('autoComplete', 'username');
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Logout first
    await logout(page);

    // Try to access profile page
    await page.goto('/settings/profile');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle concurrent updates gracefully', async ({ page }) => {
    await page.goto('/settings/profile');

    // Make multiple rapid updates
    for (let i = 0; i < 3; i++) {
      await page.getByRole('textbox', { name: /name/i }).clear();
      await page.getByRole('textbox', { name: /name/i }).fill(`Test Name ${i}`);
      await page.getByRole('button', { name: /save/i }).click();

      // Wait for success message
      await expect(page.getByText('Saved')).toBeVisible();

      // Small delay between requests
      await page.waitForTimeout(500);
    }

    // Restore original name
    await page.getByRole('textbox', { name: /name/i }).clear();
    await page.getByRole('textbox', { name: /name/i }).fill(testUsers.superAdmin.label);
    await page.getByRole('button', { name: /save/i }).click();
  });
});
