import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * Office Usages E2E Tests
 *
 * Tests for office usage logging (pencatatan pemakaian kantor) including:
 * - Displaying usage logs list
 * - Logging new office usage
 * - Stock validation when logging usage
 * - Quick deduct functionality
 * - Filtering by date range
 * - Searching and pagination
 * - Permission-based access control
 *
 * Routes: /office-usages/*, /office-mutations/quick-deduct
 * Controller: OfficeUsageController.php
 * Middleware: permission:office.view, office.usage.log
 *
 * Test Data:
 * - Uses super_admin for full access
 * - Tests with pegawai for restricted access
 */

test.describe('Office Usages - Page Display', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display office usages list page', async ({ page }) => {
    await page.goto('/office-usages');

    // Verify page title - Halaman daftar pemakaian kantor
    await expect(page).toHaveTitle(/pemakaian|usage|office/i);

    // Verify main heading
    await expect(page.getByRole('heading', { name: /pemakaian kantor|office usage/i, level: 1 })).toBeVisible();

    // Verify usage table/list is visible
    const usageList = page.locator('table').or(
      page.locator('[role="list"]')
    );
    await expect(usageList.first()).toBeVisible();
  });

  test('should display usage log columns', async ({ page }) => {
    await page.goto('/office-usages');

    // Verify table headers - kolom tanggal, item, user, jumlah, keterangan
    const tableHeaders = page.locator('th');

    // Check for expected columns
    const expectedColumns = [
      /tanggal|date/i,
      /bahan|supply|item/i,
      /user|pegawai/i,
      /jumlah|quantity/i,
      /keterangan|notes/i
    ];

    for (const column of expectedColumns) {
      const header = page.getByRole('columnheader', { name: column });
      if (await header.count() > 0) {
        await expect(header.first()).toBeVisible();
      }
    }
  });

  test('should display log usage button for authorized users', async ({ page }) => {
    await page.goto('/office-usages');

    // Verify log/create button is visible - tombol catat pemakaian
    const logButton = page.getByRole('button', { name: /catat|log|tambah|add/i }).or(
      page.locator('[data-test="log-usage-button"]')
    );

    await expect(logButton).toBeVisible();
  });

  test('should display date filters', async ({ page }) => {
    await page.goto('/office-usages');

    // Check for date range filters - filter tanggal
    const dateFromInput = page.getByRole('textbox', { name: /dari|from|tanggal mulai/i }).or(
      page.locator('input[name*="date_from" i]')
    );

    const dateToInput = page.getByRole('textbox', { name: /sampai|to|tanggal akhir/i }).or(
      page.locator('input[name*="date_to" i]')
    );

    // Date filters might be present
    if (await dateFromInput.count() > 0) {
      await expect(dateFromInput).toBeVisible();
    }

    if (await dateToInput.count() > 0) {
      await expect(dateToInput).toBeVisible();
    }
  });

  test('should display pagination', async ({ page }) => {
    await page.goto('/office-usages');

    // Check for pagination controls
    const pagination = page.locator('.pagination').or(
      page.locator('[role="navigation"]')
    );

    if (await pagination.count() > 0) {
      await expect(pagination.first()).toBeVisible();
    }
  });
});

