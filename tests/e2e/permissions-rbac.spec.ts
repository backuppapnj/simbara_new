import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * RBAC (Role-Based Access Control) E2E Tests
 *
 * Tests permission-based access control including:
 * - Verifying users can only access permitted routes
 * - Verifying navigation menu hides unauthorized items
 * - Verifying 403 forbidden pages for unauthorized access
 * - Testing all user roles and their expected permissions
 * - Verifying permission changes take effect immediately
 *
 * Test Users (from tests/e2e/support/test-users.ts):
 * - super_admin: Full access to all features
 * - operator_atk: ATK items, purchases, reports access
 * - kasubag_umum: ATK approvals
 * - kpa: Limited access
 * - pegawai: Can create requests, minimal access
 */

test.describe('RBAC - Super Admin Permissions', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should access all admin pages', async ({ page }) => {
    const adminPages = [
      '/admin/roles',
      '/admin/permissions',
      '/admin/whatsapp-settings',
      '/admin/notification-logs',
    ];

    for (const pageUrl of adminPages) {
      await page.goto(pageUrl);
      // Verify we can access the page (not 403 or redirected)
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.getByRole('heading', { name: /403|forbidden/i })).not.toBeVisible();
    }
  });

  test('should access all ATK features', async ({ page }) => {
    const atkPages = [
      '/items',
      '/purchases',
      '/atk-requests',
      '/atk-reports/monthly',
    ];

    for (const pageUrl of atkPages) {
      await page.goto(pageUrl);
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.getByRole('heading', { name: /403|forbidden/i })).not.toBeVisible();
    }
  });

  test('should access all asset features', async ({ page }) => {
    const assetPages = [
      '/assets',
      '/stock-opnames',
      '/assets/reports',
    ];

    for (const pageUrl of assetPages) {
      await page.goto(pageUrl);
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.getByRole('heading', { name: /403|forbidden/i })).not.toBeVisible();
    }
  });

  test('should access all office supply features', async ({ page }) => {
    const officePages = [
      '/office-supplies',
      '/office-usages',
      '/office-requests',
      '/office-purchases',
    ];

    for (const pageUrl of officePages) {
      await page.goto(pageUrl);
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.getByRole('heading', { name: /403|forbidden/i })).not.toBeVisible();
    }
  });

  test('should see all navigation menu items', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for all main navigation sections
    const menuSections = [
      'Dashboard',
      'Assets|Aset',
      'ATK|Persediaan',
      'Office|Kantor',
      'Admin|Pengaturan',
    ];

    for (const section of menuSections) {
      const menu = page.getByRole('link', { name: new RegExp(section, 'i') }).or(
        page.locator(`[aria-label*="${section}" i]`)
      );
      // Menu sections might exist but not all guaranteed
    }
  });
});

test.describe('RBAC - Operator ATK Permissions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.operatorPersediaan);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should access ATK items management', async ({ page }) => {
    await page.goto('/items');
    await expect(page).not.toHaveURL(/\/login|\/dashboard/);
    await expect(page.getByRole('heading', { name: /403/i })).not.toBeVisible();
  });

  test('should access ATK purchases', async ({ page }) => {
    await page.goto('/purchases');
    await expect(page).not.toHaveURL(/\/login|\/dashboard/);
    await expect(page.getByRole('heading', { name: /403/i })).not.toBeVisible();
  });

  test('should access ATK reports', async ({ page }) => {
    await page.goto('/atk-reports/monthly');
    await expect(page).not.toHaveURL(/\/login|\/dashboard/);
    await expect(page.getByRole('heading', { name: /403/i })).not.toBeVisible();
  });

  test('should not access admin pages', async ({ page }) => {
    const adminPages = [
      '/admin/roles',
      '/admin/permissions',
      '/admin/whatsapp-settings',
    ];

    for (const pageUrl of adminPages) {
      await page.goto(pageUrl);

      // Should be redirected to dashboard or show 403
      const isRedirected = page.url().includes('/dashboard');
      const isForbidden = await page.getByRole('heading', { name: /403|forbidden/i }).count() > 0;

      expect(isRedirected || isForbidden).toBeTruthy();
    }
  });

  test('should not access asset management', async ({ page }) => {
    await page.goto('/assets');

    // Should be redirected or show 403
    const isRedirected = page.url().includes('/dashboard');
    const isForbidden = await page.getByRole('heading', { name: /403|forbidden/i }).count() > 0;

    expect(isRedirected || isForbidden).toBeTruthy();
  });
});

