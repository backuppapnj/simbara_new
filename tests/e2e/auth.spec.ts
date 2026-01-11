import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

test.describe('Authentication', () => {
  test('should allow user to login with valid credentials', async ({ page }) => {
    await login(page, testUsers.superAdmin);
    await expect(page.getByText('Dashboard', { exact: false }).first()).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('textbox', { name: /email/i }).fill('admin@pa-penajam.go.id');
    await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|log in|login|masuk/i }).click();

    await expect(page.getByText('These credentials do not match our records.', { exact: false })).toBeVisible();
  });

  test('should allow user to logout', async ({ page }) => {
    await login(page, testUsers.superAdmin);
    await logout(page);
  });
});
