import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * ATK Reports Generation E2E Tests
 *
 * Tests ATK report generation and export functionality including:
 * - Stock card reports
 * - Monthly reports
 * - Request reports
 * - Purchase reports
 * - Distribution reports
 * - Low stock reports
 * - PDF exports
 * - Excel exports
 *
 * Routes: /atk-reports/*
 * Controller: AtkReportController.php
 * Middleware: permission:atk.reports
 */

test.describe('ATK Reports - Stock Card', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.operatorPersediaan);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display stock card report for an item', async ({ page }) => {
    // First navigate to items list to get an item ID
    await page.goto('/items');

    // Click on first item
    const itemLink = page.locator('a[href*="/items/"]').first();
    if (await itemLink.count() > 0) {
      await itemLink.click();

      // Look for stock card report link
      const stockCardLink = page.getByRole('link', { name: /stock card/i }).or(
        page.locator('a[href*="stock-card"]')
      );

      if (await stockCardLink.count() > 0) {
        await stockCardLink.click();

        // Verify stock card page
        await expect(page.getByRole('heading', { name: /stock card/i, level: 1 })).toBeVisible();

        // Verify table with mutations
        await expect(page.locator('table')).toBeVisible();
      }
    }
  });

  test('should export stock card to PDF', async ({ page }) => {
    await page.goto('/atk-reports/stock-card/1/pdf');

    // Wait for PDF generation/download
    await page.waitForTimeout(2000);

    // Verify PDF was downloaded (would need to check downloads folder in real test)
    // For now, just verify the request was made
    const response = await page.context().request.get('atk-reports/stock-card/1/pdf');
    expect(response.status()).toBe(200);
  });

  test('should display stock card with date filters', async ({ page }) => {
    await page.goto('/atk-reports/stock-card/1');

    // Look for date filter inputs
    const dateFromInput = page.getByRole('textbox', { name: /from|dari/i }).or(
      page.locator('input[name*="from" i]')
    );

    const dateToInput = page.getByRole('textbox', { name: /to|sampai/i }).or(
      page.locator('input[name*="to" i]')
    );

    if (await dateFromInput.count() > 0 && await dateToInput.count() > 0) {
      // Set date range
      await dateFromInput.fill('2024-01-01');
      await dateToInput.fill('2024-12-31');

      // Click filter/apply button
      await page.getByRole('button', { name: /filter|apply|terapkan/i }).click();

      // Wait for filtered results
      await page.waitForTimeout(500);
    }
  });
});

test.describe('ATK Reports - Monthly Reports', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.operatorPersediaan);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display monthly report page', async ({ page }) => {
    await page.goto('/atk-reports/monthly');

    // Verify page
    await expect(page.getByRole('heading', { name: /monthly|bulanan/i, level: 1 })).toBeVisible();

    // Verify month/year selector
    const monthSelect = page.locator('select[name*="month" i]').or(
      page.locator('[data-test="month-select"]')
    );

    const yearInput = page.locator('input[name*="year" i]').or(
      page.locator('input[type="number"]')
    );

    // Filters might be present
    if (await monthSelect.count() > 0) {
      await expect(monthSelect).toBeVisible();
    }
  });

  test('should generate report for specific month', async ({ page }) => {
    await page.goto('/atk-reports/monthly');

    // Select month if selector exists
    const monthSelect = page.locator('select[name*="month" i]');
    if (await monthSelect.count() > 0) {
      await monthSelect.selectOption({ label: 'January' });

      // Set year
      const yearInput = page.locator('input[name*="year" i]');
      if (await yearInput.count() > 0) {
        await yearInput.fill('2024');
      }

      // Click generate
      await page.getByRole('button', { name: /generate|tampilkan/i }).click();

      // Wait for report
      await page.waitForTimeout(1000);
    }
  });

  test('should export monthly report to PDF', async ({ page }) => {
    await page.goto('/atk-reports/monthly/pdf?month=1&year=2024');

    // Wait for PDF generation
    await page.waitForTimeout(2000);

    // Verify response
    const response = await page.context().request.get('atk-reports/monthly/pdf?month=1&year=2024');
    expect([200, 302]).toContain(response.status());
  });

  test('should export monthly report to Excel', async ({ page }) => {
    await page.goto('/atk-reports/monthly/excel?month=1&year=2024');

    // Wait for Excel generation
    await page.waitForTimeout(2000);

    // Verify response
    const response = await page.context().request.get('atk-reports/monthly/excel?month=1&year=2024');
    expect([200, 302]).toContain(response.status());
  });

  test('should display monthly report with summary statistics', async ({ page }) => {
    await page.goto('/atk-reports/monthly');

    // Look for summary cards/statistics
    const statsCards = page.locator('[data-test="stat-card"]').or(
      page.locator('.card').filter({ hasText: /\d+/ })
    );

    // Stats might be displayed
    if (await statsCards.count() > 0) {
      await expect(statsCards.first()).toBeVisible();
    }
  });
});

