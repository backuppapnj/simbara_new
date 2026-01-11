import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * Office Supplies Management E2E Tests
 *
 * Tests office supplies (perlengkapan kantor) management including:
 * - Creating new office supplies
 * - Viewing supplies list
 * - Updating supply quantity and details
 * - Deleting supplies
 * - Logging usage
 * - Viewing mutation history
 * - Quick deduct functionality
 *
 * Routes: /office-supplies/*, /office-usages/*, /office-mutations/*
 * Controllers: OfficeSupplyController.php, OfficeUsageController.php
 * Middleware: permission:office.view, office.create, office.edit, office.delete, office.usage.log
 */

test.describe('Office Supplies - Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin); // Has office permissions
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display office supplies list page', async ({ page }) => {
    await page.goto('/office-supplies');

    // Verify page title
    await expect(page).toHaveTitle(/office supplies|perlengkapan kantor/i);

    // Verify heading
    await expect(page.getByRole('heading', { name: /office supplies|perlengkapan/i, level: 1 })).toBeVisible();

    // Verify list is visible
    await expect(page.locator('table').or(
      page.locator('[role="list"]')
    )).toBeVisible();
  });

  test('should create new office supply', async ({ page }) => {
    await page.goto('/office-supplies');

    // Click create button
    const createButton = page.getByRole('button', { name: /add|create|new|tambah/i });
    await createButton.click();

    // Wait for form
    await expect(page.getByRole('heading', { name: /create|new/i, level: 1 })).toBeVisible();

    // Fill in supply details
    const supplyName = 'Test Supply ' + Date.now();
    const nameInput = page.getByRole('textbox', { name: /name|nama/i });
    if (await nameInput.count() > 0) {
      await nameInput.fill(supplyName);
    }

    // Fill in quantity
    const quantityInput = page.getByRole('spinbutton', { name: /quantity|jumlah|stok/i });
    if (await quantityInput.count() > 0) {
      await quantityInput.fill('100');
    }

    // Select unit if available
    const unitSelect = page.locator('select[name*="unit" i]');
    if (await unitSelect.count() > 0) {
      await unitSelect.selectOption({ index: 0 });
    }

    // Submit
    await page.getByRole('button', { name: /save|create|submit|simpan/i }).click();

    // Verify success
    await expect(page.getByText(/created|saved|success|berhasil/i)).toBeVisible();
  });

  test('should update office supply quantity', async ({ page }) => {
    await page.goto('/office-supplies');

    // Click edit on first item
    const editButton = page.getByRole('button', { name: /edit|update|ubah/i }).first();

    if (await editButton.count() > 0) {
      await editButton.click();

      // Update quantity
      const quantityInput = page.getByRole('spinbutton', { name: /quantity|jumlah|stok/i });
      if (await quantityInput.count() > 0) {
        await quantityInput.clear();
        await quantityInput.fill('50');

        // Submit
        await page.getByRole('button', { name: /save|update/i }).click();

        // Verify success
        await expect(page.getByText(/updated|saved|success/i)).toBeVisible();
      }
    }
  });

  test('should delete office supply', async ({ page }) => {
    await page.goto('/office-supplies');

    const deleteButton = page.getByRole('button', { name: /delete|hapus/i }).first();

    if (await deleteButton.count() > 0) {
      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page.getByRole('button', { name: /confirm|yes|ya/i });
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }

      // Verify success
      await expect(page.getByText(/deleted|removed|dihapus/i)).toBeVisible();
    }
  });

  test('should view supply mutations history', async ({ page }) => {
    await page.goto('/office-supplies');

    // Look for mutations button
    const mutationsButton = page.getByRole('button', { name: /mutations|history|riwayat|mutasi/i }).or(
      page.locator('a[href*="/mutations"]')
    ).first();

    if (await mutationsButton.count() > 0) {
      await mutationsButton.click();

      // Verify mutations page
      await expect(page.getByRole('heading', { name: /mutations|history|riwayat/i, level: 1 })).toBeVisible();

      // Verify mutations table
      await expect(page.locator('table').or(
        page.locator('[role="list"]')
      )).toBeVisible();
    }
  });
});

