import { expect, type Page } from '@playwright/test';
import type { TestUser } from './test-users';
import { waitForInertiaPage } from './inertia';

export async function login(page: Page, user: TestUser) {
  // Navigate to login page
  await page.goto('/login');

  // Wait for the page to be fully loaded
  await page.waitForLoadState('domcontentloaded');

  // Wait for Inertia app to be ready (check for the app div)
  await page.waitForSelector('#app[data-page]', { state: 'attached', timeout: 10000 });

  // Wait for React to hydrate and render the form
  // The form is rendered client-side, so we need to wait for it to appear
  await page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 30000 });

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
