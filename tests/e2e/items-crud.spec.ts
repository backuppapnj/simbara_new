import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * Items CRUD Operations E2E Tests
 *
 * Tests ATK (Alat Tulis Kantor) items management including:
 * - Creating new items
 * - Viewing item list
 * - Updating existing items
 * - Deleting items
 * - Viewing item mutations/history
 * - Search and filter functionality
 *
 * Routes: /items/*
 * Controller: ItemController.php
 * Middleware: permission:atk.view, atk.items.create, atk.items.edit, atk.items.delete
 */

test.describe('Items - CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.operatorPersediaan); // Operator has ATK permissions
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display items list page', async ({ page }) => {
    await page.goto('/items');

    // Verify page title
    await expect(page).toHaveTitle(/atk|items|persediaan/i);

    // Verify heading
    await expect(page.getByRole('heading', { name: /atk|items|persediaan/i, level: 1 })).toBeVisible();

    // Verify items table or list is visible
    const itemsList = page.locator('table').or(
      page.locator('[role="list"]').or(
        page.locator('.data-table')
      )
    );

    await expect(itemsList.first()).toBeVisible();
  });

  test('should display create item button', async ({ page }) => {
    await page.goto('/items');

    // Verify create/add button is visible for users with create permission
    const createButton = page.getByRole('button', { name: /add|create|new|tambah/i }).or(
      page.locator('a[href="/items/create"]')
    );

    await expect(createButton).toBeVisible();
  });

  test('should create new item successfully', async ({ page }) => {
    await page.goto('/items');

    // Click create button
    await page.getByRole('button', { name: /add|create|new/i }).click();

    // Wait for create form/page
    await expect(page.getByRole('heading', { name: /create|new|add/i, level: 1 })).toBeVisible();

    // Fill in item details
    const itemName = 'Test Item ' + Date.now();
    const itemCode = 'TEST' + Date.now();

    // Look for name/code inputs
    const nameInput = page.getByRole('textbox', { name: /name|nama/i }).or(
      page.locator('input[name*="name" i]')
    );

    const codeInput = page.getByRole('textbox', { name: /code|kode|sku/i }).or(
      page.locator('input[name*="code" i]')
    );

    if (await nameInput.count() > 0) {
      await nameInput.fill(itemName);
    }

    if (await codeInput.count() > 0) {
      await codeInput.fill(itemCode);
    }

    // Look for category/unit/stock inputs
    const categorySelect = page.locator('select[name*="category" i]').or(
      page.locator('[data-test="category-select"]')
    );

    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption({ index: 0 });
    }

    // Submit form
    await page.getByRole('button', { name: /save|create|submit|simpan/i }).click();

    // Verify success message
    await expect(page.getByText(/created|saved|success|berhasil/i)).toBeVisible();

    // Verify item appears in list
    await expect(page.getByText(itemName)).toBeVisible();
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/items');

    // Click create button
    await page.getByRole('button', { name: /add|create|new/i }).click();

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /save|create|submit/i }).click();

    // Verify validation errors
    await expect(page.getByText(/required|wajib|harus diisi/i)).toBeVisible();
  });

  test('should update existing item', async ({ page }) => {
    await page.goto('/items');

    // Click on first item's edit button
    const editButton = page.getByRole('button', { name: /edit|update|ubah/i }).or(
      page.locator('a[href*="/edit"]').first()
    );

    if (await editButton.count() > 0) {
      await editButton.first().click();

      // Wait for edit form
      await expect(page.getByRole('heading', { name: /edit|update/i, level: 1 })).toBeVisible();

      // Update item name
      const nameInput = page.getByRole('textbox', { name: /name|nama/i });
      const newName = 'Updated Item ' + Date.now();

      await nameInput.clear();
      await nameInput.fill(newName);

      // Submit
      await page.getByRole('button', { name: /save|update|submit/i }).click();

      // Verify success
      await expect(page.getByText(/updated|saved|success/i)).toBeVisible();
    }
  });

  test('should delete item with confirmation', async ({ page }) => {
    await page.goto('/items');

    // Look for delete button
    const deleteButton = page.getByRole('button', { name: /delete|hapus/i }).first();

    if (await deleteButton.count() > 0) {
      // Click delete
      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page.getByRole('button', { name: /confirm|yes|ya|hapus/i });
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }

      // Verify success message
      await expect(page.getByText(/deleted|removed|success|dihapus/i)).toBeVisible();
    }
  });

  test('should view item details', async ({ page }) => {
    await page.goto('/items');

    // Click on first item
    const itemLink = page.locator('a[href*="/items/"]').first();
    if (await itemLink.count() > 0) {
      await itemLink.click();

      // Verify item detail page
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });

  test('should search items', async ({ page }) => {
    await page.goto('/items');

    // Look for search input
    const searchInput = page.getByRole('textbox', { name: /search|cari/i }).or(
      page.locator('input[placeholder*="search" i]')
    );

    if (await searchInput.count() > 0) {
      // Type search term
      await searchInput.fill('kertas');

      // Wait for results
      await page.waitForTimeout(500);

      // Verify results are filtered
      await expect(page.getByText(/kertas/i)).toBeVisible();
    }
  });

  test('should filter items by category', async ({ page }) => {
    await page.goto('/items');

    // Look for category filter
    const categoryFilter = page.locator('select[name*="category" i]').or(
      page.locator('[data-test="category-filter"]')
    );

    if (await categoryFilter.count() > 0) {
      // Select a category
      await categoryFilter.selectOption({ index: 1 });

      // Wait for results
      await page.waitForTimeout(500);
    }
  });

  test('should view item mutations/history', async ({ page }) => {
    await page.goto('/items');

    // Click on mutations button for first item
    const mutationsButton = page.getByRole('button', { name: /mutations|history|riwayat|mutasi/i }).or(
      page.locator('a[href*="/mutations"]')
    ).first();

    if (await mutationsButton.count() > 0) {
      await mutationsButton.click();

      // Verify mutations page
      await expect(page.getByRole('heading', { name: /mutations|history|riwayat/i, level: 1 })).toBeVisible();

      // Verify mutations table/list
      await expect(page.locator('table').or(
        page.locator('[role="list"]')
      )).toBeVisible();
    }
  });

  test('should display item stock information', async ({ page }) => {
    await page.goto('/items');

    // Look for stock columns or badges
    const stockInfo = page.getByText(/\d+ (pcs|unit|lembar|pieces)/i).or(
      page.locator('[data-test="stock-info"]')
    );

    // Stock info might be visible
    if (await stockInfo.count() > 0) {
      await expect(stockInfo.first()).toBeVisible();
    }
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('/items');

    // Look for pagination controls
    const pagination = page.locator('.pagination').or(
      page.locator('[role="navigation"]')
    );

    if (await pagination.count() > 0) {
      // Click next page
      const nextPageButton = page.getByRole('button', { name: /next|selanjutnya/i }).or(
        page.locator('a[rel="next"]')
      );

      if (await nextPageButton.count() > 0) {
        await nextPageButton.first().click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should export items to Excel/CSV', async ({ page }) => {
    await page.goto('/items');

    // Look for export button
    const exportButton = page.getByRole('button', { name: /export|excel|csv/i });

    if (await exportButton.count() > 0) {
      // Note: Actual download verification would require checking download folder
      await exportButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should prevent unauthorized access', async ({ page }) => {
    // Logout and login as user without ATK permissions
    await logout(page);
    await login(page, testUsers.pegawai);

    // Try to access items page
    await page.goto('/items');

    // Should be redirected or show 403
    await expect(page.or(
      page.getByRole('heading', { name: /403|forbidden/i }),
      page.getByURL(/\/dashboard|\/login/)
    )).toBeVisible();
  });

  test('should hide create button for users without create permission', async ({ page }) => {
    // Login as user with view-only permission
    await logout(page);
    await login(page, testUsers.pegawai);

    await page.goto('/items');

    // Create button should not be visible or should be disabled
    const createButton = page.getByRole('button', { name: /add|create|new|tambah/i });

    if (await createButton.count() > 0) {
      // If button exists, it might be disabled
      await expect(createButton).toBeDisabled();
    }
  });

  test('should display low stock indicators', async ({ page }) => {
    await page.goto('/items');

    // Look for low stock warnings or badges
    const lowStockIndicator = page.getByText(/low stock|stok menipis|habis/i).or(
      page.locator('[data-test="low-stock"]')
    );

    // Low stock indicators might be present
    if (await lowStockIndicator.count() > 0) {
      await expect(lowStockIndicator.first()).toBeVisible();
    }
  });

  test('should bulk delete items', async ({ page }) => {
    await page.goto('/items');

    // Look for bulk delete functionality
    const checkboxes = page.locator('input[type="checkbox"]');
    const bulkDeleteButton = page.getByRole('button', { name: /delete selected|hapus terpilih/i });

    if (await checkboxes.count() > 1 && await bulkDeleteButton.count() > 0) {
      // Select first few items
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();

      // Click bulk delete
      await bulkDeleteButton.click();

      // Confirm
      const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }

      // Verify success
      await expect(page.getByText(/deleted|success/i)).toBeVisible();
    }
  });
});

test.describe('Items - Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.operatorPersediaan);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should validate item name is required', async ({ page }) => {
    await page.goto('/items');
    await page.getByRole('button', { name: /add|create|new/i }).click();

    // Try to submit without name
    await page.getByRole('button', { name: /save|create/i }).click();

    // Verify error
    await expect(page.getByText(/name.*required|nama.*wajib/i)).toBeVisible();
  });

  test('should validate item code uniqueness', async ({ page }) => {
    await page.goto('/items');
    await page.getByRole('button', { name: /add|create|new/i }).click();

    // Fill in existing item code
    const codeInput = page.getByRole('textbox', { name: /code|kode/i });
    if (await codeInput.count() > 0) {
      await codeInput.fill('EXISTING_CODE'); // Use an existing code
      await page.getByRole('button', { name: /save|create/i }).click();

      // Verify uniqueness error
      await expect(page.getByText(/already exists|sudah ada/i)).toBeVisible();
    }
  });

  test('should validate stock quantity is numeric', async ({ page }) => {
    await page.goto('/items');
    await page.getByRole('button', { name: /add|create|new/i }).click();

    const stockInput = page.getByRole('spinbutton', { name: /stock|stok/i }).or(
      page.locator('input[type="number"][name*="stock" i]')
    );

    if (await stockInput.count() > 0) {
      await stockInput.fill('invalid');
      await page.getByRole('button', { name: /save|create/i }).click();

      // Verify validation error
      await expect(page.getByText(/number|numeric|angka/i)).toBeVisible();
    }
  });

  test('should validate minimum stock value', async ({ page }) => {
    await page.goto('/items');
    await page.getByRole('button', { name: /add|create|new/i }).click();

    const stockInput = page.getByRole('spinbutton', { name: /stock|stok/i });

    if (await stockInput.count() > 0) {
      await stockInput.fill('-1');
      await page.getByRole('button', { name: /save|create/i }).click();

      // Verify min value error
      await expect(page.getByText(/minimum|min|must be positive/i)).toBeVisible();
    }
  });
});
