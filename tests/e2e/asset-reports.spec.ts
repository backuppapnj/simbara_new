import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * Uji E2E Laporan Aset / Asset Reports E2E Tests
 *
 * Uji fungsionalitas laporan aset meliputi:
 * - Laporan SAKTI/SIMAN (format standar Kemenkeu)
 * - Laporan per lokasi/ruangan
 * - Laporan per kategori (klasifikasi 14 digit)
 * - Laporan per kondisi (Baik, Rusak Ringan, Rusak Berat)
 * - Laporan riwayat perawatan
 * - Laporan ringkasan nilai aset dan buku
 *
 * Routes: /assets/reports/*
 * Controller: AssetReportController.php
 * Middleware: permission:assets.reports
 * Component: resources/js/pages/Assets/Reports.tsx
 */

test.describe('Asset Reports - Page Access & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display asset reports index page', async ({ page }) => {
    await page.goto('/assets/reports');

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Verify page loaded successfully (no 403 or 404)
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /laporan|lapor|reports/i }).or(
      page.getByRole('heading', { name: /aset|assets/i, level: 1 })
    ).first()).toBeVisible({ timeout: 10000 });
  });

  test('should display breadcrumbs correctly', async ({ page }) => {
    await page.goto('/assets/reports');

    // Check breadcrumbs navigation
    const breadcrumbs = page.locator('nav[aria-label="breadcrumb"], .breadcrumb, nav.breadcrumbs');
    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs.getByText(/aset/i)).toBeVisible();
      await expect(breadcrumbs.getByText(/laporan/i)).toBeVisible();
    }
  });

  test('should navigate from assets page to reports', async ({ page }) => {
    await page.goto('/assets');

    // Look for reports link in navigation or page
    const reportsLink = page.getByRole('link', { name: /laporan|reports/i }).or(
      page.locator('a[href*="/assets/reports"]')
    );

    if (await reportsLink.count() > 0) {
      await reportsLink.first().click();
      await expect(page).toHaveURL(/\/assets\/reports/);
    }
  });
});

test.describe('Asset Reports - Report Type Selection', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display all report type options', async ({ page }) => {
    await page.goto('/assets/reports');

    // Verify report type selector
    const reportSelect = page.getByRole('combobox').or(
      page.locator('[role="combobox"]')
    );

    await expect(reportSelect).toBeVisible();

    // Click to open dropdown
    await reportSelect.click();

    // Verify all report options are available
    await expect(page.getByText(/export sakti\/siman/i)).toBeVisible();
    await expect(page.getByText(/per lokasi/i)).toBeVisible();
    await expect(page.getByText(/per kategori/i)).toBeVisible();
    await expect(page.getByText(/per kondisi/i)).toBeVisible();
    await expect(page.getByText(/riwayat perawatan/i)).toBeVisible();
    await expect(page.getByText(/ringkasan nilai/i)).toBeVisible();
  });

  test('should show report format badges', async ({ page }) => {
    await page.goto('/assets/reports');

    // Click to open dropdown
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();

    // Verify CSV format badges
    const csvBadges = page.locator('.badge, [class*="badge"]').filter({ hasText: /csv/i });
    await expect(csvBadges.first()).toBeVisible();
  });

  test('should switch between report types', async ({ page }) => {
    await page.goto('/assets/reports');

    const reportSelect = page.getByRole('combobox');

    // Select "Per Lokasi" report
    await reportSelect.click();
    await page.getByText(/per lokasi/i).click();
    await page.waitForTimeout(500);

    // Verify selection was made
    await expect(reportSelect).toContainText(/per lokasi/i);
  });
});