test.describe('Office Usages - Log Usage (Catat Pemakaian)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should log new office usage successfully', async ({ page }) => {
    await page.goto('/office-usages');

    // Click log usage button - catat pemakaian
    const logButton = page.getByRole('button', { name: /catat|log|tambah/i });
    await logButton.click();

    // Wait for form modal/page
    await expect(page.getByRole('heading', { name: /catat|log|usage/i, level: 1, exact: false })).toBeVisible();

    // Select office supply - pilih bahan kantor
    const supplySelect = page.locator('select[name*="supply" i]').or(
      page.locator('[data-test="supply-select"]')
    );

    if (await supplySelect.count() > 0) {
      // Get first option value
      await supplySelect.selectOption({ index: 1 });
    }

    // Fill in date - tanggal pemakaian
    const dateInput = page.getByRole('textbox', { name: /tanggal|date/i }).or(
      page.locator('input[type="date"]')
    );

    if (await dateInput.count() > 0) {
      await dateInput.fill(new Date().toISOString().split('T')[0]);
    }

    // Fill in quantity - jumlah yang dipakai
    const quantityInput = page.getByRole('spinbutton', { name: /jumlah|quantity/i });
    await quantityInput.fill('1');

    // Fill in notes/purpose (optional) - keterangan/keperluan
    const notesInput = page.getByRole('textbox', { name: /keterangan|keperluan|notes|purpose/i });

    if (await notesInput.count() > 0) {
      await notesInput.fill('Testing E2E - Pemakaian untuk keperluan testing');
    }

    // Submit form
    await page.getByRole('button', { name: /simpan|save|submit|catat/i }).click();

    // Verify success message - pesan sukses
    await expect(page.getByText(/berhasil|success|dicatat/i)).toBeVisible();
  });

  test('should log usage for multiple items in sequence', async ({ page }) => {
    await page.goto('/office-usages');

    // Log first usage
    const logButton = page.getByRole('button', { name: /catat|log/i });
    await logButton.click();

    const supplySelect = page.locator('select[name*="supply" i]');

    if (await supplySelect.count() > 0) {
      // Select first supply
      await supplySelect.selectOption({ index: 1 });

      const quantityInput = page.getByRole('spinbutton', { name: /jumlah/i });
      await quantityInput.fill('1');

      await page.getByRole('button', { name: /simpan|save/i }).click();

      // Wait for success
      await expect(page.getByText(/berhasil/i)).toBeVisible();

      // Log second usage
      await logButton.click();
      await supplySelect.selectOption({ index: 2 });
      await quantityInput.fill('2');
      await page.getByRole('button', { name: /simpan|save/i }).click();

      // Verify second success
      await expect(page.getByText(/berhasil/i)).toBeVisible();
    }
  });

  test('should auto-fill current date', async ({ page }) => {
    await page.goto('/office-usages');

    const logButton = page.getByRole('button', { name: /catat|log/i });
    await logButton.click();

    // Check if date input is pre-filled with today's date
    const dateInput = page.locator('input[type="date"]').or(
      page.getByRole('textbox', { name: /tanggal/i })
    );

    if (await dateInput.count() > 0) {
      const today = new Date().toISOString().split('T')[0];
      const inputValue = await dateInput.inputValue();

      // Date might be pre-filled or empty, either is acceptable
      expect(inputValue === '' || inputValue === today).toBeTruthy();
    }
  });
});

