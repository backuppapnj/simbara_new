import { test, expect } from '@playwright/test';

test.describe('Stock Opname', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('can open approved stock opname and download BA PDF', async ({ page }) => {
    await page.goto('/stock-opnames');
    await expect(page.locator('h1')).toContainText(/Stock Opname/i);

    const soNo = /SO-\d{8}-0001/;
    const row = page.locator('tr', { hasText: soNo });
    await expect(row).toBeVisible();

    await row.locator('a[title="Lihat Detail"]').click();
    await expect(page).toHaveURL(/\/stock-opnames\/[0-9A-HJKMNP-TV-Z]{26}/i);

    await expect(page.locator('body')).toContainText(soNo);
    await expect(page.locator('body')).toContainText(/Approved|Disetujui/i);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Download BA/i }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });
});