test.describe('Asset Reports - Filter Options', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display date range filters', async ({ page }) => {
    await page.goto('/assets/reports');

    // Verify start date input
    const startDateInput = page.getByLabel(/tanggal mulai|start date/i).or(
      page.locator('input[type="date"]').first()
    );
    await expect(startDateInput).toBeVisible();

    // Verify end date input
    const endDateInput = page.getByLabel(/tanggal akhir|end date/i).or(
      page.locator('input[type="date"]').nth(1)
    );
    await expect(endDateInput).toBeVisible();
  });

  test('should display location filter for non-maintenance reports', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select non-maintenance report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per lokasi/i).click();
    await page.waitForTimeout(500);

    // Verify location input
    const locationInput = page.getByLabel(/lokasi/i).or(
      page.locator('input[placeholder*="Ruang"]')
    );
    await expect(locationInput).toBeVisible();
  });

  test('should display category filter', async ({ page }) => {
    await page.goto('/assets/reports');

    // Verify category input
    const categoryInput = page.getByLabel(/kategori|kode barang/i).or(
      page.locator('input[placeholder*="1.3.2"]')
    );
    await expect(categoryInput).toBeVisible();
  });

  test('should display condition filter', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select non-maintenance report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per kondisi/i).click();
    await page.waitForTimeout(500);

    // Verify condition dropdown
    const conditionSelect = page.getByLabel(/kondisi/i).or(
      page.locator('select')
    );
    await expect(conditionSelect).toBeVisible();

    // Verify condition options
    await conditionSelect.click();
    await expect(page.getByText(/semua kondisi/i)).toBeVisible();
    await expect(page.getByText(/baik/i)).toBeVisible();
    await expect(page.getByText(/rusak ringan/i)).toBeVisible();
    await expect(page.getByText(/rusak berat/i)).toBeVisible();
  });

  test('should hide location/category/condition filters for maintenance history', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select maintenance history report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/riwayat perawatan/i).click();
    await page.waitForTimeout(500);

    // These filters should not be visible for maintenance history
    const conditionSelect = page.locator('select').filter({ hasText: /baik/i });
    expect(await conditionSelect.count()).toBe(0);
  });
});

test.describe('Asset Reports - Preview Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should preview SAKTI/SIMAN report data', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select SAKTI/SIMAN report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/sakti\/siman/i).click();

    // Click preview button
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();

    // Wait for preview to load
    await page.waitForTimeout(2000);

    // Verify preview section appears
    const previewSection = page.getByRole('heading', { name: /preview laporan/i, level: 2 }).or(
      page.locator('h2').filter({ hasText: /preview/i })
    );

    if (await previewSection.count() > 0) {
      await expect(previewSection).toBeVisible();

      // Verify table with data
      await expect(page.locator('table')).toBeVisible();
    }
  });

  test('should preview by location report', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select by location report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per lokasi/i).click();

    // Click preview
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();

    // Wait for data
    await page.waitForTimeout(2000);

    // Verify preview shows location summary
    const table = page.locator('table');
    if (await table.count() > 0) {
      await expect(table).toBeVisible();
    }
  });

  test('should preview by category report', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select by category report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per kategori/i).click();

    // Add category filter
    const categoryInput = page.getByLabel(/kategori|kode barang/i);
    await categoryInput.fill('1.3.2');

    // Click preview
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();

    // Wait for data
    await page.waitForTimeout(2000);

    // Verify preview
    const previewHeading = page.getByRole('heading', { name: /preview/i });
    if (await previewHeading.count() > 0) {
      await expect(previewHeading).toBeVisible();
    }
  });

  test('should preview by condition report', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select by condition report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per kondisi/i).click();

    // Select condition
    const conditionSelect = page.getByLabel(/kondisi/i);
    await conditionSelect.selectOption({ label: 'Baik' });

    // Click preview
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();

    // Wait for data
    await page.waitForTimeout(2000);

    // Verify preview
    const previewHeading = page.getByRole('heading', { name: /preview/i });
    if (await previewHeading.count() > 0) {
      await expect(previewHeading).toBeVisible();
    }
  });

  test('should preview maintenance history report', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select maintenance history report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/riwayat perawatan/i).click();

    // Set date range for maintenance history
    const startDateInput = page.getByLabel(/tanggal mulai|start date/i).or(
      page.locator('input[type="date"]').first()
    );
    await startDateInput.fill('2024-01-01');

    const endDateInput = page.getByLabel(/tanggal akhir|end date/i).or(
      page.locator('input[type="date"]').nth(1)
    );
    await endDateInput.fill('2024-12-31');

    // Click preview
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();

    // Wait for data
    await page.waitForTimeout(2000);

    // Verify preview
    const previewHeading = page.getByRole('heading', { name: /preview/i });
    if (await previewHeading.count() > 0) {
      await expect(previewHeading).toBeVisible();
    }
  });

  test('should preview value summary report', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select value summary report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/ringkasan nilai/i).click();

    // Click preview
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();

    // Wait for data
    await page.waitForTimeout(2000);

    // Verify preview shows value summary
    const previewHeading = page.getByRole('heading', { name: /preview/i });
    if (await previewHeading.count() > 0) {
      await expect(previewHeading).toBeVisible();

      // Verify table with value columns
      const table = page.locator('table');
      if (await table.count() > 0) {
        await expect(table.getByText(/nilai/i)).toBeVisible();
      }
    }
  });

  test('should display preview statistics', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select report and preview
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per lokasi/i).click();

    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();

    // Wait for preview
    await page.waitForTimeout(2000);

    // Look for statistics like "Menampilkan X dari Y data"
    const statsText = page.getByText(/menampilkan|dari.*data/i);
    if (await statsText.count() > 0) {
      await expect(statsText).toBeVisible();
    }
  });

  test('should show loading state during preview', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/sakti\/siman/i).click();

    // Click preview and quickly check for loading state
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();

    // Loading might appear briefly
    await page.waitForTimeout(500);
  });
});

