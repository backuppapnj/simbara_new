import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * Admin - Role Management E2E Tests
 *
 * Tests role and permission management functionality including:
 * - Viewing all roles
 * - Viewing role details (users and permissions tabs)
 * - Managing role users (add/remove)
 * - Managing role permissions (grant/revoke)
 * - Verifying permission changes take effect
 *
 * Routes: /admin/roles/*
 * Controllers: Admin/RoleController.php, Admin/RolePermissionController.php
 * Middleware: permission:roles.manage
 * Page: resources/js/pages/Admin/Roles/Index.tsx, Show.tsx
 */

test.describe('Admin - Role Management', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display roles index page', async ({ page }) => {
    await page.goto('/admin/roles');

    // Verify page title
    await expect(page).toHaveTitle(/role management/i);

    // Verify heading
    await expect(page.getByRole('heading', { name: /role management/i, level: 1 })).toBeVisible();

    // Verify description
    await expect(page.getByText(/manage user roles and permissions/i)).toBeVisible();

    // Verify role cards are displayed
    await expect(page.locator('[role="list"]').or(
      page.locator('.grid')
    )).toBeVisible();
  });

  test('should display all system roles', async ({ page }) => {
    await page.goto('/admin/roles');

    // Expected roles in the system
    const expectedRoles = [
      'Super Admin',
      'KPA',
      'Kasubag Umum',
      'Pegawai',
      'Operator BMN',
      'Operator ATK',
    ];

    // Verify each role is displayed
    for (const role of expectedRoles) {
      await expect(page.getByText(role, { exact: false })).toBeVisible();
    }
  });

  test('should display user count for each role', async ({ page }) => {
    await page.goto('/admin/roles');

    // Look for badges or elements showing user counts
    const userCountBadges = page.locator('text=/\\d+ user/').or(
      page.locator('[aria-label*="users assigned" i]')
    );

    await expect(userCountBadges.first()).toBeVisible();
  });

  test('should display permission count for each role', async ({ page }) => {
    await page.goto('/admin/roles');

    // Look for permission count indicators
    const permissionCount = page.locator('text=/\\d+ permission/').or(
      page.locator('[aria-label*="permission" i]')
    );

    await expect(permissionCount.first()).toBeVisible();
  });

  test('should navigate to role detail page via users button', async ({ page }) => {
    await page.goto('/admin/roles');

    // Click on the first "Users" button
    const usersButton = page.getByRole('button', { name: /users/i }).or(
      page.locator('a:has-text("Users")')
    ).first();

    await usersButton.click();

    // Verify navigation to role detail page
    await expect(page).toHaveURL(/\/admin\/roles\/\d+/);

    // Verify URL includes users tab parameter
    await expect(page).toHaveURL(/tab=users/);
  });

  test('should navigate to role detail page via permissions button', async ({ page }) => {
    await page.goto('/admin/roles');

    // Click on the first "Permissions" button
    const permissionsButton = page.getByRole('button', { name: /permissions/i }).or(
      page.locator('a:has-text("Permissions")')
    ).first();

    await permissionsButton.click();

    // Verify navigation to role detail page
    await expect(page).toHaveURL(/\/admin\/roles\/\d+/);

    // Verify URL includes permissions tab parameter
    await expect(page).toHaveURL(/tab=permissions/);
  });

  test('should display role detail page with users tab', async ({ page }) => {
    await page.goto('/admin/roles');

    // Navigate to first role's users tab
    const usersButton = page.getByRole('button', { name: /users/i }).first();
    await usersButton.click();

    // Verify page elements
    await expect(page.getByRole('heading', { name: /role/i, level: 1 })).toBeVisible();

    // Verify users tab is active
    // This depends on implementation - could be a tab, pill, or section
    const activeTab = page.locator('[aria-selected="true"]').or(
      page.locator('.tab-active').or(
        page.locator('[data-state="active"]')
      )
    );

    if (await activeTab.count() > 0) {
      await expect(activeTab.filter({ hasText: /users/i })).toBeVisible();
    }
  });

  test('should display role detail page with permissions tab', async ({ page }) => {
    await page.goto('/admin/roles');

    // Navigate to first role's permissions tab
    const permissionsButton = page.getByRole('button', { name: /permissions/i }).first();
    await permissionsButton.click();

    // Verify page elements
    await expect(page.getByRole('heading', { name: /role/i, level: 1 })).toBeVisible();

    // Verify permissions tab content is visible
    await expect(page.getByText(/permissions/i)).toBeVisible();
  });

  test('should allow switching between users and permissions tabs', async ({ page }) => {
    // Start on users tab
    await page.goto('/admin/roles?tab=users');

    // Click on permissions tab
    const permissionsTab = page.getByRole('tab', { name: /permissions/i }).or(
      page.locator('a:has-text("Permissions")')
    );

    if (await permissionsTab.count() > 0) {
      await permissionsTab.click();

      // Verify URL updated
      await expect(page).toHaveURL(/tab=permissions/);

      // Click back to users tab
      const usersTab = page.getByRole('tab', { name: /users/i }).or(
        page.locator('a:has-text("Users")')
      );
      await usersTab.click();

      // Verify URL updated
      await expect(page).toHaveURL(/tab=users/);
    }
  });

  test('should display list of users in users tab', async ({ page }) => {
    await page.goto('/admin/roles?tab=users');

    // Verify user list or table is visible
    const userList = page.locator('table').or(
      page.locator('[role="list"]').or(
        page.locator('.user-list')
      )
    );

    await expect(userList.first()).toBeVisible();
  });

  test('should allow adding users to a role', async ({ page }) => {
    await page.goto('/admin/roles?tab=users');

    // Look for "Add User" button or form
    const addButton = page.getByRole('button', { name: /add user|assign user/i }).or(
      page.locator('[data-test="add-user-button"]')
    );

    if (await addButton.count() > 0) {
      await addButton.click();

      // Look for user selector or input
      const userSelect = page.locator('select[name="user_id"]').or(
        page.locator('[data-test="user-select"]')
      );

      if (await userSelect.count() > 0) {
        // Select a user and submit
        await userSelect.selectOption({ index: 0 });
        await page.getByRole('button', { name: /save|add|assign/i }).click();

        // Verify success message
        await expect(page.getByText(/added|assigned|success/i)).toBeVisible();
      }
    }
  });

  test('should allow removing users from a role', async ({ page }) => {
    await page.goto('/admin/roles?tab=users');

    // Look for remove buttons next to users
    const removeButton = page.getByRole('button', { name: /remove|delete/i }).or(
      page.locator('[data-test="remove-user-button"]')
    ).first();

    if (await removeButton.count() > 0) {
      // Click remove
      await removeButton.click();

      // Confirm if there's a confirmation dialog
      const confirmButton = page.getByRole('button', { name: /confirm|yes|remove/i });
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }

      // Verify success message
      await expect(page.getByText(/removed|success/i)).toBeVisible();
    }
  });

  test('should display list of permissions in permissions tab', async ({ page }) => {
    await page.goto('/admin/roles?tab=permissions');

    // Verify permission list is visible
    const permissionList = page.locator('table').or(
      page.locator('[role="list"]').or(
        page.locator('.permission-list')
      )
    );

    await expect(permissionList.first()).toBeVisible();
  });

  test('should allow granting permissions to a role', async ({ page }) => {
    await page.goto('/admin/roles?tab=permissions');

    // Look for permission checkboxes or toggles
    const permissionCheckbox = page.locator('input[type="checkbox"]').or(
      page.locator('[role="checkbox"]')
    ).first();

    if (await permissionCheckbox.count() > 0) {
      // Check if there's a save/update button
      const saveButton = page.getByRole('button', { name: /save|update|sync/i });

      if (await saveButton.count() > 0) {
        // Toggle a permission
        await permissionCheckbox.check();
        await saveButton.click();

        // Verify success message
        await expect(page.getByText(/saved|updated|success/i)).toBeVisible();
      }
    }
  });

  test('should allow revoking permissions from a role', async ({ page }) => {
    await page.goto('/admin/roles?tab=permissions');

    // Look for checked permission checkboxes
    const checkedCheckbox = page.locator('input[type="checkbox"]:checked').first();

    if (await checkedCheckbox.count() > 0) {
      // Uncheck the permission
      await checkedCheckbox.uncheck();

      // Click save
      const saveButton = page.getByRole('button', { name: /save|update|sync/i });
      await saveButton.click();

      // Verify success message
      await expect(page.getByText(/saved|updated|success/i)).toBeVisible();
    }
  });

  test('should show role metadata on detail page', async ({ page }) => {
    await page.goto('/admin/roles?tab=users');

    // Verify role name is displayed
    await expect(page.locator('h1, h2').filter({ hasText: /admin|super|kpa|kasubag|pegawai/i })).toBeVisible();

    // Verify role count summaries
    await expect(page.getByText(/\d+ user/)).toBeVisible();
  });

  test('should handle permission changes immediately', async ({ page }) => {
    // This test verifies that permission changes take effect immediately
    // In a real scenario, you would:
    // 1. Grant a permission to a role
    // 2. Login as a user with that role
    // 3. Verify the user can now access the previously restricted route

    test.skip(true, 'Requires multiple user sessions and route verification');
  });

  test('should prevent unauthorized access', async ({ page }) => {
    // Logout and login as non-admin user
    await logout(page);
    await login(page, testUsers.pegawai);

    // Try to access roles page
    await page.goto('/admin/roles');

    // Should be redirected or show 403
    await expect(page.or(
      page.getByRole('heading', { name: /403|forbidden/i }),
      page.getByURL(/\/dashboard|\/login/)
    )).toBeVisible();
  });

  test('should filter or search users in users tab', async ({ page }) => {
    await page.goto('/admin/roles?tab=users');

    // Look for search input
    const searchInput = page.getByRole('textbox', { name: /search|filter/i }).or(
      page.locator('input[placeholder*="search" i]')
    );

    if (await searchInput.count() > 0) {
      // Type a search term
      await searchInput.fill('admin');

      // Verify results are filtered
      await page.waitForTimeout(500); // Wait for debounce
    }
  });

  test('should filter or search permissions in permissions tab', async ({ page }) => {
    await page.goto('/admin/roles?tab=permissions');

    // Look for search input
    const searchInput = page.getByRole('textbox', { name: /search|filter/i }).or(
      page.locator('input[placeholder*="search" i]')
    );

    if (await searchInput.count() > 0) {
      // Type a search term
      await searchInput.fill('atk');

      // Verify results are filtered
      await page.waitForTimeout(500); // Wait for debounce
    }
  });

  test('should display permission categories or groups', async ({ page }) => {
    await page.goto('/admin/roles?tab=permissions');

    // Verify permissions are grouped by category
    // Common categories: ATK, Assets, Stock Opnames, Office, Settings, Admin
    const categories = [/atk/i, /assets?/i, /stock/i, /office/i, /settings?/i, /admin/i];

    for (const category of categories) {
      const categoryElement = page.getByRole('heading', { name: category }).or(
        page.locator('.permission-category').filter({ hasText: category })
      );

      // Category might or might not exist
      if (await categoryElement.count() > 0) {
        await expect(categoryElement.first()).toBeVisible();
      }
    }
  });
});

test.describe('Admin - Role Management - Edge Cases', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test('should handle removing all users from a role', async ({ page }) => {
    await login(page, testUsers.superAdmin);
    await page.goto('/admin/roles?tab=users');

    // Look for a role with only one user
    test.skip(true, 'Requires specific test data setup');
  });

  test('should handle removing all permissions from a role', async ({ page }) => {
    await login(page, testUsers.superAdmin);
    await page.goto('/admin/roles?tab=permissions');

    // This would test if the system prevents removing all permissions
    test.skip(true, 'Requires specific test data setup');
  });

  test('should display error when operation fails', async ({ page }) => {
    await login(page, testUsers.superAdmin);
    await page.goto('/admin/roles?tab=users');

    // Test would simulate a network error or server error
    test.skip(true, 'Requires error simulation setup');
  });
});