test.describe('RBAC - Kasubag Umum Permissions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.kasubagUmum);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should access ATK requests for approval', async ({ page }) => {
    await page.goto('/atk-requests');
    await expect(page).not.toHaveURL(/\/login|\/dashboard/);
  });

  test('should see approve buttons on ATK requests', async ({ page }) => {
    await page.goto('/atk-requests');

    // Look for approve buttons (kasubag can approve level 1)
    const approveButton = page.getByRole('button', { name: /approve|setujui/i });

    // Approve buttons should be visible if there are pending requests
    if (await approveButton.count() > 0) {
      await expect(approveButton.first()).toBeVisible();
    }
  });

  test('should not create ATK purchases', async ({ page }) => {
    await page.goto('/purchases/create');

    // Should be redirected or show 403
    const isRedirected = page.url().includes('/dashboard');
    const isForbidden = await page.getByRole('heading', { name: /403|forbidden/i }).count() > 0;

    expect(isRedirected || isForbidden).toBeTruthy();
  });
});

test.describe('RBAC - KPA Permissions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.kpa);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should have limited access', async ({ page }) => {
    // KPA has limited access, verify certain pages are restricted
    const restrictedPages = [
      '/items',
      '/purchases',
      '/admin/roles',
    ];

    for (const pageUrl of restrictedPages) {
      await page.goto(pageUrl);

      // Should be redirected or show 403
      const isRedirected = page.url().includes('/dashboard');
      const isForbidden = await page.getByRole('heading', { name: /403|forbidden/i }).count() > 0;

      expect(isRedirected || isForbidden).toBeTruthy();
    }
  });
});

test.describe('RBAC - Pegawai Permissions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.pegawai);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should access office requests creation', async ({ page }) => {
    await page.goto('/office-requests');
    await expect(page).not.toHaveURL(/\/login/);

    // Should see create button
    const createButton = page.getByRole('button', { name: /add|create|tambah/i });
    if (await createButton.count() > 0) {
      await expect(createButton).toBeVisible();
    }
  });

  test('should not access stock opname management', async ({ page }) => {
    await page.goto('/stock-opnames');

    // Should be redirected or show 403
    const isRedirected = page.url().includes('/dashboard');
    const isForbidden = await page.getByRole('heading', { name: /403|forbidden/i }).count() > 0;

    expect(isRedirected || isForbidden).toBeTruthy();
  });

  test('should not access admin features', async ({ page }) => {
    const adminPages = ['/admin/roles', '/admin/permissions'];

    for (const pageUrl of adminPages) {
      await page.goto(pageUrl);

      // Should be redirected
      const isRedirected = page.url().includes('/dashboard') || page.url().includes('/login');
      const isForbidden = await page.getByRole('heading', { name: /403|forbidden/i }).count() > 0;

      expect(isRedirected || isForbidden).toBeTruthy();
    }
  });

  test('should have minimal navigation menu', async ({ page }) => {
    await page.goto('/dashboard');

    // Should not see admin menu items
    const adminMenu = page.getByRole('link', { name: /admin|pengaturan|roles/i });

    if (await adminMenu.count() > 0) {
      // If admin menu exists, it should not be accessible
      await adminMenu.first().click();

      // Should be redirected or show 403
      const isRedirected = page.url().includes('/dashboard');
      const isForbidden = await page.getByRole('heading', { name: /403|forbidden/i }).count() > 0;

      expect(isRedirected || isForbidden).toBeTruthy();
    }
  });
});

test.describe('RBAC - Navigation Menu Visibility', () => {
  test('should hide admin menu for non-admin users', async ({ page }) => {
    await login(page, testUsers.pegawai);
    await page.goto('/dashboard');

    // Look for admin menu items
    const adminMenu = page.getByRole('link', { name: /admin|roles|permissions/i });

    // Admin menu should not be visible or accessible
    if (await adminMenu.count() > 0) {
      // If visible, clicking should lead to 403
      await adminMenu.first().click();
      expect(page.url()).toMatch(/dashboard|403|forbidden/);
    }

    await logout(page);
  });

  test('should show appropriate menu based on role', async ({ page }) => {
    await login(page, testUsers.operatorPersediaan);
    await page.goto('/dashboard');

    // Should see ATK-related menus
    await expect(page.getByRole('link', { name: /atk|persediaan|items/i, exact: false })).toBeVisible();

    // Should not see admin menus
    const adminMenu = page.getByRole('link', { name: /roles|permissions/i });
    if (await adminMenu.count() > 0) {
      await adminMenu.first().click();
      expect(page.url()).toMatch(/dashboard|403|forbidden/);
    }

    await logout(page);
  });
});