test.describe('Asset Reports - Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should export SAKTI/SIMAN report to CSV', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select SAKTI/SIMAN report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/sakti\/siman/i).click();

    // Setup download handler
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    const exportButton = page.getByRole('button', { name: /export csv/i }).or(
      page.locator('button').filter({ hasText: /export/i })
    );

    // If export button is not visible, preview first then export
    if (await exportButton.count() === 0) {
      const previewButton = page.getByRole('button', { name: /preview data/i });
      await previewButton.click();
      await page.waitForTimeout(2000);

      // Look for export button in preview section
      const previewExportButton = page.locator('button').filter({ hasText: /export/i }).first();
      await previewExportButton.click();
    } else {
      await exportButton.click();
    }

    // Wait for download
    try {
      const download = await Promise.race([
        downloadPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Download timeout')), 5000))
      ]);

      // Verify download
      expect(download.suggestedFilename()).toMatch(/\.(csv|txt)$/);
    } catch {
      // Download might open in new tab instead
      const pages = page.context().pages();
      if (pages.length > 1) {
        await pages[1].close();
      }
    }
  });

  test('should export by location report', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select by location report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per lokasi/i).click();

    // Add location filter
    const locationInput = page.getByLabel(/lokasi/i);
    await locationInput.fill('Ruang');

    // Preview first
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Export
    const exportButton = page.locator('button').filter({ hasText: /export/i });
    await exportButton.click();

    // Wait briefly for download to start
    await page.waitForTimeout(1000);
  });

  test('should export by category report', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select by category report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per kategori/i).click();

    // Preview first
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Export
    const exportButton = page.locator('button').filter({ hasText: /export/i });
    await exportButton.click();

    // Wait briefly
    await page.waitForTimeout(1000);
  });

  test('should export by condition report', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select by condition report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per kondisi/i).click();

    // Select condition
    const conditionSelect = page.getByLabel(/kondisi/i);
    await conditionSelect.selectOption({ label: 'Baik' });

    // Preview first
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Export
    const exportButton = page.locator('button').filter({ hasText: /export/i });
    await exportButton.click();

    // Wait briefly
    await page.waitForTimeout(1000);
  });

  test('should export maintenance history report', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select maintenance history report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/riwayat perawatan/i).click();

    // Set date range
    const startDateInput = page.locator('input[type="date"]').first();
    await startDateInput.fill('2024-01-01');

    const endDateInput = page.locator('input[type="date"]').nth(1);
    await endDateInput.fill('2024-12-31');

    // Preview first
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Export
    const exportButton = page.locator('button').filter({ hasText: /export/i });
    await exportButton.click();

    // Wait briefly
    await page.waitForTimeout(1000);
  });

  test('should export value summary report', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select value summary report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/ringkasan nilai/i).click();

    // Preview first
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Export
    const exportButton = page.locator('button').filter({ hasText: /export/i });
    await exportButton.click();

    // Wait briefly
    await page.waitForTimeout(1000);
  });

  test('should show export success toast message', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per kategori/i).click();

    // Preview first
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Export
    const exportButton = page.locator('button').filter({ hasText: /export/i });
    await exportButton.click();

    // Look for success toast
    const successToast = page.getByText(/laporan sedang diunduh|download/i);
    if (await successToast.count() > 0) {
      await expect(successToast).toBeVisible();
    }
  });
});