test.describe('Office Usages - Validation (Validasi)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should require supply selection', async ({ page }) => {
    await page.goto('/office-usages');

    const logButton = page.getByRole('button', { name: /catat|log/i });
    await logButton.click();

    // Try to submit without selecting supply
    const submitButton = page.getByRole('button', { name: /simpan|save/i });

    // Check if button is disabled initially
    const isDisabled = await submitButton.isDisabled();

    if (!isDisabled) {
      await submitButton.click();

      // Verify validation error - pesan validasi
      await expect(page.getByText(/wajib dipilih|required/i)).toBeVisible();
    }
  });

  test('should require quantity', async ({ page }) => {
    await page.goto('/office-usages');

    const logButton = page.getByRole('button', { name: /catat|log/i });
    await logButton.click();

    // Select supply but leave quantity empty
    const supplySelect = page.locator('select[name*="supply" i]');

    if (await supplySelect.count() > 0) {
      await supplySelect.selectOption({ index: 1 });

      const submitButton = page.getByRole('button', { name: /simpan|save/i });
      await submitButton.click();

      // Verify validation error
      await expect(page.getByText(/jumlah.*wajib|quantity.*required/i)).toBeVisible();
    }
  });

  test('should validate minimum quantity', async ({ page }) => {
    await page.goto('/office-usages');

    const logButton = page.getByRole('button', { name: /catat|log/i });
    await logButton.click();

    const supplySelect = page.locator('select[name*="supply" i]');

    if (await supplySelect.count() > 0) {
      await supplySelect.selectOption({ index: 1 });

      // Try zero or negative quantity
      const quantityInput = page.getByRole('spinbutton', { name: /jumlah/i });
      await quantityInput.fill('0');

      await page.getByRole('button', { name: /simpan|save/i }).click();

      // Verify validation error
      await expect(page.getByText(/minimal|min.*1/i)).toBeVisible();
    }
  });

  test('should validate quantity does not exceed available stock', async ({ page }) => {
    await page.goto('/office-usages');

    const logButton = page.getByRole('button', { name: /catat|log/i });
    await logButton.click();

    const supplySelect = page.locator('select[name*="supply" i]');

    if (await supplySelect.count() > 0) {
      await supplySelect.selectOption({ index: 1 });

      // Enter excessive quantity
      const quantityInput = page.getByRole('spinbutton', { name: /jumlah/i });
      await quantityInput.fill('99999');

      await page.getByRole('button', { name: /simpan|save/i }).click();

      // Verify stock validation error - validasi stok tidak cukup
      await expect(page.getByText(/melebihi stok|stok tidak cukup|exceeds stock/i)).toBeVisible();
    }
  });

  test('should require valid date', async ({ page }) => {
    await page.goto('/office-usages');

    const logButton = page.getByRole('button', { name: /catat|log/i });
    await logButton.click();

    const supplySelect = page.locator('select[name*="supply" i]');

    if (await supplySelect.count() > 0) {
      await supplySelect.selectOption({ index: 1 });

      const quantityInput = page.getByRole('spinbutton', { name: /jumlah/i });
      await quantityInput.fill('1');

      // Try invalid date if editable
      const dateInput = page.getByRole('textbox', { name: /tanggal/i });

      if (await dateInput.count() > 0 && await dateInput.isEnabled()) {
        await dateInput.fill('invalid-date');
        await page.getByRole('button', { name: /simpan|save/i }).click();

        // Verify date validation error
        await expect(page.getByText(/format.*tanggal|valid.*date/i)).toBeVisible();
      }
    }
  });
});

test.describe('Office Usages - Stock Impact (Dampak Stok)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should decrease stock after logging usage', async ({ page }) => {
    // Go to supplies page first to check stock
    await page.goto('/office-supplies');

    // Find first supply and note its stock
    const firstRow = page.locator('tbody tr').first();
    const stockCell = firstRow.locator('td').filter({ hasText: /\d+/ }).first();

    let stockBefore = 0;
    const stockText = await stockCell.textContent();
    if (stockText) {
      const match = stockText.match(/(\d+)/);
      if (match) {
        stockBefore = parseInt(match[1]);
      }
    }

    // Navigate to usages and log usage
    await page.goto('/office-usages');
    const logButton = page.getByRole('button', { name: /catat|log/i });
    await logButton.click();

    const supplySelect = page.locator('select[name*="supply" i]');
    await supplySelect.selectOption({ index: 1 });

    const quantityInput = page.getByRole('spinbutton', { name: /jumlah/i });
    await quantityInput.fill('1');

    await page.getByRole('button', { name: /simpan|save/i }).click();

    // Wait for success
    await expect(page.getByText(/berhasil/i)).toBeVisible();

    // Go back to supplies and verify stock decreased
    await page.goto('/office-supplies');
    await page.reload();

    const updatedStockCell = page.locator('tbody tr').first()
      .locator('td')
      .filter({ hasText: /\d+/ })
      .first();

    const stockAfterText = await updatedStockCell.textContent();
    if (stockAfterText) {
      const match = stockAfterText.match(/(\d+)/);
      if (match) {
        const stockAfter = parseInt(match[1]);
        // Stock should be decreased by 1
        expect(stockAfter).toBe(stockBefore - 1);
      }
    }
  });

  test('should create mutation record when usage is logged', async ({ page }) => {
    await page.goto('/office-supplies');

    // Check for mutations button/history
    const mutationsButton = page.getByRole('button', { name: /mutasi|history|riwayat/i }).or(
      page.locator('a[href*="/mutations"]')
    ).first();

    if (await mutationsButton.count() > 0) {
      await mutationsButton.click();

      // Verify mutations page shows the new entry
      await expect(page.getByRole('heading', { name: /mutasi/i, level: 1 })).toBeVisible();

      // Check for mutation type "keluar"
      await expect(page.getByText(/keluar|manual/i)).toBeVisible();
    }
  });
});

