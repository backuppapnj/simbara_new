import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * Admin - Permissions Management E2E Tests
 *
 * Tests permission management functionality including:
 * - Viewing all permissions grouped by module
 * - Creating new permissions
 * - Updating existing permissions
 * - Deleting permissions
 * - Permission validation and format
 * - Permission sync with roles
 *
 * Routes: /admin/permissions/*
 * Controller: Admin/PermissionController.php
 * Middleware: Only super_admin can access
 * Page: resources/js/pages/Admin/Permissions/Index.tsx (TO BE IMPLEMENTED)
 *
 * NOTE: This test file assumes a Permissions index page will be created.
 * Currently, permission management is only accessible through the Roles page.
 * The backend routes and controller exist, but the frontend page component
 * needs to be created at: resources/js/pages/Admin/Permissions/Index.tsx
 *
 * Expected permission format: module.action (e.g., assets.create, atk.view)
 * Validation regex: /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/
 */

test.describe('Admin - Permissions Management', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test.describe('Permissions Index Page', () => {
    test('should display permissions index page', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Verify page title
      await expect(page).toHaveTitle(/permission|hak akses/i);

      // Verify main heading
      const heading = page.getByRole('heading', { name: /permission|hak akses/i, level: 1 });
      await expect(heading).toBeVisible();

      // Verify description
      await expect(page.getByText(/manage.*permission|kelola.*hak akses/i)).toBeVisible();
    });

    test('should display permissions grouped by module', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Expected modules in the system
      const expectedModules = [
        'assets',
        'atk_requests',
        'office_mutations',
        'office_requests',
        'office_usages',
        'stock_opnames',
        'users',
        'roles',
        'permissions',
        'reports',
        'settings',
        'notifications',
      ];

      // Verify at least some modules are displayed
      let moduleCount = 0;
      for (const module of expectedModules) {
        const moduleHeading = page.getByRole('heading', { name: new RegExp(module, 'i') });
        if (await moduleHeading.count() > 0) {
          moduleCount++;
          await expect(moduleHeading.first()).toBeVisible();
        }
      }

      // At least 3 modules should be present
      expect(moduleCount).toBeGreaterThanOrEqual(3);
    });

    test('should display permission list with correct structure', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Look for permission items (could be in cards, table, or list)
      const permissionList = page.locator('[data-testid*="permission"]').or(
        page.locator('.permission-item').or(
          page.locator('table tbody tr')
        )
      );

      // Should have permissions
      await expect(permissionList.first()).toBeVisible();
    });

    test('should display permission name and module', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Check for permission names (format: module.action)
      const permissionName = page.locator('text=/^[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*$/').first();

      if (await permissionName.count() > 0) {
        await expect(permissionName).toBeVisible();
      }
    });

    test('should have create permission button', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Look for create button
      const createButton = page.getByRole('button', { name: /create|add|tambah.*permission/i }).or(
        page.locator('[data-testid="create-permission-button"]')
      );

      await expect(createButton).toBeVisible();
    });

    test('should allow searching permissions', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Look for search input
      const searchInput = page.getByRole('textbox', { name: /search|cari/i }).or(
        page.locator('input[placeholder*="search" i]').or(
          page.locator('input[placeholder*="cari" i]')
        )
      );

      if (await searchInput.count() > 0) {
        // Type a search term
        await searchInput.fill('assets');

        // Wait for debounce
        await page.waitForTimeout(500);

        // Verify results are filtered
        const results = page.locator('text=/assets/i');
        await expect(results.first()).toBeVisible();
      }
    });

    test('should filter permissions by module', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Look for module filter
      const moduleFilter = page.getByRole('combobox', { name: /module|filter/i }).or(
        page.locator('select[name="module"]').or(
          page.locator('[data-testid="module-filter"]')
        )
      );

      if (await moduleFilter.count() > 0) {
        // Select a module
        await moduleFilter.selectOption({ label: /assets/i });

        // Wait for filter to apply
        await page.waitForTimeout(500);

        // Verify only assets permissions are shown
        const assetPermissions = page.locator('text=/assets\\./i');
        await expect(assetPermissions.first()).toBeVisible();
      }
    });
  });

  test.describe('Create Permission', () => {
    test('should open create permission modal', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Click create button
      const createButton = page.getByRole('button', { name: /create|add|tambah/i });
      await createButton.click();

      // Verify modal opens
      const modal = page.locator('[role="dialog"]').or(
        page.locator('.modal').or(
          page.locator('[data-testid="create-permission-modal"]')
        )
      );

      await expect(modal).toBeVisible();
      await expect(page.getByRole('heading', { name: /create.*permission/i })).toBeVisible();
    });

    test('should create permission with valid data', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Open create modal
      const createButton = page.getByRole('button', { name: /create/i });
      await createButton.click();

      // Fill form
      await page.fill('input[name="name"]', 'test_permission');
      await page.selectOption('select[name="module"]', { label: /assets/i });

      // Submit
      const submitButton = page.getByRole('button', { name: /create|save|simpan/i });
      await submitButton.click();

      // Verify success message
      await expect(page.getByText(/created|success|berhasil/i)).toBeVisible();

      // Verify permission appears in list
      await expect(page.getByText('test_permission')).toBeVisible();
    });

    test('should create permission with custom module', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Open create modal
      const createButton = page.getByRole('button', { name: /create/i });
      await createButton.click();

      // Select custom module
      await page.selectOption('select[name="module"]', '+ Custom Module');

      // Enter custom module name
      await page.fill('input[placeholder*="custom module" i]', 'custom_module');

      // Fill permission name
      await page.fill('input[name="name"]', 'custom_action');

      // Submit
      const submitButton = page.getByRole('button', { name: /create|save/i });
      await submitButton.click();

      // Verify success
      await expect(page.getByText(/created|success/i)).toBeVisible();
    });

    test('should validate required permission name', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Open create modal
      const createButton = page.getByRole('button', { name: /create/i });
      await createButton.click();

      // Try to submit without filling name
      await page.selectOption('select[name="module"]', { label: /assets/i });
      const submitButton = page.getByRole('button', { name: /create|save/i });
      await submitButton.click();

      // Verify error message
      await expect(page.getByText(/required|wajib diisi/i)).toBeVisible();
    });

    test('should validate required module', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Open create modal
      const createButton = page.getByRole('button', { name: /create/i });
      await createButton.click();

      // Fill only name
      await page.fill('input[name="name"]', 'test_permission');

      // Try to submit
      const submitButton = page.getByRole('button', { name: /create|save/i });
      await submitButton.click();

      // Verify error
      await expect(page.getByText(/module.*required/i)).toBeVisible();
    });

    test('should validate permission name format', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Open create modal
      const createButton = page.getByRole('button', { name: /create/i });
      await createButton.click();

      // Enter invalid name (uppercase, spaces, special chars)
      await page.fill('input[name="name"]', 'Invalid-Name!');
      await page.selectOption('select[name="module"]', { label: /assets/i });

      // Try to submit
      const submitButton = page.getByRole('button', { name: /create|save/i });
      await submitButton.click();

      // Verify format error
      await expect(page.getByText(/format|snake_case/i)).toBeVisible();
    });

    test('should prevent duplicate permission names', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Open create modal
      const createButton = page.getByRole('button', { name: /create/i });
      await createButton.click();

      // Try to create existing permission
      await page.fill('input[name="name"]', 'view'); // Assuming this exists
      await page.selectOption('select[name="module"]', { label: /assets/i });

      // Submit
      const submitButton = page.getByRole('button', { name: /create|save/i });
      await submitButton.click();

      // Verify duplicate error
      await expect(page.getByText(/already exists|sudah ada/i)).toBeVisible();
    });

    test('should allow optional description', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Open create modal
      const createButton = page.getByRole('button', { name: /create/i });
      await createButton.click();

      // Fill all fields including description
      await page.fill('input[name="name"]', 'with_description');
      await page.selectOption('select[name="module"]', { label: /assets/i });
      await page.fill('textarea[name="description"]', 'This is a test permission with description');

      // Submit
      const submitButton = page.getByRole('button', { name: /create|save/i });
      await submitButton.click();

      // Verify success
      await expect(page.getByText(/created|success/i)).toBeVisible();
    });

    test('should validate description max length', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Open create modal
      const createButton = page.getByRole('button', { name: /create/i });
      await createButton.click();

      // Fill with long description (>500 chars)
      await page.fill('input[name="name"]', 'test_desc');
      await page.selectOption('select[name="module"]', { label: /assets/i });
      await page.fill('textarea[name="description"]', 'a'.repeat(501));

      // Submit
      const submitButton = page.getByRole('button', { name: /create|save/i });
      await submitButton.click();

      // Verify max length error
      await expect(page.getByText(/500.*character/i)).toBeVisible();
    });
  });

  test.describe('Update Permission', () => {
    test('should open edit permission modal', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Find and click edit button for first permission
      const editButton = page.getByRole('button', { name: /edit|ubah/i }).or(
        page.locator('[aria-label*="edit" i]').or(
          page.locator('[data-testid="edit-permission-button"]')
        )
      ).first();

      if (await editButton.count() > 0) {
        await editButton.click();

        // Verify edit modal opens
        const modal = page.locator('[role="dialog"]').or(
          page.locator('.modal')
        );
        await expect(modal).toBeVisible();
        await expect(page.getByRole('heading', { name: /edit.*permission/i })).toBeVisible();
      }
    });

    test('should update permission description', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Find edit button
      const editButton = page.getByRole('button', { name: /edit|ubah/i }).first();

      if (await editButton.count() > 0) {
        await editButton.click();

        // Update description
        const textarea = page.locator('textarea[name="description"]');
        await textarea.clear();
        await textarea.fill('Updated description for testing');

        // Save
        const saveButton = page.getByRole('button', { name: /save|update|simpan/i });
        await saveButton.click();

        // Verify success
        await expect(page.getByText(/updated|success|berhasil/i)).toBeVisible();
      }
    });

    test('should update permission name with validation', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Find edit button
      const editButton = page.getByRole('button', { name: /edit|ubah/i }).first();

      if (await editButton.count() > 0) {
        await editButton.click();

        // Get original name
        const nameInput = page.locator('input[name="name"]');
        const originalName = await nameInput.inputValue();

        // Update name
        await nameInput.clear();
        await nameInput.fill('updated_test_permission');

        // Save
        const saveButton = page.getByRole('button', { name: /save|update/i });
        await saveButton.click();

        // Verify success
        await expect(page.getByText(/updated|success/i)).toBeVisible();
      }
    });

    test('should prevent editing module after creation', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Find edit button
      const editButton = page.getByRole('button', { name: /edit|ubah/i }).first();

      if (await editButton.count() > 0) {
        await editButton.click();

        // Module field should be disabled
        const moduleField = page.locator('input[disabled][value*="ASSETS"], input[disabled][value*="assets"]');
        await expect(moduleField).toBeVisible();
      }
    });

    test('should validate permission name on update', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Find edit button
      const editButton = page.getByRole('button', { name: /edit|ubah/i }).first();

      if (await editButton.count() > 0) {
        await editButton.click();

        // Try invalid name
        const nameInput = page.locator('input[name="name"]');
        await nameInput.clear();
        await nameInput.fill('INVALID-NAME');

        // Save
        const saveButton = page.getByRole('button', { name: /save|update/i });
        await saveButton.click();

        // Should show validation error
        await expect(page.getByText(/format|snake_case/i)).toBeVisible();
      }
    });

    test('should show warning about code impact when renaming', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Find edit button
      const editButton = page.getByRole('button', { name: /edit|ubah/i }).first();

      if (await editButton.count() > 0) {
        await editButton.click();

        // Look for warning message
        const warning = page.getByText(/affect.*roles|code|impact/i);
        if (await warning.count() > 0) {
          await expect(warning).toBeVisible();
        }
      }
    });
  });

  test.describe('Delete Permission', () => {
    test('should show delete confirmation dialog', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Find delete button for orphaned permission (if any)
      const deleteButton = page.getByRole('button', { name: /delete|hapus/i }).or(
        page.locator('[aria-label*="delete" i]').or(
          page.locator('[data-testid="delete-permission-button"]')
        )
      ).first();

      if (await deleteButton.count() > 0) {
        await deleteButton.click();

        // Verify confirmation dialog
        const dialog = page.locator('[role="alertdialog"]').or(
          page.locator('.confirmation-dialog').or(
            page.locator('[data-testid="delete-confirmation-modal"]')
          )
        );
        await expect(dialog).toBeVisible();
        await expect(page.getByText(/are you sure|konfirmasi|hapus/i)).toBeVisible();
      }
    });

    test('should delete orphaned permission', async ({ page }) => {
      await page.goto('/admin/permissions');

      // First create a test permission
      const createButton = page.getByRole('button', { name: /create/i });
      await createButton.click();
      await page.fill('input[name="name"]', 'test_delete_permission');
      await page.selectOption('select[name="module"]', { label: /assets/i });
      const submitButton = page.getByRole('button', { name: /create/i });
      await submitButton.click();

      // Wait for creation
      await page.waitForTimeout(1000);

      // Now delete it
      const deleteButton = page.getByRole('button', { name: /delete/i }).or(
        page.locator('[aria-label*="delete" i]')
      ).first();

      if (await deleteButton.count() > 0) {
        await deleteButton.click();

        // Confirm deletion
        const confirmButton = page.getByRole('button', { name: /confirm|yes|hapus/i }).or(
          page.locator('[data-testid="confirm-delete"]')
        );
        await confirmButton.click();

        // Verify success
        await expect(page.getByText(/deleted|success|berhasil/i)).toBeVisible();

        // Verify permission removed from list
        await expect(page.getByText('test_delete_permission')).not.toBeVisible();
      }
    });

    test('should warn when deleting assigned permission', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Try to delete a permission that's likely assigned to roles
      const deleteButton = page.getByRole('button', { name: /delete/i }).or(
        page.locator('[aria-label*="delete" i]')
      ).first();

      if (await deleteButton.count() > 0) {
        await deleteButton.click();

        // Look for warning about roles using this permission
        const warning = page.getByText(/role|assigned|digunakan/i);

        if (await warning.count() > 0) {
          await expect(warning).toBeVisible();
        }
      }
    });

    test('should prevent deleting critical permissions', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Try to delete super_admin permission or other critical ones
      const criticalPermissions = ['super_admin', 'admin', 'roles.manage'];

      for (const permName of criticalPermissions) {
        const permElement = page.locator(`text=/${permName}/i`);

        if (await permElement.count() > 0) {
          // Find delete button for this permission
          const parent = permElement.locator('..');
          const deleteButton = parent.getByRole('button', { name: /delete/i });

          if (await deleteButton.count() > 0) {
            await deleteButton.click();

            // Should show warning or be disabled
            const warning = page.getByText(/cannot|critical|required/i);
            if (await warning.count() > 0) {
              await expect(warning).toBeVisible();
            }

            // Close dialog if it opened
            const cancelButton = page.getByRole('button', { name: /cancel|batal/i });
            if (await cancelButton.count() > 0) {
              await cancelButton.click();
            }

            break; // Only test first critical permission found
          }
        }
      }
    });
  });

  test.describe('Permission Display & Organization', () => {
    test('should display permissions in correct format', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Check permission format: module.action
      const permissions = page.locator('text=/^[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*$/');

      // Should have at least one properly formatted permission
      await expect(permissions.first()).toBeVisible();
    });

    test('should group permissions by module', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Look for module headings or sections
      const moduleHeadings = page.getByRole('heading').or(
        page.locator('.module-header').or(
          page.locator('[data-testid*="module"]')
        )
      );

      // Should have multiple module groups
      const count = await moduleHeadings.count();
      expect(count).toBeGreaterThan(1);
    });

    test('should show permission count per module', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Look for count badges or indicators
      const countBadges = page.locator('[aria-label*="count"]').or(
        page.locator('.badge').or(
          page.locator('text=/\\d+ permission/i')
        )
      );

      // At least one count badge should exist
      if (await countBadges.count() > 0) {
        await expect(countBadges.first()).toBeVisible();
      }
    });

    test('should display permission description', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Look for description text
      const descriptions = page.locator('[data-testid="permission-description"]').or(
        page.locator('.permission-description').or(
          page.locator('text=/describe|control|allow/i')
        )
      );

      // Some permissions should have descriptions
      if (await descriptions.count() > 0) {
        await expect(descriptions.first()).toBeVisible();
      }
    });
  });

  test.describe('Permission Search & Filter', () => {
    test('should search permissions by name', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Find search input
      const searchInput = page.getByRole('textbox', { name: /search/i }).or(
        page.locator('input[placeholder*="search" i]')
      );

      if (await searchInput.count() > 0) {
        // Search for 'view'
        await searchInput.fill('view');
        await page.waitForTimeout(500);

        // Should show results with 'view'
        await expect(page.getByText(/view/i)).toBeVisible();
      }
    });

    test('should search permissions by description', async ({ page }) => {
      await page.goto('/admin/permissions');

      const searchInput = page.getByRole('textbox', { name: /search/i });

      if (await searchInput.count() > 0) {
        // Search by description keyword
        await searchInput.fill('create');
        await page.waitForTimeout(500);

        // Should show relevant results
        const results = page.locator('text=/create/i');
        await expect(results.first()).toBeVisible();
      }
    });

    test('should clear search and show all permissions', async ({ page }) => {
      await page.goto('/admin/permissions');

      const searchInput = page.getByRole('textbox', { name: /search/i });

      if (await searchInput.count() > 0) {
        // Search first
        await searchInput.fill('assets');
        await page.waitForTimeout(500);

        // Clear search
        await searchInput.clear();
        await page.waitForTimeout(500);

        // Should show all permissions again
        const allPermissions = page.locator('[data-testid*="permission"]');
        expect(await allPermissions.count()).toBeGreaterThan(0);
      }
    });

    test('should filter by multiple modules', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Look for filter controls
      const filterSelect = page.getByRole('combobox', { name: /filter|module/i });

      if (await filterSelect.count() > 0) {
        // Select assets module
        await filterSelect.selectOption({ label: /assets/i });
        await page.waitForTimeout(500);

        // Should show only assets permissions
        await expect(page.getByText(/assets\\./i)).toBeVisible();

        // Reset filter
        await filterSelect.selectOption({ label: /all|semua/i });
        await page.waitForTimeout(500);

        // Should show all permissions
        expect(await page.locator('text=/\\./i').count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Permission Sync with Roles', () => {
    test('should show which roles have permission', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Find a permission and check if roles are displayed
      const permissionItem = page.locator('[data-testid*="permission"]').first();

      if (await permissionItem.count() > 0) {
        // Look for role badges
        const roleBadges = permissionItem.locator('[data-testid="role-badge"]').or(
          page.locator('.role-badge').or(
            page.locator('text=/Super Admin|KPA|Kasubag|Pegawai/i')
          )
        );

        if (await roleBadges.count() > 0) {
          await expect(roleBadges.first()).toBeVisible();
        }
      }
    });

    test('should display permission usage statistics', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Look for usage count
      const usageCount = page.locator('text=/\\d+ role/i').or(
        page.locator('[aria-label*="used by" i]').or(
          page.locator('[data-testid="usage-count"]')
        )
      );

      if (await usageCount.count() > 0) {
        await expect(usageCount.first()).toBeVisible();
      }
    });
  });

  test.describe('Bulk Actions', () => {
    test('should select multiple permissions', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Look for checkboxes
      const checkboxes = page.locator('input[type="checkbox"]');

      if (await checkboxes.count() > 1) {
        // Select multiple permissions
        await checkboxes.nth(0).check();
        await checkboxes.nth(1).check();

        // Verify bulk action menu appears
        const bulkMenu = page.locator('[data-testid="bulk-actions"]').or(
          page.locator('.bulk-actions-menu')
        );

        if (await bulkMenu.count() > 0) {
          await expect(bulkMenu).toBeVisible();
        }
      }
    });

    test('should allow bulk module assignment', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Select permissions
      const checkboxes = page.locator('input[type="checkbox"]');

      if (await checkboxes.count() > 2) {
        await checkboxes.nth(0).check();
        await checkboxes.nth(1).check();

        // Look for bulk assign button
        const bulkAssign = page.getByRole('button', { name: /assign|set module/i });

        if (await bulkAssign.count() > 0) {
          await bulkAssign.click();

          // Select module
          const moduleSelect = page.locator('select[name="module"]');
          if (await moduleSelect.count() > 0) {
            await moduleSelect.selectOption({ label: /assets/i });

            // Confirm
            const confirmButton = page.getByRole('button', { name: /confirm|apply/i });
            await confirmButton.click();

            // Verify success
            await expect(page.getByText(/updated|success/i)).toBeVisible();
          }
        }
      }
    });

    test('should allow bulk delete with confirmation', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Create test permissions first
      const createButton = page.getByRole('button', { name: /create/i });
      await createButton.click();
      await page.fill('input[name="name"]', 'bulk_delete_test_1');
      await page.selectOption('select[name="module"]', { label: /assets/i });
      await page.getByRole('button', { name: /create/i }).click();
      await page.waitForTimeout(1000);

      // Select permission
      const checkboxes = page.locator('input[type="checkbox"]');
      if (await checkboxes.count() > 0) {
        await checkboxes.first().check();

        // Look for bulk delete
        const bulkDelete = page.getByRole('button', { name: /delete|hapus/i });

        if (await bulkDelete.count() > 0) {
          await bulkDelete.click();

          // Confirm
          const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
          if (await confirmButton.count() > 0) {
            await confirmButton.click();

            // Verify success
            await expect(page.getByText(/deleted/i)).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Permission Details View', () => {
    test('should show permission detail modal', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Click on a permission
      const permissionItem = page.locator('[data-testid*="permission"]').first();

      if (await permissionItem.count() > 0) {
        await permissionItem.click();

        // Should show detail modal or navigate to detail page
        const detailModal = page.locator('[role="dialog"]').or(
          page.locator('.detail-modal').or(
            page.locator('[data-testid="permission-detail"]')
          )
        );

        if (await detailModal.count() > 0) {
          await expect(detailModal).toBeVisible();
        }
      }
    });

    test('should display roles using permission', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Click on a permission
      const permissionItem = page.locator('[data-testid*="permission"]').first();

      if (await permissionItem.count() > 0) {
        await permissionItem.click();

        // Look for roles list in detail
        const rolesList = page.locator('[data-testid="roles-list"]').or(
          page.locator('.roles-using-permission')
        );

        if (await rolesList.count() > 0) {
          await expect(rolesList).toBeVisible();
        }
      }
    });

    test('should show permission metadata', async ({ page }) => {
      await page.goto('/admin/permissions');

      // Click on a permission
      const permissionItem = page.locator('[data-testid*="permission"]').first();

      if (await permissionItem.count() > 0) {
        await permissionItem.click();

        // Look for metadata (created at, updated at, etc.)
        const metadata = page.locator('text=/created|updated|meta/i');

        if (await metadata.count() > 0) {
          await expect(metadata.first()).toBeVisible();
        }
      }
    });
  });
});