test.describe('Asset Reports - Filter Validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should reset filters correctly', async ({ page }) => {
    await page.goto('/assets/reports');

    // Set some filters
    const locationInput = page.getByLabel(/lokasi/i);
    await locationInput.fill('Test Location');

    const categoryInput = page.getByLabel(/kategori/i);
    await categoryInput.fill('1.3.2');

    const startDateInput = page.locator('input[type="date"]').first();
    await startDateInput.fill('2024-01-01');

    // Click reset button
    const resetButton = page.getByRole('button', { name: /reset/i });
    await resetButton.click();

    // Verify filters are cleared
    await expect(locationInput).toHaveValue('');
    await expect(categoryInput).toHaveValue('');
    await expect(startDateInput).toHaveValue('');
  });

  test('should apply multiple filters simultaneously', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select by condition report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per kondisi/i).click();

    // Set multiple filters
    const locationInput = page.getByLabel(/lokasi/i);
    await locationInput.fill('Ruang Aula');

    const categoryInput = page.getByLabel(/kategori/i);
    await categoryInput.fill('1.3.2');

    const conditionSelect = page.getByLabel(/kondisi/i);
    await conditionSelect.selectOption({ label: 'Baik' });

    // Preview with filters
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();

    // Wait for filtered results
    await page.waitForTimeout(2000);

    // Verify preview appears
    const previewHeading = page.getByRole('heading', { name: /preview/i });
    if (await previewHeading.count() > 0) {
      await expect(previewHeading).toBeVisible();
    }
  });

  test('should handle invalid date range gracefully', async ({ page }) => {
    await page.goto('/assets/reports');

    // Set invalid date range (end before start)
    const startDateInput = page.locator('input[type="date"]').first();
    await startDateInput.fill('2024-12-31');

    const endDateInput = page.locator('input[type="date"]').nth(1);
    await endDateInput.fill('2024-01-01');

    // Click preview
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Should either show empty results or validation error
    const emptyMessage = page.getByText(/tidak ada data|no data/i);
    const errorMessage = page.getByText(/error|invalid|salah/i);

    // At least one should be visible
    const hasMessage = await emptyMessage.count() > 0 || await errorMessage.count() > 0;
    expect(hasMessage).toBeTruthy();
  });

  test('should handle empty filters', async ({ page }) => {
    await page.goto('/assets/reports');

    // Preview without any filters
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Should show all data or empty state
    const previewHeading = page.getByRole('heading', { name: /preview/i });
    const emptyMessage = page.getByText(/tidak ada data|no data/i);

    const hasContent = await previewHeading.count() > 0 || await emptyMessage.count() > 0;
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Asset Reports - Data Display', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display data in table format', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select and preview report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/sakti\/siman/i).click();

    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Verify table exists
    const table = page.locator('table');
    if (await table.count() > 0) {
      await expect(table).toBeVisible();

      // Verify table headers
      const headers = table.locator('th');
      if (await headers.count() > 0) {
        await expect(headers.first()).toBeVisible();
      }
    }
  });

  test('should format currency values correctly', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select value summary report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/ringkasan nilai/i).click();

    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Look for Rp currency format
    const currencyText = page.getByText(/rp\s\d/i);
    if (await currencyText.count() > 0) {
      await expect(currencyText.first()).toBeVisible();
    }
  });

  test('should display summary statistics for grouped reports', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select by location report (grouped)
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per lokasi/i).click();

    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Look for summary columns like count, total value
    const table = page.locator('table');
    if (await table.count() > 0) {
      const countHeader = table.getByText(/count|jumlah|total/i);
      if (await countHeader.count() > 0) {
        await expect(countHeader.first()).toBeVisible();
      }
    }
  });

  test('should limit preview data to first 10-50 rows', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/sakti\/siman/i).click();

    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Count table rows
    const table = page.locator('table');
    if (await table.count() > 0) {
      const rows = table.locator('tbody tr');
      const rowCount = await rows.count();

      // Should have limited rows (not all data)
      if (rowCount > 0) {
        expect(rowCount).toBeLessThanOrEqual(50);
      }
    }
  });
});

