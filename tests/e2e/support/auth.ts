import { expect, type Page } from '@playwright/test';
import type { TestUser } from './test-users';
import { waitForInertiaPage } from './inertia';

export async function login(page: Page, user: TestUser) {
  await page.goto('/login');

  // Wait for the page to fully load (Inertia app)
  await page.waitForLoadState('domcontentloaded');

  // Wait for email input to be visible and ready
  await page.waitForSelector('input[name="email"]', { state: 'visible' });

  await page.getByRole('textbox', { name: /email/i }).fill(user.email);
  await page.getByRole('textbox', { name: /password/i }).fill(user.password);

  // Click the login button
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for Inertia navigation to complete
  await waitForInertiaPage(page, { url: /\/dashboard/, timeout: 10000 });

  // Verify we're on the dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

export async function logout(page: Page) {
  const menuButton = page.locator('[data-test="sidebar-menu-button"]');
  if (await menuButton.count()) {
    await menuButton.click();
    const logoutButton = page.locator('[data-test="logout-button"]');
    if (await logoutButton.count()) {
      await logoutButton.click();
      // Wait for Inertia navigation after logout
      await page.waitForLoadState('domcontentloaded');
    }
    await expect(page).toHaveURL(/\/login|\/$/, { timeout: 10000 });
    return;
  }

  await page.goto('/logout');
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveURL(/\/login|\/$/, { timeout: 10000 });
}