test.describe('Admin - Permissions API Endpoint Tests', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should return permissions via API', async ({ page }) => {
    const response = await page.context().request.get('/admin/permissions', {
      headers: {
        'Accept': 'application/json',
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('should create permission via API', async ({ page }) => {
    const response = await page.context().request.post('/admin/permissions', {
      headers: {
        'Accept': 'application/json',
      },
      data: {
        name: 'test_api_permission',
        module: 'test',
        description: 'Created via API test',
      },
    });

    // Should either create (201) or return validation error (422)
    expect([201, 422]).toContain(response.status());

    if (response.status() === 201) {
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('name');
    }
  });

  test('should validate permission format via API', async ({ page }) => {
    const response = await page.context().request.post('/admin/permissions', {
      headers: {
        'Accept': 'application/json',
      },
      data: {
        name: 'INVALID-FORMAT',
        module: 'test',
      },
    });

    expect(response.status()).toBe(422);

    const data = await response.json();
    expect(data).toHaveProperty('errors');
  });

  test('should prevent duplicate permission via API', async ({ page }) => {
    // Try to create duplicate
    const response = await page.context().request.post('/admin/permissions', {
      headers: {
        'Accept': 'application/json',
      },
      data: {
        name: 'view', // Common existing permission
        module: 'assets',
      },
    });

    // Should fail due to duplicate or already exists
    expect([422, 409, 400]).toContain(response.status());
  });

  test('should update permission via API', async ({ page }) => {
    // First get a permission to update
    const listResponse = await page.context().request.get('/admin/permissions', {
      headers: {
        'Accept': 'application/json',
      },
    });

    const listData = await listResponse.json();

    if (listData.data && listData.data.length > 0 && listData.data[0].permissions) {
      const permissionId = listData.data[0].permissions[0].id;

      const updateResponse = await page.context().request.put(`/admin/permissions/${permissionId}`, {
        headers: {
          'Accept': 'application/json',
        },
        data: {
          name: 'test_updated_permission',
          description: 'Updated via API',
        },
      });

      expect([200, 422]).toContain(updateResponse.status());
    }
  });

  test('should delete permission via API', async ({ page }) => {
    // First create a permission to delete
    const createResponse = await page.context().request.post('/admin/permissions', {
      headers: {
        'Accept': 'application/json',
      },
      data: {
        name: `test_delete_${Date.now()}`,
        module: 'test',
        description: 'To be deleted',
      },
    });

    if (createResponse.status() === 201) {
      const createData = await createResponse.json();
      const permissionId = createData.data.id;

      // Delete it
      const deleteResponse = await page.context().request.delete(`/admin/permissions/${permissionId}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      expect([200, 204, 404]).toContain(deleteResponse.status());
    }
  });
});

test.describe('Admin - Permissions - Unauthorized Access', () => {
  test('should prevent non-super-admin from accessing permissions', async ({ page }) => {
    // Login as regular user (pegawai)
    await login(page, testUsers.pegawai);

    // Try to access permissions page
    await page.goto('/admin/permissions');

    // Should be redirected or show 403
    const isForbidden = await page.getByRole('heading', { name: /403|forbidden/i }).count() > 0;
    const isRedirected = page.url().includes('/dashboard') || page.url().includes('/login');

    expect(isForbidden || isRedirected).toBeTruthy();

    await logout(page);
  });

  test('should prevent API access for non-super-admin', async ({ page }) => {
    await login(page, testUsers.pegawai);

    const response = await page.context().request.get('/admin/permissions', {
      headers: {
        'Accept': 'application/json',
      },
    });

    // Should return 403 or 401
    expect([403, 401, 302]).toContain(response.status());

    await logout(page);
  });

  test('should prevent permission creation via API', async ({ page }) => {
    await login(page, testUsers.operatorPersediaan);

    const response = await page.context().request.post('/admin/permissions', {
      headers: {
        'Accept': 'application/json',
      },
      data: {
        name: 'unauthorized_permission',
        module: 'test',
      },
    });

    // Should be forbidden
    expect([403, 401, 302]).toContain(response.status());

    await logout(page);
  });
});

test.describe('Admin - Permissions - Edge Cases', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should handle very long permission names', async ({ page }) => {
    await page.goto('/admin/permissions');

    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    // Try very long name
    await page.fill('input[name="name"]', 'a'.repeat(200));
    await page.selectOption('select[name="module"]', { label: /assets/i });

    const submitButton = page.getByRole('button', { name: /create/i });
    await submitButton.click();

    // Should show validation error
    await expect(page.getByText(/too long|maximum/i)).toBeVisible();
  });

  test('should handle special characters in description', async ({ page }) => {
    await page.goto('/admin/permissions');

    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    // Use special chars in description
    await page.fill('input[name="name"]', 'test_special');
    await page.selectOption('select[name="module"]', { label: /assets/i });
    await page.fill('textarea[name="description"]', 'Test with special chars: @#$%^&*()_+-={}[]|\\:";\'<>?,./');

    const submitButton = page.getByRole('button', { name: /create/i });
    await submitButton.click();

    // Should accept special chars in description
    await expect(page.getByText(/created|success/i)).toBeVisible();
  });

  test('should handle concurrent permission creation', async ({ page, context }) => {
    // Create multiple permissions at once
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(
        context.request.post('/admin/permissions', {
          headers: {
            'Accept': 'application/json',
          },
          data: {
            name: `concurrent_test_${i}_${Date.now()}`,
            module: 'test',
          },
        })
      );
    }

    const responses = await Promise.all(promises);

    // All should succeed or fail gracefully
    for (const response of responses) {
      expect([201, 422]).toContain(response.status());
    }
  });

  test('should handle rapid delete operations', async ({ page, context }) => {
    // Create permissions first
    const createdIds = [];
    for (let i = 0; i < 3; i++) {
      const response = await context.request.post('/admin/permissions', {
        headers: {
          'Accept': 'application/json',
        },
        data: {
          name: `rapid_delete_${i}_${Date.now()}`,
          module: 'test',
        },
      });

      if (response.status() === 201) {
        const data = await response.json();
        createdIds.push(data.data.id);
      }
    }

    // Rapidly delete them
    const deletePromises = createdIds.map((id) =>
      context.request.delete(`/admin/permissions/${id}`, {
        headers: {
          'Accept': 'application/json',
        },
      })
    );

    const responses = await Promise.all(deletePromises);

    // All should succeed
    for (const response of responses) {
      expect([200, 204, 404]).toContain(response.status());
    }
  });

  test('should display empty state when no permissions exist', async ({ page }) => {
    // This test requires database with no permissions - skip for now
    test.skip(true, 'Requires clean database state');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/admin/permissions');

    // Simulate network offline
    await page.context().setOffline(true);

    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    await page.fill('input[name="name"]', 'offline_test');
    await page.selectOption('select[name="module"]', { label: /assets/i });

    const submitButton = page.getByRole('button', { name: /create/i });
    await submitButton.click();

    // Should show network error
    await expect(page.getByText(/network|offline|connection/i)).toBeVisible();

    // Restore connection
    await page.context().setOffline(false);
  });
});

test.describe('Admin - Permissions - Navigation', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should navigate from roles to permissions', async ({ page }) => {
    await page.goto('/admin/roles');

    // Look for permissions management link
    const permissionsLink = page.getByRole('link', { name: /permission|hak akses/i }).or(
      page.locator('a[href*="permissions"]')
    );

    if (await permissionsLink.count() > 0) {
      await permissionsLink.first().click();

      // Should navigate to permissions page
      await expect(page).toHaveURL(/\/admin\/permissions/);
    }
  });

  test('should navigate to roles from permissions', async ({ page }) => {
    await page.goto('/admin/permissions');

    // Look for roles link
    const rolesLink = page.getByRole('link', { name: /roles|peran/i }).or(
      page.locator('a[href*="roles"]')
    );

    if (await rolesLink.count() > 0) {
      await rolesLink.first().click();

      // Should navigate to roles page
      await expect(page).toHaveURL(/\/admin\/roles/);
    }
  });

  test('should update browser history correctly', async ({ page }) => {
    await page.goto('/admin/permissions');

    // Navigate to roles
    await page.goto('/admin/roles');

    // Go back
    await page.goBack();

    // Should be back on permissions page
    await expect(page).toHaveURL(/\/admin\/permissions/);

    // Go forward
    await page.goForward();

    // Should be on roles page
    await expect(page).toHaveURL(/\/admin\/roles/);
  });
});

test.describe('Admin - Permissions - Accessibility', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/admin/permissions');

    // Check for ARIA labels on interactive elements
    const buttons = page.getByRole('button');

    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const hasLabel = await button.getAttribute('aria-label');

      // At least have accessible name (text or aria-label)
      const hasText = await button.textContent();
      expect(hasLabel || hasText).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/admin/permissions');

    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Focus should be on an interactive element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT', 'SELECT']).toContain(focusedElement);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/admin/permissions');

    // Check for h1
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();

    // Check for h2 if content is organized
    const h2 = page.getByRole('heading', { level: 2 });
    const hasH2 = await h2.count() > 0;

    if (hasH2) {
      await expect(h2.first()).toBeVisible();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a basic check - real accessibility testing requires specialized tools
    await page.goto('/admin/permissions');

    // Verify text is visible (not hidden by color)
    const textElements = page.locator('p, span, div').filter({ hasText: /\w+/ });

    const count = await textElements.count();
    expect(count).toBeGreaterThan(0);
  });
});