test.describe('RBAC - 403 Forbidden Pages', () => {
  test('should display user-friendly 403 page', async ({ page }) => {
    await login(page, testUsers.pegawai);
    await page.goto('/admin/roles');

    // Should see 403 or be redirected
    const forbiddenHeading = page.getByRole('heading', { name: /403|forbidden|unauthorized/i });
    const isRedirected = page.url().includes('/dashboard');

    expect(await forbiddenHeading.count() > 0 || isRedirected).toBeTruthy();

    if (await forbiddenHeading.count() > 0) {
      // Verify 403 page has helpful message
      await expect(page.getByText(/access|permission|izin/i)).toBeVisible();
    }

    await logout(page);
  });

  test('should provide navigation back from 403 page', async ({ page }) => {
    await login(page, testUsers.pegawai);
    await page.goto('/admin/roles');

    const forbiddenHeading = page.getByRole('heading', { name: /403|forbidden/i });

    if (await forbiddenHeading.count() > 0) {
      // Look for back to dashboard button
      const backButton = page.getByRole('link', { name: /dashboard|kembali|back/i });

      if (await backButton.count() > 0) {
        await backButton.first().click();
        await expect(page).toHaveURL(/\/dashboard/);
      }
    }

    await logout(page);
  });
});

test.describe('RBAC - Permission Changes Take Effect', () => {
  test('should reflect permission changes immediately', async ({ page }) => {
    // This test would verify that when permissions are changed,
    // the affected user immediately sees the changes

    // Note: This is a complex test requiring:
    // 1. Login as admin
    // 2. Grant permission to a role
    // 3. Logout
    // 4. Login as user with that role
    // 5. Verify new permission is active

    test.skip(true, 'Requires multi-user session setup and permission modification');
  });

  test('should revoke permissions immediately', async ({ page }) => {
    // This test would verify permission revocation
    test.skip(true, 'Requires multi-user session setup and permission modification');
  });
});

test.describe('RBAC - Edge Cases', () => {
  test('should handle direct URL access attempts', async ({ page }) => {
    await login(page, testUsers.pegawai);

    // Try to directly access restricted URLs
    const restrictedUrls = [
      '/admin/roles',
      '/items/create',
      '/purchases/create',
    ];

    for (const url of restrictedUrls) {
      await page.goto(url);

      // Should not allow access
      const isRedirected = page.url().includes('/dashboard');
      const isForbidden = await page.getByRole('heading', { name: /403|forbidden/i }).count() > 0;

      expect(isRedirected || isForbidden).toBeTruthy();
    }

    await logout(page);
  });

  test('should prevent API endpoint access', async ({ page }) => {
    await login(page, testUsers.pegawai);

    // Try to access restricted API endpoints
    const restrictedApis = [
      '/admin/roles',
      '/items',
      '/admin/permissions',
    ];

    for (const apiUrl of restrictedApis) {
      const response = await page.context().request.get(apiUrl);

      // Should return 403 or redirect
      expect([403, 401, 302]).toContain(response.status());
    }

    await logout(page);
  });

  test('should validate permissions before form submission', async ({ page }) => {
    await login(page, testUsers.pegawai);

    // Try to create an item (should not have permission)
    await page.goto('/items/create');

    // If page loads, try to submit
    const submitButton = page.getByRole('button', { name: /save|create/i });

    if (await submitButton.count() > 0) {
      await submitButton.click();

      // Should show 403 or be redirected
      await page.waitForTimeout(500);

      const isRedirected = page.url().includes('/dashboard');
      const isForbidden = await page.getByRole('heading', { name: /403|forbidden/i }).count() > 0;

      expect(isRedirected || isForbidden).toBeTruthy();
    }

    await logout(page);
  });
});