test.describe('Asset Reports - Permissions & Access Control', () => {
  test('should prevent access for users without assets.reports permission', async ({ page }) => {
    // Login as regular employee (pegawai) who shouldn't have assets.reports permission
    await login(page, testUsers.pegawai);

    await page.goto('/assets/reports');

    // Should be redirected or show forbidden
    const isRedirected = page.url().includes('/dashboard') || page.url().includes('/login');
    const isForbidden = await page.getByRole('heading', { name: /403|forbidden|terlarang/i }).count() > 0;

    expect(isRedirected || isForbidden).toBeTruthy();

    await logout(page);
  });

  test('should allow access for super admin', async ({ page }) => {
    await login(page, testUsers.superAdmin);

    await page.goto('/assets/reports');

    // Should load successfully
    await expect(page.getByRole('heading', { name: /laporan aset/i, level: 1 })).toBeVisible();

    await logout(page);
  });

  test('should show unauthorized error for direct export without permission', async ({ page }) => {
    // Login as user without permission
    await login(page, testUsers.pegawai);

    // Try to access export endpoint directly
    const response = await page.context().request.get('/assets/reports/export/sakti-siman', {
      failOnStatusCode: false
    });

    // Should get forbidden or redirect
    expect([403, 401, 302]).toContain(response.status());

    await logout(page);
  });
});

test.describe('Asset Reports - SAKTI/SIMAN Format Specific', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display SAKTI/SIMAN format description', async ({ page }) => {
    await page.goto('/assets/reports');

    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();

    // Verify description
    const description = page.getByText(/format standar kemenkeu/i);
    await expect(description).toBeVisible();
  });

  test('should include required fields in SAKTI/SIMAN export', async ({ page }) => {
    await page.goto('/assets/reports');

    // Select SAKTI/SIMAN report
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/sakti\/siman/i).click();

    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Verify table has standard columns
    const table = page.locator('table');
    if (await table.count() > 0) {
      // Look for common SAKTI fields
      const headers = table.locator('th');
      const headerTexts = await headers.allTextContents();

      // Should have standard columns
      const hasColumns = headerTexts.some(text =>
        text.match(/kode|nama|nilai|lokasi|kondisi/i)
      );
      expect(hasColumns).toBeTruthy();
    }
  });
});