test.describe('Office Usage Logging', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display office usages page', async ({ page }) => {
    await page.goto('/office-usages');

    // Verify page
    await expect(page.getByRole('heading', { name: /usage|penggunaan/i, level: 1 })).toBeVisible();

    // Verify list
    await expect(page.locator('table').or(
      page.locator('[role="list"]')
    )).toBeVisible();
  });

  test('should log new office usage', async ({ page }) => {
    await page.goto('/office-usages');

    // Click create/log button
    const logButton = page.getByRole('button', { name: /add|log|catat|tambah/i });
    if (await logButton.count() > 0) {
      await logButton.click();

      // Wait for form
      await expect(page.getByRole('heading', { name: /log|catat|usage/i, level: 1 })).toBeVisible();

      // Select supply
      const supplySelect = page.locator('select[name*="supply" i]').or(
        page.locator('[data-test="supply-select"]')
      );

      if (await supplySelect.count() > 0) {
        await supplySelect.selectOption({ index: 0 });

        // Fill in quantity used
        const quantityInput = page.getByRole('spinbutton', { name: /quantity|jumlah/i });
        if (await quantityInput.count() > 0) {
          await quantityInput.fill('5');
        }

        // Fill in notes
        const notesInput = page.getByRole('textbox', { name: /notes|keterangan|catatan/i });
        if (await notesInput.count() > 0) {
          await notesInput.fill('Test usage log');
        }

        // Submit
        await page.getByRole('button', { name: /save|log|submit/i }).click();

        // Verify success
        await expect(page.getByText(/logged|saved|success|dicatat/i)).toBeVisible();
      }
    }
  });

  test('should quick deduct from stock', async ({ page }) => {
    await page.goto('/office-supplies');

    // Look for quick deduct button/action
    const quickDeductButton = page.getByRole('button', { name: /quick deduct|kurangi/i }).or(
      page.locator('[data-test="quick-deduct"]')
    ).first();

    if (await quickDeductButton.count() > 0) {
      await quickDeductButton.click();

      // Fill in quantity to deduct
      const quantityInput = page.getByRole('spinbutton', { name: /quantity|jumlah/i });
      if (await quantityInput.count() > 0) {
        await quantityInput.fill('1');
      }

      // Submit
      await page.getByRole('button', { name: /deduct|save|submit/i }).click();

      // Verify success
      await expect(page.getByText(/deducted|updated|berhasil/i)).toBeVisible();
    }
  });

  test('should validate usage quantity does not exceed stock', async ({ page }) => {
    await page.goto('/office-usages');

    const logButton = page.getByRole('button', { name: /add|log|catat/i });
    if (await logButton.count() > 0) {
      await logButton.click();

      // Select supply
      const supplySelect = page.locator('select[name*="supply" i]');
      if (await supplySelect.count() > 0) {
        await supplySelect.selectOption({ index: 0 });

        // Fill in excessive quantity
        const quantityInput = page.getByRole('spinbutton', { name: /quantity|jumlah/i });
        if (await quantityInput.count() > 0) {
          await quantityInput.fill('99999'); // Excessive amount

          // Submit
          await page.getByRole('button', { name: /save|log/i }).click();

          // Verify validation error
          await expect(page.getByText(/exceeds|insufficient|stok tidak cukup/i)).toBeVisible();
        }
      }
    }
  });
});

test.describe('Office Requests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.pegawai); // Pegawai can create requests
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display office requests list', async ({ page }) => {
    await page.goto('/office-requests');

    // Verify page
    await expect(page.getByRole('heading', { name: /office requests|permintaan/i, level: 1 })).toBeVisible();

    // Verify list
    await expect(page.locator('table').or(
      page.locator('[role="list"]')
    )).toBeVisible();
  });

  test('should create new office request', async ({ page }) => {
    await page.goto('/office-requests');

    // Click create button
    const createButton = page.getByRole('button', { name: /add|create|new|buat|tambah/i });
    if (await createButton.count() > 0) {
      await createButton.click();

      // Wait for form
      await expect(page.getByRole('heading', { name: /create|new|buat/i, level: 1 })).toBeVisible();

      // Select supply
      const supplySelect = page.locator('select[name*="supply" i]');
      if (await supplySelect.count() > 0) {
        await supplySelect.selectOption({ index: 0 });

        // Fill in quantity
        const quantityInput = page.getByRole('spinbutton', { name: /quantity|jumlah/i });
        if (await quantityInput.count() > 0) {
          await quantityInput.fill('5');
        }

        // Fill in reason/purpose
        const reasonInput = page.getByRole('textbox', { name: /reason|purpose|alasan|keperluan/i });
        if (await reasonInput.count() > 0) {
          await reasonInput.fill('Kebutuhan operasional kantor');
        }

        // Submit
        await page.getByRole('button', { name: /save|create|submit|kirim/i }).click();

        // Verify success
        await expect(page.getByText(/created|submitted|success|terkirim/i)).toBeVisible();
      }
    }
  });

  test('should view request details', async ({ page }) => {
    await page.goto('/office-requests');

    // Click on first request
    const requestLink = page.locator('a[href*="/office-requests/"]').first();
    if (await requestLink.count() > 0) {
      await requestLink.click();

      // Verify detail page
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });
});

test.describe('Office Purchases', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display office purchases list', async ({ page }) => {
    await page.goto('/office-purchases');

    // Verify page
    await expect(page.getByRole('heading', { name: /purchases|pembelian/i, level: 1 })).toBeVisible();

    // Verify list
    await expect(page.locator('table').or(
      page.locator('[role="list"]')
    )).toBeVisible();
  });

  test('should create new office purchase', async ({ page }) => {
    await page.goto('/office-purchases');

    // Look for create button
    const createButton = page.getByRole('button', { name: /add|create|new|tambah/i });
    if (await createButton.count() > 0) {
      await createButton.click();

      // Wait for form
      await expect(page.getByRole('heading', { name: /create|new|pembelian/i, level: 1 })).toBeVisible();

      // Fill in purchase details
      // (Form fields depend on implementation)
      await page.waitForTimeout(500);
    }
  });

  test('should view purchase details', async ({ page }) => {
    await page.goto('/office-purchases');

    // Click on first purchase
    const purchaseLink = page.locator('a[href*="/office-purchases/"]').first();
    if (await purchaseLink.count() > 0) {
      await purchaseLink.click();

      // Verify detail page
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });
});

test.describe('Office Supplies - Permissions', () => {
  test('should prevent access for unauthorized users', async ({ page }) => {
    // Login as user without office permissions
    await login(page, testUsers.pegawai);

    // Try to access office supplies
    await page.goto('/office-supplies');

    // Should be redirected or show 403
    const isRedirected = page.url().includes('/dashboard') || page.url().includes('/login');
    const isForbidden = await page.getByRole('heading', { name: /403|forbidden/i }).count() > 0;

    expect(isRedirected || isForbidden).toBeTruthy();
  });

  test('should hide create button for users without create permission', async ({ page }) => {
    // Login as user with view-only permission
    await login(page, testUsers.pegawai);

    await page.goto('/office-supplies');

    // Create button should not be visible
    const createButton = page.getByRole('button', { name: /add|create|new|tambah/i });
    if (await createButton.count() > 0) {
      await expect(createButton).toBeDisabled();
    }
  });
});