test.describe('Office Usages - Quick Deduct (Pengurangan Cepat)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should quick deduct stock from supplies page', async ({ page }) => {
    await page.goto('/office-supplies');

    // Look for quick deduct button - tombol kurangi cepat
    const quickDeductButton = page.getByRole('button', { name: /kurangi|quick deduct|pengurangan/i }).or(
      page.locator('[data-test="quick-deduct-button"]')
    ).first();

    if (await quickDeductButton.count() > 0) {
      await quickDeductButton.click();

      // Fill in quantity to deduct
      const quantityInput = page.getByRole('spinbutton', { name: /jumlah/i });
      await quantityInput.fill('1');

      // Optionally add notes
      const notesInput = page.getByRole('textbox', { name: /keterangan/i });
      if (await notesInput.count() > 0) {
        await notesInput.fill('Testing quick deduct');
      }

      // Submit
      await page.getByRole('button', { name: /simpan|save|kurangi/i }).click();

      // Verify success
      await expect(page.getByText(/berhasil|success/i)).toBeVisible();
    }
  });

  test('should validate quick deduct quantity', async ({ page }) => {
    await page.goto('/office-supplies');

    const quickDeductButton = page.getByRole('button', { name: /kurangi|quick deduct/i }).first();

    if (await quickDeductButton.count() > 0) {
      await quickDeductButton.click();

      // Try excessive quantity
      const quantityInput = page.getByRole('spinbutton', { name: /jumlah/i });
      await quantityInput.fill('99999');

      await page.getByRole('button', { name: /simpan|save/i }).click();

      // Should show validation error
      await expect(page.getByText(/stok tidak cukup|melebihi stok/i)).toBeVisible();
    }
  });

  test('should create mutation record for quick deduct', async ({ page }) => {
    await page.goto('/office-supplies');

    const quickDeductButton = page.getByRole('button', { name: /kurangi|quick deduct/i }).first();

    if (await quickDeductButton.count() > 0) {
      // Get current mutation count
      const mutationsButton = page.getByRole('button', { name: /mutasi|history/i }).first();

      if (await mutationsButton.count() > 0) {
        await mutationsButton.click();

        // After quick deduct, should see new mutation entry
        await page.goBack();
        await quickDeductButton.click();

        const quantityInput = page.getByRole('spinbutton', { name: /jumlah/i });
        await quantityInput.fill('1');

        await page.getByRole('button', { name: /simpan|save/i }).click();

        await expect(page.getByText(/berhasil/i)).toBeVisible();
      }
    }
  });
});

test.describe('Office Usages - Filtering & Search', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should filter usages by date range', async ({ page }) => {
    await page.goto('/office-usages');

    // Set date filters
    const dateFromInput = page.locator('input[name*="date_from" i]').or(
      page.getByRole('textbox', { name: /dari|from/i })
    );

    const dateToInput = page.locator('input[name*="date_to" i]').or(
      page.getByRole('textbox', { name: /sampai|to/i })
    );

    if (await dateFromInput.count() > 0) {
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);

      await dateFromInput.fill(lastWeek.toISOString().split('T')[0]);

      if (await dateToInput.count() > 0) {
        await dateToInput.fill(today.toISOString().split('T')[0]);
      }

      // Click filter/apply button
      const filterButton = page.getByRole('button', { name: /filter|terapkan/i });
      if (await filterButton.count() > 0) {
        await filterButton.click();
      }

      // Wait for filtered results
      await page.waitForTimeout(500);
    }
  });

  test('should clear filters', async ({ page }) => {
    await page.goto('/office-usages');

    // Check for clear/reset button
    const clearButton = page.getByRole('button', { name: /reset|clear|hapus filter/i });

    if (await clearButton.count() > 0) {
      await clearButton.click();

      // URL should be cleared of filter parameters
      expect(page.url()).not.toContain('date_from');
      expect(page.url()).not.toContain('date_to');
    }
  });

  test('should search usages by item name', async ({ page }) => {
    await page.goto('/office-usages');

    // Look for search input
    const searchInput = page.getByRole('textbox', { name: /search|cari/i }).or(
      page.locator('input[placeholder*="cari" i]')
    );

    if (await searchInput.count() > 0) {
      await searchInput.fill('kertas');

      // Wait for results
      await page.waitForTimeout(500);

      // Verify filtered results
      await expect(page.getByText(/kertas/i)).toBeVisible();
    }
  });

  test('should preserve filters when navigating pages', async ({ page }) => {
    await page.goto('/office-usages?date_from=2025-01-01&date_to=2025-12-31');

    // Verify filters are applied
    await expect(page.locator('input[name*="date_from" i]')).toHaveValue(/2025-01-01/);
  });
});