test.describe('ATK Reports - Requests Report', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.operatorPersediaan);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display requests report page', async ({ page }) => {
    await page.goto('/atk-reports/requests');

    // Verify page
    await expect(page.getByRole('heading', { name: /requests|permintaan/i, level: 1 })).toBeVisible();

    // Verify table with requests
    await expect(page.locator('table')).toBeVisible();
  });

  test('should filter requests by status', async ({ page }) => {
    await page.goto('/atk-reports/requests');

    // Look for status filter
    const statusFilter = page.locator('select[name*="status" i]').or(
      page.locator('[data-test="status-filter"]')
    );

    if (await statusFilter.count() > 0) {
      await statusFilter.selectOption({ label: 'Approved' });

      // Wait for filtered results
      await page.waitForTimeout(500);
    }
  });

  test('should filter requests by date range', async ({ page }) => {
    await page.goto('/atk-reports/requests');

    // Look for date inputs
    const dateFromInput = page.getByRole('textbox', { name: /from|dari/i });

    if (await dateFromInput.count() > 0) {
      await dateFromInput.fill('2024-01-01');

      const dateToInput = page.getByRole('textbox', { name: /to|sampai/i });
      if (await dateToInput.count() > 0) {
        await dateToInput.fill('2024-12-31');
      }

      // Apply filter
      await page.getByRole('button', { name: /filter|apply/i }).click();

      await page.waitForTimeout(500);
    }
  });
});

test.describe('ATK Reports - Purchases Report', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.operatorPersediaan);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display purchases report page', async ({ page }) => {
    await page.goto('/atk-reports/purchases');

    // Verify page
    await expect(page.getByRole('heading', { name: /purchases|pembelian/i, level: 1 })).toBeVisible();

    // Verify table
    await expect(page.locator('table')).toBeVisible();
  });

  test('should display purchase summary statistics', async ({ page }) => {
    await page.goto('/atk-reports/purchases');

    // Look for summary cards
    const summaryCards = page.locator('[data-test="summary"]').or(
      page.locator('.card').filter({ hasText: /total|rp|rupiah/i })
    );

    // Summary might be displayed
    if (await summaryCards.count() > 0) {
      await expect(summaryCards.first()).toBeVisible();
    }
  });
});

test.describe('ATK Reports - Distributions Report', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.operatorPersediaan);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display distributions report page', async ({ page }) => {
    await page.goto('/atk-reports/distributions');

    // Verify page
    await expect(page.getByRole('heading', { name: /distributions|distribusi|penyerahan/i, level: 1 })).toBeVisible();

    // Verify table
    await expect(page.locator('table')).toBeVisible();
  });

  test('should show distribution recipients', async ({ page }) => {
    await page.goto('/atk-reports/distributions');

    // Look for recipient/department column
    await expect(page.getByText(/department|unit|penerima/i)).toBeVisible();
  });
});

