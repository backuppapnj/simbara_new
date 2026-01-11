import { test, expect } from '@playwright/test';

test.describe('Global Navigation', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should navigate to Assets page', async ({ page }) => {
    // Navigate to Assets
    await page.click('a[href="/assets"]');
    await expect(page).toHaveURL(/\/assets/);
    
    // Check for common elements on Assets page
    // Using a broad check for "Daftar Aset" or just "Aset" or "Assets"
    await expect(page.locator('body')).toContainText(/Aset|Assets/i);
  });

  test('should navigate to Items (ATK) page', async ({ page }) => {
    // Navigate to ATK / Items
    // The link might be labeled "ATK" or "Items"
    // Based on app-sidebar.tsx, it's href=items.index() which is likely /items
    await page.click('a[href="/items"]');
    await expect(page).toHaveURL(/\/items/);
    
    await expect(page.locator('body')).toContainText(/ATK|Items|Persediaan/i);
  });

  test('should navigate to Stock Opnames page', async ({ page }) => {
    // Navigate to Stock Opnames
    // Assuming the link exists in sidebar or accessible via URL
    // If it's not in the main sidebar, we might need to visit directly or find the submenu
    // The sidebar file didn't explicitly show 'Stock Opnames', let's check if we can just visit URL
    await page.goto('/stock-opnames');
    await expect(page).toHaveURL(/\/stock-opnames/);
    
    await expect(page.locator('body')).toContainText(/Stock Opname|Opname/i);
  });

  test('should navigate to ATK Requests page', async ({ page }) => {
    await page.goto('/atk-requests');
    await expect(page).toHaveURL(/\/atk-requests/);
    
    await expect(page.locator('body')).toContainText(/Permintaan|Request/i);
  });
});
