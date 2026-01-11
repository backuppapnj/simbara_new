import { test, expect } from '@playwright/test';

test.describe('Basic Performance', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('assets list loads within threshold', async ({ page }) => {
    const startedAt = Date.now();
    await page.goto('/assets', { waitUntil: 'networkidle' });
    const elapsedMs = Date.now() - startedAt;

    await expect(page.locator('h1')).toContainText(/Aset/i);
    expect(elapsedMs).toBeLessThan(6000);
  });

  test('login remains stable under simulated slow network', async ({ browser, browserName }) => {
    test.skip(browserName !== 'chromium', 'CDP network emulation is chromium-only.');

    const context = await browser.newContext();
    const page = await context.newPage();

    const client = await context.newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 250,
      downloadThroughput: 600 * 1024,
      uploadThroughput: 300 * 1024,
    });

    const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:8011';
    await page.goto(`${baseUrl}/login`);
    await expect(page.locator('form')).toBeVisible();

    await context.close();
  });
});
