import { test, expect } from '@playwright/test';

test.describe('Asset Management', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should display assets list', async ({ page }) => {
    await page.goto('/assets');
    
    // Check if the page title or header exists
    await expect(page.locator('h1:has-text("Aset BMN")')).toBeVisible();

    // Check if the table is visible
    // Based on AssetTable.tsx, it renders a DataTable
    // We can check for table headers like "Kode Barang", "Nama Aset"
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Kode Barang' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Nama Aset' })).toBeVisible();
  });

  test('should filter assets by search query', async ({ page }) => {
    await page.goto('/assets');

    // Find search input
    const searchInput = page.getByPlaceholderText('Cari aset...');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('TestSearch');
    
    // Wait for debounce (500ms)
    await page.waitForTimeout(1000);

    // URL should contain search param
    await expect(page).toHaveURL(/search=TestSearch/);
  });

  test('should view asset details', async ({ page }) => {
    await page.goto('/assets');

    // Wait for table rows
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();

    // Click the "Eye" icon or the row itself to view details
    // The AssetTable has an action column with a Link
    const viewButton = firstRow.getByRole('link').filter({ has: page.locator('svg.lucide-eye') });
    
    if (await viewButton.count() > 0) {
        await viewButton.click();
    } else {
        // Fallback: click the row if onRowClick is implemented or just click the first link in the row
        await firstRow.click();
    }

    // Expect to be on a detail page
    // URL pattern: /assets/{id}
    await expect(page).toHaveURL(/\/assets\/\d+/);
    
    // Check for detail headers or tabs
    await expect(page.getByText('Detail Aset', { exact: false })).toBeVisible();
  });
});