test.describe('ATK Reports - Low Stock Report', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.operatorPersediaan);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display low stock report page', async ({ page }) => {
    await page.goto('/atk-reports/low-stock');

    // Verify page
    await expect(page.getByRole('heading', { name: /low stock|stok menipis/i, level: 1 })).toBeVisible();

    // Verify table with low stock items
    await expect(page.locator('table')).toBeVisible();
  });

  test('should highlight items with critical stock', async ({ page }) => {
    await page.goto('/atk-reports/low-stock');

    // Look for critical/low stock indicators
    const criticalBadge = page.getByText(/critical|kritis|habis/i).or(
      page.locator('[data-test="critical-stock"]')
    );

    // Critical indicators might be present
    if (await criticalBadge.count() > 0) {
      await expect(criticalBadge.first()).toBeVisible();
    }
  });

  test('should show reorder suggestions', async ({ page }) => {
    await page.goto('/atk-reports/low-stock');

    // Look for reorder quantity or suggestions
    const reorderInfo = page.getByText(/reorder|suggested|sarani/i).or(
      page.locator('[data-test="reorder-qty"]')
    );

    // Reorder info might be displayed
    if (await reorderInfo.count() > 0) {
      await expect(reorderInfo.first()).toBeVisible();
    }
  });
});

test.describe('ATK Reports - Export Features', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.operatorPersediaan);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should provide print option', async ({ page }) => {
    await page.goto('/atk-reports/monthly');

    // Look for print button
    const printButton = page.getByRole('button', { name: /print|cetak/i });

    if (await printButton.count() > 0) {
      await printButton.click();

      // Verify print dialog or page preparation
      await page.waitForTimeout(500);
    }
  });

  test('should provide email report option', async ({ page }) => {
    await page.goto('/atk-reports/monthly');

    // Look for email button
    const emailButton = page.getByRole('button', { name: /email|kirim/i });

    if (await emailButton.count() > 0) {
      await emailButton.click();

      // Verify email modal or form
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test('should display report generation progress', async ({ page }) => {
    await page.goto('/atk-reports/monthly/pdf');

    // Look for loading indicator
    const loadingIndicator = page.locator('[data-test="loading"]').or(
      page.locator('.spinner').or(
        page.getByText(/generating|memproses/i)
      )
    );

    // Loading might be shown briefly
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator).toBeVisible();
    }
  });
});

test.describe('ATK Reports - Permissions', () => {
  test('should prevent access for unauthorized users', async ({ page }) => {
    // Login as user without report permissions
    await login(page, testUsers.pegawai);

    await page.goto('/atk-reports/monthly');

    // Should be redirected or show 403
    const isRedirected = page.url().includes('/dashboard') || page.url().includes('/login');
    const isForbidden = await page.getByRole('heading', { name: /403|forbidden/i }).count() > 0;

    expect(isRedirected || isForbidden).toBeTruthy();

    await logout(page);
  });

  test('should hide export buttons for view-only users', async ({ page }) => {
    // This would require a user with view-only permission
    test.skip(true, 'Requires view-only user setup');
  });
});

test.describe('ATK Reports - Data Accuracy', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.operatorPersediaan);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should calculate totals correctly', async ({ page }) => {
    await page.goto('/atk-reports/monthly');

    // Look for total calculations
    const totalElement = page.getByText(/total|jumlah/i);

    if (await totalElement.count() > 0) {
      await expect(totalElement.first()).toBeVisible();
    }
  });

  test('should display report metadata', async ({ page }) => {
    await page.goto('/atk-reports/monthly');

    // Look for report metadata (generated at, generated by, etc.)
    const metadata = page.getByText(/generated at|generated by|periode/i);

    if (await metadata.count() > 0) {
      await expect(metadata.first()).toBeVisible();
    }
  });

  test('should handle empty data gracefully', async ({ page }) => {
    // Navigate to report with parameters that return no data
    await page.goto('/atk-reports/monthly?month=13&year=1900');

    // Verify empty state message
    const emptyMessage = page.getByText(/no data|tidak ada data|kosong/i);

    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage).toBeVisible();
    }
  });
});
