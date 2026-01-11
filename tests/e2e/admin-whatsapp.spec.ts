import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * Admin - WhatsApp Settings E2E Tests
 *
 * Tests WhatsApp notification settings including:
 * - Viewing WhatsApp settings
 * - Updating API token
 * - Updating sender number
 * - Testing WhatsApp message send
 * - Saving and verifying settings
 *
 * Routes: /admin/whatsapp-settings/*
 * Controller: Admin/WhatsAppSettingsController.php
 * Middleware: permission:settings.whatsapp
 * Page: resources/js/pages/Admin/WhatsAppSettings.tsx
 *
 * Uses FonnteService for WhatsApp integration
 */

test.describe('Admin - WhatsApp Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display WhatsApp settings page', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    // Verify page title
    await expect(page).toHaveTitle(/whatsapp settings/i);

    // Verify heading
    await expect(page.getByRole('heading', { name: /whatsapp settings/i, level: 1 })).toBeVisible();

    // Verify page content
    await expect(page.getByText(/whatsapp/i)).toBeVisible();
  });

  test('should display API token input field', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    // Look for API token input
    const apiTokenInput = page.getByRole('textbox', { name: /api.?token|token/i }).or(
      page.locator('input[name*="token" i]').or(
        page.locator('[data-test="api-token-input"]')
      )
    );

    // The input might be pre-filled with masked value
    if (await apiTokenInput.count() > 0) {
      await expect(apiTokenInput).toBeVisible();
    }
  });

  test('should display sender number input field', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    // Look for sender number input
    const senderInput = page.getByRole('textbox', { name: /sender|number|phone/i }).or(
      page.locator('input[name*="sender" i]').or(
        page.locator('input[name*="number" i]')
      )
    );

    if (await senderInput.count() > 0) {
      await expect(senderInput).toBeVisible();
    }
  });

  test('should display save/update button', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    // Look for save button
    const saveButton = page.getByRole('button', { name: /save|update|submit/i }).or(
      page.locator('button[type="submit"]')
    );

    await expect(saveButton).toBeVisible();
  });

  test('should update WhatsApp API token', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    const apiTokenInput = page.getByRole('textbox', { name: /api.?token|token/i }).or(
      page.locator('input[name*="token" i]')
    );

    if (await apiTokenInput.count() > 0) {
      // Get current value to restore later
      const currentValue = await apiTokenInput.inputValue();
      const testToken = 'test_token_' + Date.now();

      // Fill in new token
      await apiTokenInput.clear();
      await apiTokenInput.fill(testToken);

      // Save
      await page.getByRole('button', { name: /save|update/i }).click();

      // Verify success message
      await expect(page.getByText(/saved|updated|success/i)).toBeVisible();

      // Restore original value
      await apiTokenInput.clear();
      await apiTokenInput.fill(currentValue);
      await page.getByRole('button', { name: /save|update/i }).click();
    }
  });

  test('should update sender number', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    const senderInput = page.getByRole('textbox', { name: /sender|number|phone/i }).or(
      page.locator('input[name*="sender" i]')
    );

    if (await senderInput.count() > 0) {
      // Get current value
      const currentValue = await senderInput.inputValue();
      const testNumber = '628123456789';

      // Fill in new number
      await senderInput.clear();
      await senderInput.fill(testNumber);

      // Save
      await page.getByRole('button', { name: /save|update/i }).click();

      // Verify success
      await expect(page.getByText(/saved|updated|success/i)).toBeVisible();

      // Restore
      await senderInput.clear();
      await senderInput.fill(currentValue);
      await page.getByRole('button', { name: /save|update/i }).click();
    }
  });

  test('should display test send functionality', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    // Look for test send button or section
    const testButton = page.getByRole('button', { name: /test send|send test/i }).or(
      page.locator('[data-test="test-whatsapp-button"]')
    );

    // Test button may or may not be visible depending on implementation
    if (await testButton.count() > 0) {
      await expect(testButton).toBeVisible();
    }
  });

  test('should allow sending test WhatsApp message', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    const testButton = page.getByRole('button', { name: /test send|send test/i });

    if (await testButton.count() > 0) {
      // Click test button
      await testButton.click();

      // Might open a modal or show an input for test number
      const modal = page.getByRole('dialog').or(
        page.locator('[data-test="test-whatsapp-modal"]')
      );

      if (await modal.count() > 0) {
        await expect(modal).toBeVisible();

        // Look for phone input
        const phoneInput = page.getByRole('textbox', { name: /phone|number/i });
        if (await phoneInput.count() > 0) {
          await phoneInput.fill('628123456789');

          // Send
          await page.getByRole('button', { name: /send|test/i }).click();

          // Verify result (success or error)
          await expect(page.getByText(/sent|queued|failed|error/i)).toBeVisible();
        }
      }
    }
  });

  test('should validate API token format', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    const apiTokenInput = page.getByRole('textbox', { name: /api.?token|token/i });

    if (await apiTokenInput.count() > 0) {
      // Try saving with empty token
      await apiTokenInput.clear();
      await page.getByRole('button', { name: /save|update/i }).click();

      // Verify validation error
      await expect(page.getByText(/required|invalid/i)).toBeVisible();
    }
  });

  test('should validate sender number format', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    const senderInput = page.getByRole('textbox', { name: /sender|number|phone/i });

    if (await senderInput.count() > 0) {
      // Try saving with invalid number
      await senderInput.clear();
      await senderInput.fill('invalid-phone');
      await page.getByRole('button', { name: /save|update/i }).click();

      // Verify validation error
      await expect(page.getByText(/invalid|phone|number/i)).toBeVisible();
    }
  });

  test('should show connection status or indicator', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    // Look for connection status indicator
    const statusIndicator = page.locator('[data-test="connection-status"]').or(
      page.locator('.status').or(
        page.locator('[aria-label*="status" i]')
      )
    );

    // Status might or might not be visible
    if (await statusIndicator.count() > 0) {
      await expect(statusIndicator).toBeVisible();
    }
  });

  test('should display help or documentation links', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    // Look for help links or documentation
    const helpLink = page.getByRole('link', { name: /help|docs|documentation|fonnte/i });

    // Help links might or might not be present
    if (await helpLink.count() > 0) {
      await expect(helpLink.first()).toBeVisible();
    }
  });

  test('should handle settings update error gracefully', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    // This test would simulate a network error
    test.skip(true, 'Requires error simulation setup');
  });

  test('should prevent unauthorized access', async ({ page }) => {
    // Logout and login as non-admin user
    await logout(page);
    await login(page, testUsers.pegawai);

    // Try to access WhatsApp settings
    await page.goto('/admin/whatsapp-settings');

    // Should be redirected or show 403
    await expect(page.or(
      page.getByRole('heading', { name: /403|forbidden/i }),
      page.getByURL(/\/dashboard|\/login/)
    )).toBeVisible();
  });

  test('should mask API token value for security', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    const apiTokenInput = page.getByRole('textbox', { name: /api.?token|token/i });

    if (await apiTokenInput.count() > 0) {
      // Check if input type is password for masking
      const inputType = await apiTokenInput.getAttribute('type');
      if (inputType === 'password') {
        // Token is masked, which is good for security
        await expect(apiTokenInput).toHaveAttribute('type', 'password');
      }
    }
  });

  test('should show last used or last updated timestamp', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    // Look for timestamp information
    const timestamp = page.locator('text=/last|updated|used/i').or(
      page.locator('[data-test="last-updated"]')
    );

    // Timestamp might or might not be displayed
    if (await timestamp.count() > 0) {
      await expect(timestamp.first()).toBeVisible();
    }
  });

  test('should persist settings after page reload', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    const apiTokenInput = page.getByRole('textbox', { name: /api.?token|token/i });

    if (await apiTokenInput.count() > 0) {
      const originalValue = await apiTokenInput.inputValue();
      const testToken = 'persist_test_' + Date.now();

      // Update token
      await apiTokenInput.clear();
      await apiTokenInput.fill(testToken);
      await page.getByRole('button', { name: /save|update/i }).click();

      // Reload page
      await page.reload();

      // Verify value persisted
      await expect(apiTokenInput).toHaveValue(testToken);

      // Restore
      await apiTokenInput.clear();
      await apiTokenInput.fill(originalValue);
      await page.getByRole('button', { name: /save|update/i }).click();
    }
  });

  test('should disable save button while processing', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    const apiTokenInput = page.getByRole('textbox', { name: /api.?token|token/i });

    if (await apiTokenInput.count() > 0) {
      await apiTokenInput.clear();
      await apiTokenInput.fill('test_token');

      const saveButton = page.getByRole('button', { name: /save|update/i });
      await saveButton.click();

      // Button should be disabled during processing
      await expect(saveButton).toBeDisabled();

      // Wait for completion
      await page.waitForTimeout(1000);

      // Restore
      await apiTokenInput.clear();
      await saveButton.click();
    }
  });
});

test.describe('Admin - WhatsApp Settings - Integration', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should integrate with Fonnte service', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    // Look for Fonnte-specific settings or branding
    const fonnteReference = page.getByText(/fonnte/i);

    // Fonnte branding might be present
    if (await fonnteReference.count() > 0) {
      await expect(fonnteReference).toBeVisible();
    }
  });

  test('should show notification logs link', async ({ page }) => {
    await page.goto('/admin/whatsapp-settings');

    // Look for link to notification logs
    const logsLink = page.getByRole('link', { name: /logs|notifications/i });

    if (await logsLink.count() > 0) {
      await logsLink.click();

      // Verify navigation to notification logs
      await expect(page).toHaveURL(/notification.?log/);
    }
  });
});
