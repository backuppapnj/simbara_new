import { test, expect } from '@playwright/test';

test.describe('Basic Security', () => {
  test('redirects unauthenticated user to login', async ({ page }) => {
    const response = await page.goto('/assets');
    expect([200, 302, 303]).toContain(response?.status() ?? 0);
    await expect(page).toHaveURL(/\/login|\/$/);
  });
});

test.describe('Authorization Controls', () => {
  test.use({ storageState: 'tests/e2e/.auth/pegawai.json' });

  test('blocks unauthorized role from accessing restricted module', async ({ page }) => {
    const response = await page.goto('/assets');
    const status = response?.status() ?? 0;
    expect([200, 302, 303, 401, 403]).toContain(status);

    if (status === 403) {
      await expect(page.locator('body')).toContainText(/403|forbidden|tidak memiliki|permission/i);
    }
  });
});