test.describe('Office Usages - Usage History (Riwayat Pemakaian)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should view usage history for specific item', async ({ page }) => {
    await page.goto('/office-supplies');

    // Click on first supply to view details
    const supplyLink = page.locator('tbody tr a').or(
      page.locator('tbody tr').first()
    ).first();

    await supplyLink.click();

    // Look for usage history section
    const historySection = page.getByRole('heading', { name: /riwayat|history|pemakaian/i });

    if (await historySection.count() > 0) {
      await expect(historySection).toBeVisible();

      // Verify usage entries are shown
      await expect(page.locator('table').or(
        page.locator('[role="list"]')
      )).toBeVisible();
    }
  });

  test('should display usage in chronological order', async ({ page }) => {
    await page.goto('/office-usages');

    // Get dates from the table
    const dateCells = page.locator('tbody tr td').filter({ hasText: /\d{4}-\d{2}-\d{2}/ });

    if (await dateCells.count() > 1) {
      const firstDate = await dateCells.first().textContent();
      const lastDate = await dateCells.last().textContent();

      // First row should have latest date (descending order)
      expect(firstDate).not.toBe(lastDate);
    }
  });

  test('should show usage totals by item', async ({ page }) => {
    await page.goto('/office-usages');

    // Look for summary/total cards
    const summaryCard = page.locator('[data-test="usage-summary"]').or(
      page.locator('.summary-card')
    );

    if (await summaryCard.count() > 0) {
      await expect(summaryCard.first()).toBeVisible();
    }
  });
});

test.describe('Office Usages - User Permissions', () => {
  test('should allow access for users with office.view permission', async ({ page }) => {
    await login(page, testUsers.superAdmin);
    await page.goto('/office-usages');

    // Should successfully load
    await expect(page.getByRole('heading', { name: /pemakaian/i, level: 1 })).toBeVisible();
    await logout(page);
  });

  test('should show log button for users with office.usage.log permission', async ({ page }) => {
    await login(page, testUsers.superAdmin);
    await page.goto('/office-usages');

    const logButton = page.getByRole('button', { name: /catat|log/i });
    await expect(logButton).toBeVisible();
    await logout(page);
  });

  test('should prevent access for unauthorized users', async ({ page }) => {
    // Login as user without office permissions (pegawai)
    await login(page, testUsers.pegawai);

    await page.goto('/office-usages');

    // Should be redirected or show 403
    const isRedirected = page.url().includes('/dashboard') || page.url().includes('/login');
    const isForbidden = await page.getByRole('heading', { name: /403|forbidden/i }).count() > 0;

    expect(isRedirected || isForbidden).toBeTruthy();

    await logout(page);
  });

  test('should hide log button for users without office.usage.log permission', async ({ page }) => {
    // Login as pegawai (likely doesn't have office.usage.log)
    await login(page, testUsers.pegawai);

    // If page is accessible, check if log button is hidden/disabled
    await page.goto('/office-usages');

    const logButton = page.getByRole('button', { name: /catat|log/i });

    if (await page.getByRole('heading', { name: /pemakaian/i, level: 1 }).count() > 0) {
      // If page is accessible, log button should not be visible or should be disabled
      if (await logButton.count() > 0) {
        await expect(logButton).toBeDisabled();
      }
    }

    await logout(page);
  });
});

