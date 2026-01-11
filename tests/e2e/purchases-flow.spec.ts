import { test, expect } from '@playwright/test';

test.describe('Purchases Workflow', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('draft → receive → complete updates purchase status', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());

    await page.goto('/purchases');
    await expect(page.locator('h1', { hasText: 'Pembelian ATK' })).toBeVisible();

    const purchaseNo = /PB-\d{8}-0001/;
    const row = page.locator('tr', { hasText: purchaseNo });
    await expect(row).toBeVisible();

    await row.locator('a[title="Lihat Detail"]').click();
    await expect(page).toHaveURL(/\/purchases\/[0-9A-HJKMNP-TV-Z]{26}/i);

    await expect(page.locator('body')).toContainText(purchaseNo);
    await expect(page.locator('body')).toContainText(/Draft/i);

    await page.getByRole('button', { name: /Terima Barang/i }).click();
    await expect(page.locator('body')).toContainText(/Diterima/i);

    await page.getByRole('button', { name: /Selesaikan & Update Stok|Selesaikan Pembelian/i }).click();
    await expect(page.locator('body')).toContainText(/Selesai/i);
  });
});