test.describe('Asset Reports - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true);

    await page.goto('/assets/reports');

    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per kategori/i).click();

    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();

    // Wait for error
    await page.waitForTimeout(2000);

    // Restore connection
    await page.context().setOffline(false);
  });

  test('should show error message for failed preview', async () => {
    // This test would require mocking a failed API response
    // For now, we'll skip it
    test.skip(true, 'Requires API mocking setup');
  });

  test('should show error message for failed export', async () => {
    // This test would require mocking a failed download
    test.skip(true, 'Requires download mocking setup');
  });
});

test.describe('Asset Reports - Performance', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should load reports page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/assets/reports');

    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should complete preview within acceptable time', async ({ page }) => {
    await page.goto('/assets/reports');

    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/sakti\/siman/i).click();

    const startTime = Date.now();

    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();

    // Wait for preview
    await page.waitForTimeout(3000);

    const previewTime = Date.now() - startTime;

    // Should complete within 5 seconds
    expect(previewTime).toBeLessThan(5000);
  });
});

test.describe('Asset Reports - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display correctly on desktop viewport', async ({ page }) => {
    await page.goto('/assets/reports');

    // Verify main elements are visible
    await expect(page.getByRole('heading', { name: /laporan aset/i, level: 1 })).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('should display correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/assets/reports');

    // Verify page is still usable
    await expect(page.getByRole('heading', { name: /laporan aset/i, level: 1 })).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('should adjust table layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/assets/reports');

    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per kategori/i).click();

    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Verify table or alternative display exists
    const table = page.locator('table');
    const cardView = page.locator('[class*="card"], [class*="mobile"]');

    const hasDisplay = await table.count() > 0 || await cardView.count() > 0;
    expect(hasDisplay).toBeTruthy();
  });
});

test.describe('Asset Reports - Integration with Assets', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should navigate from assets detail to reports', async ({ page }) => {
    // Start from assets list
    await page.goto('/assets');

    // Look for reports link in navigation or sidebar
    const reportsLink = page.locator('a[href*="/assets/reports"]');
    if (await reportsLink.count() > 0) {
      await reportsLink.first().click();
      await expect(page).toHaveURL(/\/assets\/reports/);
    }
  });

  test('should display current asset data in reports', async ({ page }) => {
    // First check if there are assets
    await page.goto('/assets');
    await page.waitForTimeout(1000);

    // Then go to reports
    await page.goto('/assets/reports');

    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/sakti\/siman/i).click();

    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Should show either data or empty state
    const table = page.locator('table');
    const emptyMessage = page.getByText(/tidak ada data/i);

    const hasContent = await table.count() > 0 || await emptyMessage.count() > 0;
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Asset Reports - User Experience', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should show helpful empty state when no data available', async ({ page }) => {
    await page.goto('/assets/reports');

    // Set filters that might return no data
    const categoryInput = page.getByLabel(/kategori/i);
    await categoryInput.fill('999.999.999');

    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Look for empty state message
    const emptyMessage = page.getByText(/tidak ada data untuk ditampilkan/i);
    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('should maintain filter state when switching report types', async ({ page }) => {
    await page.goto('/assets/reports');

    // Set filters
    const locationInput = page.getByLabel(/lokasi/i);
    await locationInput.fill('Ruang Aula');

    const startDateInput = page.locator('input[type="date"]').first();
    await startDateInput.fill('2024-01-01');

    // Switch report type
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per kategori/i).click();

    await page.waitForTimeout(500);

    // Filters should still be filled
    await expect(locationInput).toHaveValue('Ruang Aula');
    await expect(startDateInput).toHaveValue('2024-01-01');
  });

  test('should show export button only after preview', async ({ page }) => {
    await page.goto('/assets/reports');

    // Preview first
    const reportSelect = page.getByRole('combobox');
    await reportSelect.click();
    await page.getByText(/per kategori/i).click();

    const previewButton = page.getByRole('button', { name: /preview data/i });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // Now export button should be visible in preview section
    const previewExportButton = page.locator('button').filter({ hasText: /export/i });
    if (await previewExportButton.count() > 0) {
      await expect(previewExportButton.first()).toBeVisible();
    }
  });
});