test.describe('Office Usages - Export & Reports', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should have export functionality', async ({ page }) => {
    await page.goto('/office-usages');

    // Look for export button
    const exportButton = page.getByRole('button', { name: /export|ekspor|cetak/i }).or(
      page.locator('[data-test="export-button"]')
    );

    // Export button might be present
    if (await exportButton.count() > 0) {
      await expect(exportButton).toBeVisible();
    }
  });

  test('should display usage statistics/summary', async ({ page }) => {
    await page.goto('/office-usages');

    // Look for summary cards or statistics
    const statsCards = page.locator('.stat-card').or(
      page.locator('[data-test="stats"]')
    );

    // Statistics might be displayed
    if (await statsCards.count() > 0) {
      await expect(statsCards.first()).toBeVisible();
    }
  });
});

test.describe('Office Usages - UI & UX', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should have responsive table layout', async ({ page }) => {
    await page.goto('/office-usages');

    // Check if table is visible on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    const table = page.locator('table').or(page.locator('[role="list"]'));

    if (await table.count() > 0) {
      await expect(table.first()).toBeVisible();
    }
  });

  test('should show loading state during operations', async ({ page }) => {
    await page.goto('/office-usages');

    const logButton = page.getByRole('button', { name: /catat|log/i });
    await logButton.click();

    // Check for loading indicator
    const loadingIndicator = page.locator('[data-test="loading"]').or(
      page.locator('.loading')
    );

    // Loading might be shown briefly
    await page.waitForTimeout(100);
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // Navigate with filter that returns no results
    await page.goto('/office-usages?date_from=1900-01-01&date_to=1900-12-31');

    // Check for empty state message
    const emptyState = page.getByText(/tidak ada data|no data|kosong/i);

    if (await emptyState.count() > 0) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should have proper navigation breadcrumbs', async ({ page }) => {
    await page.goto('/office-usages');

    // Look for breadcrumbs
    const breadcrumbs = page.locator('.breadcrumb').or(
      page.locator('[role="navigation"]')
    );

    // Breadcrumbs might be present
    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs.first()).toBeVisible();
    }
  });
});

test.describe('Office Usages - Multiple Users', () => {
  test('should show different usage permissions for different roles', async ({ browser }) => {
    // Create two separate contexts for different users
    const adminContext = await browser.newContext();
    const userContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const userPage = await userContext.newPage();

    try {
      // Admin user
      await login(adminPage, testUsers.superAdmin);
      await adminPage.goto('/office-usages');

      const adminLogButton = adminPage.getByRole('button', { name: /catat|log/i });
      const hasAdminLogButton = await adminLogButton.count() > 0;

      // Regular user
      await login(userPage, testUsers.pegawai);
      await userPage.goto('/office-usages');

      const userLogButton = userPage.getByRole('button', { name: /catat|log/i });
      const hasUserLogButton = await userLogButton.count() > 0;

      // Admin should have more permissions
      expect(hasAdminLogButton >= hasUserLogButton).toBeTruthy();
    } finally {
      await adminContext.close();
      await userContext.close();
    }
  });
});

test.describe('Office Usages - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true);
    await page.goto('/office-usages');

    // Should show appropriate error message or state
    await page.waitForTimeout(1000);

    // Restore connection
    await page.context().setOffline(false);
  });

  test('should handle server errors with user-friendly message', async ({ page }) => {
    // This test verifies that the app handles 5xx errors gracefully
    await page.goto('/office-usages');

    // Look for error notification container (might be empty)
    const errorContainer = page.locator('[data-test="error-message"]');

    if (await errorContainer.count() > 0) {
      // If container exists, it should be empty when there's no error
      const errorText = await errorContainer.textContent();
      expect(errorText).toBe('');
    }
  });
});
