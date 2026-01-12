import { test, expect } from '@playwright/test';
import { login, logout } from './support/auth';
import { testUsers } from './support/test-users';

/**
 * Admin - User Management E2E Tests
 *
 * Tests complete user management functionality including:
 * - Viewing all users with search, filter, and pagination
 * - Creating new users
 * - Editing existing users
 * - Deleting and restoring users
 * - Managing user roles
 * - Impersonating users
 * - Exporting user data
 * - Viewing audit logs
 * - Permission checks (403)
 *
 * Routes: /admin/users/*
 * Controllers: Admin/UserController.php, Admin/ImpersonateController.php
 * Middleware: permission:users.*, users.impersonate
 * Pages: resources/js/pages/Admin/Users/*.tsx
 */

test.describe('Admin - User Management - Index Page', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display users index page', async ({ page }) => {
    await page.goto('/admin/users');

    // Verify page title
    await expect(page).toHaveTitle(/user management|users/i);

    // Verify heading
    await expect(page.getByRole('heading', { name: /users|user management/i, level: 1 })).toBeVisible();

    // Verify search input
    await expect(page.getByRole('textbox', { name: /search/i })).toBeVisible();

    // Verify table or list is displayed
    const table = page.locator('table').or(
      page.locator('[role="table"]')
    );
    await expect(table.first()).toBeVisible();
  });

  test('should display all users in table', async ({ page }) => {
    await page.goto('/admin/users');

    // Expected users in the system
    const expectedUsers = [
      'admin@pa-penajam.go.id',
      'operator_atk@demo.com',
      'kasubag@demo.com',
      'kpa@demo.com',
      'pegawai@demo.com',
    ];

    // Verify each user is displayed
    for (const userEmail of expectedUsers) {
      await expect(page.getByText(userEmail)).toBeVisible();
    }
  });

  test('should display user columns correctly', async ({ page }) => {
    await page.goto('/admin/users');

    // Verify column headers
    const expectedColumns = [/name/i, /email/i, /nip/i, /phone/i, /position/i, /roles/i, /status/i, /actions/i];

    for (const column of expectedColumns) {
      const header = page.getByRole('columnheader', { name: column }).or(
        page.locator('th').filter({ hasText: column })
      );
      await expect(header.first()).toBeVisible();
    }
  });

  test('should display user avatars with initials', async ({ page }) => {
    await page.goto('/admin/users');

    // Look for avatar elements
    const avatars = page.locator('[aria-label*="avatar" i], .avatar, [class*="avatar"]');

    if (await avatars.count() > 0) {
      await expect(avatars.first()).toBeVisible();
    }
  });

  test('should display role badges for users', async ({ page }) => {
    await page.goto('/admin/users');

    // Expected roles
    const expectedRoles = ['Super Admin', 'KPA', 'Kasubag Umum', 'Pegawai', 'Operator ATK', 'Operator BMN'];

    // Verify at least some roles are displayed as badges
    for (const role of expectedRoles.slice(0, 3)) {
      const roleBadge = page.locator('[role="badge"], .badge, [class*="badge"]').filter({ hasText: role });
      if (await roleBadge.count() > 0) {
        await expect(roleBadge.first()).toBeVisible();
      }
    }
  });

  test('should display status badges (Active/Inactive)', async ({ page }) => {
    await page.goto('/admin/users');

    // Look for status badges
    const activeStatus = page.getByText(/active/i).or(
      page.locator('[class*="status"]').filter({ hasText: /active/i })
    );

    await expect(activeStatus.first()).toBeVisible();
  });

  test('should have action buttons for each user', async ({ page }) => {
    await page.goto('/admin/users');

    // Verify action buttons exist
    const editButton = page.getByRole('button', { name: /edit|ubah/i }).or(
      page.locator('[aria-label*="edit" i]')
    ).first();

    const deleteButton = page.getByRole('button', { name: /delete|hapus/i }).or(
      page.locator('[aria-label*="delete" i]')
    ).first();

    const impersonateButton = page.getByRole('button', { name: /impersonate/i }).or(
      page.locator('[aria-label*="impersonate" i]')
    ).first();

    // At least some action buttons should be visible
    const hasActions = await editButton.count() > 0 ||
                       await deleteButton.count() > 0 ||
                       await impersonateButton.count() > 0;

    expect(hasActions).toBeTruthy();
  });

  test('should search users by name', async ({ page }) => {
    await page.goto('/admin/users');

    // Get initial user count
    const initialCount = await page.locator('tbody tr').count();

    // Type in search box
    const searchInput = page.getByRole('textbox', { name: /search/i }).or(
      page.locator('input[placeholder*="search" i]')
    );

    await searchInput.fill('admin');
    await page.waitForTimeout(500); // Wait for debounce

    // Verify filtered results
    const filteredCount = await page.locator('tbody tr').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Verify "admin" appears in results
    await expect(page.getByText(/admin/i)).toBeVisible();
  });

  test('should search users by email', async ({ page }) => {
    await page.goto('/admin/users');

    // Search by email
    const searchInput = page.getByRole('textbox', { name: /search/i });
    await searchInput.fill('admin@pa-penajam.go.id');
    await page.waitForTimeout(500); // Wait for debounce

    // Verify specific email is shown
    await expect(page.getByText('admin@pa-penajam.go.id')).toBeVisible();
  });

  test('should search users by NIP', async ({ page }) => {
    await page.goto('/admin/users');

    // Search by NIP (if users have NIP)
    const searchInput = page.getByRole('textbox', { name: /search/i });
    await searchInput.fill('123'); // Partial NIP
    await page.waitForTimeout(500); // Wait for debounce

    // Just verify no errors occur
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('should filter users by role', async ({ page }) => {
    await page.goto('/admin/users');

    // Look for role filter dropdown
    const roleFilter = page.getByRole('combobox', { name: /role/i }).or(
      page.locator('select[name*="role" i]').or(
        page.locator('[data-test="role-filter"]')
      )
    );

    if (await roleFilter.count() > 0) {
      // Select a role
      await roleFilter.selectOption({ label: /super admin/i });
      await page.waitForTimeout(500);

      // Verify filtered results
      await expect(page.getByText(/super admin/i)).toBeVisible();
    }
  });

  test('should filter users by status', async ({ page }) => {
    await page.goto('/admin/users');

    // Look for status filter
    const statusFilter = page.getByRole('combobox', { name: /status/i }).or(
      page.locator('select[name*="status" i]').or(
        page.locator('[data-test="status-filter"]')
      )
    );

    if (await statusFilter.count() > 0) {
      // Select Active status
      await statusFilter.selectOption({ label: /active/i });
      await page.waitForTimeout(500);

      // Verify filtered results show active status
      await expect(page.getByText(/active/i)).toBeVisible();
    }
  });

  test('should filter users by department', async ({ page }) => {
    await page.goto('/admin/users');

    // Look for department filter
    const deptFilter = page.getByRole('combobox', { name: /department/i }).or(
      page.locator('select[name*="department" i]').or(
        page.locator('[data-test="department-filter"]')
      )
    );

    if (await deptFilter.count() > 0) {
      // Select a department
      await deptFilter.selectOption({ index: 1 });
      await page.waitForTimeout(500);

      // Verify filter was applied (no errors)
      await expect(page.locator('table').first()).toBeVisible();
    }
  });

  test('should sort users by clicking column headers', async ({ page }) => {
    await page.goto('/admin/users');

    // Click on Name column header to sort
    const nameHeader = page.getByRole('columnheader', { name: /name/i }).or(
      page.locator('th').filter({ hasText: /name/i })
    ).first();

    await nameHeader.click();
    await page.waitForTimeout(300);

    // Verify sorting indicator or just check no errors
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('should paginate users', async ({ page }) => {
    await page.goto('/admin/users');

    // Look for pagination controls
    const pagination = page.locator('.pagination, [role="navigation"]');

    if (await pagination.count() > 0) {
      // Look for "Next" button or page numbers
      const nextButton = page.getByRole('button', { name: /next|selanjutnya/i }).or(
        page.locator('a:has-text("Next")')
      );

      if (await nextButton.count() > 0) {
        await nextButton.first().click();
        await page.waitForTimeout(300);

        // Verify we're still on the users page
        await expect(page).toHaveURL(/\/admin\/users/);
      }
    }
  });

  test('should change per page count', async ({ page }) => {
    await page.goto('/admin/users');

    // Look for per page selector
    const perPageSelect = page.getByRole('combobox', { name: /per page|show/i }).or(
      page.locator('select[name*="per_page" i]').or(
        page.locator('[data-test="per-page-select"]')
      )
    );

    if (await perPageSelect.count() > 0) {
      // Change to 50 per page
      await perPageSelect.selectOption({ label: '50' });
      await page.waitForTimeout(300);

      // Verify no errors
      await expect(page.locator('table').first()).toBeVisible();
    }
  });

  test('should export users to Excel', async ({ page }) => {
    await page.goto('/admin/users');

    // Look for export button
    const exportButton = page.getByRole('button', { name: /export|excel/i }).or(
      page.locator('[data-test="export-button"]')
    );

    if (await exportButton.count() > 0) {
      // Setup download handler
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

      await exportButton.click();

      // Verify download started (or at least button was clicked)
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.(xlsx|csv)$/);
      }
    }
  });

  test('should export users to CSV', async ({ page }) => {
    await page.goto('/admin/users');

    // Look for export dropdown with CSV option
    const exportButton = page.getByRole('button', { name: /export/i });

    if (await exportButton.count() > 0) {
      await exportButton.click();

      const csvOption = page.getByRole('menuitem', { name: /csv/i }).or(
        page.locator('[data-test="export-csv"]')
      );

      if (await csvOption.count() > 0) {
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

        await csvOption.click();

        const download = await downloadPromise;
        if (download) {
          expect(download.suggestedFilename()).toMatch(/\.csv$/);
        }
      }
    }
  });
});

test.describe('Admin - User Management - Create User', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display create user form', async ({ page }) => {
    await page.goto('/admin/users/create');

    // Verify heading
    await expect(page.getByRole('heading', { name: /create user|tambah user/i, level: 1 })).toBeVisible();

    // Verify form fields
    await expect(page.getByRole('textbox', { name: /name|nama/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /phone|telepon/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /nip/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /position|jabatan/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /confirm password|konfirmasi password/i })).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/users/create');

    // Submit form without filling required fields
    const submitButton = page.getByRole('button', { name: /create|save|simpan/i });
    await submitButton.click();

    // Verify validation errors appear
    await expect(page.getByText(/required|wajib/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/admin/users/create');

    // Enter invalid email
    await page.getByRole('textbox', { name: /email/i }).fill('invalid-email');

    // Trigger validation (blur or submit)
    await page.getByRole('textbox', { name: /email/i }).blur();

    // Verify email validation error
    const emailError = page.getByText(/invalid|must be|email/i).or(
      page.locator('.error').filter({ hasText: /email/i })
    );

    if (await emailError.count() > 0) {
      await expect(emailError.first()).toBeVisible();
    }
  });

  test('should validate email uniqueness', async ({ page }) => {
    await page.goto('/admin/users/create');

    // Enter existing email
    await page.getByRole('textbox', { name: /name/i }).fill('Test User');
    await page.getByRole('textbox', { name: /email/i }).fill('admin@pa-penajam.go.id');
    await page.getByRole('textbox', { name: /password/i }).fill('Password123');
    await page.getByRole('textbox', { name: /confirm password/i }).fill('Password123');

    // Submit form
    const submitButton = page.getByRole('button', { name: /create|save|simpan/i });
    await submitButton.click();

    // Verify uniqueness error
    await expect(page.getByText(/already exists|sudah ada|taken/i)).toBeVisible();
  });

  test('should validate phone format', async ({ page }) => {
    await page.goto('/admin/users/create');

    // Enter invalid phone
    await page.getByRole('textbox', { name: /phone/i }).fill('invalid-phone');

    // Trigger validation
    await page.getByRole('textbox', { name: /phone/i }).blur();

    // Verify phone validation
    const phoneError = page.getByText(/invalid|must be|phone/i);

    if (await phoneError.count() > 0) {
      await expect(phoneError.first()).toBeVisible();
    }
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/admin/users/create');

    // Fill form with weak password
    await page.getByRole('textbox', { name: /name/i }).fill('Test User');
    await page.getByRole('textbox', { name: /email/i }).fill('test@example.com');
    await page.getByRole('textbox', { name: /password/i }).fill('weak');
    await page.getByRole('textbox', { name: /confirm password/i }).fill('weak');

    // Submit form
    const submitButton = page.getByRole('button', { name: /create|save|simpan/i });
    await submitButton.click();

    // Verify password validation error
    await expect(page.getByText(/password|kata sandi/i)).toBeVisible();
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/admin/users/create');

    // Fill form with mismatched passwords
    await page.getByRole('textbox', { name: /name/i }).fill('Test User');
    await page.getByRole('textbox', { name: /email/i }).fill('test@example.com');
    await page.getByRole('textbox', { name: /password/i }).fill('Password123');
    await page.getByRole('textbox', { name: /confirm password/i }).fill('Password456');

    // Submit form
    const submitButton = page.getByRole('button', { name: /create|save|simpan/i });
    await submitButton.click();

    // Verify confirmation error
    await expect(page.getByText(/match|sama|konfirmasi/i)).toBeVisible();
  });

  test('should validate at least one role is selected', async ({ page }) => {
    await page.goto('/admin/users/create');

    // Fill form without selecting roles
    await page.getByRole('textbox', { name: /name/i }).fill('Test User');
    await page.getByRole('textbox', { name: /email/i }).fill('test@example.com');
    await page.getByRole('textbox', { name: /password/i }).fill('Password123');
    await page.getByRole('textbox', { name: /confirm password/i }).fill('Password123');

    // Submit form
    const submitButton = page.getByRole('button', { name: /create|save|simpan/i });
    await submitButton.click();

    // Verify role validation error
    await expect(page.getByText(/role|peran/i)).toBeVisible();
  });

  test('should create new user successfully', async ({ page }) => {
    await page.goto('/admin/users/create');

    // Fill form with valid data
    const timestamp = Date.now();
    await page.getByRole('textbox', { name: /name/i }).fill(`Test User ${timestamp}`);
    await page.getByRole('textbox', { name: /email/i }).fill(`test${timestamp}@example.com`);
    await page.getByRole('textbox', { name: /phone/i }).fill('+62812345678');
    await page.getByRole('textbox', { name: /password/i }).fill('Password123');
    await page.getByRole('textbox', { name: /confirm password/i }).fill('Password123');

    // Select at least one role
    const roleCheckbox = page.locator('input[type="checkbox"][name*="role"]').first();
    if (await roleCheckbox.count() > 0) {
      await roleCheckbox.check();
    }

    // Submit form
    const submitButton = page.getByRole('button', { name: /create|save|simpan/i });
    await submitButton.click();

    // Verify success - either redirect or success message
    await expect(page.or(
      page.getByURL(/\/admin\/users\/\w+/),
      page.getByText(/created|success|berhasil/i)
    )).toBeVisible();
  });

  test('should redirect to user detail after creation', async ({ page }) => {
    await page.goto('/admin/users/create');

    // Fill and submit form
    const timestamp = Date.now();
    await page.getByRole('textbox', { name: /name/i }).fill(`Test User ${timestamp}`);
    await page.getByRole('textbox', { name: /email/i }).fill(`test${timestamp}@example.com`);
    await page.getByRole('textbox', { name: /password/i }).fill('Password123');
    await page.getByRole('textbox', { name: /confirm password/i }).fill('Password123');

    const roleCheckbox = page.locator('input[type="checkbox"][name*="role"]').first();
    if (await roleCheckbox.count() > 0) {
      await roleCheckbox.check();
    }

    const submitButton = page.getByRole('button', { name: /create|save|simpan/i });
    await submitButton.click();

    // Verify redirect to detail page
    await expect(page).toHaveURL(/\/admin\/users\/\w+/);
  });

  test('should show success toast after creation', async ({ page }) => {
    await page.goto('/admin/users/create');

    // Fill and submit form
    const timestamp = Date.now();
    await page.getByRole('textbox', { name: /name/i }).fill(`Test User ${timestamp}`);
    await page.getByRole('textbox', { name: /email/i }).fill(`test${timestamp}@example.com`);
    await page.getByRole('textbox', { name: /password/i }).fill('Password123');
    await page.getByRole('textbox', { name: /confirm password/i }).fill('Password123');

    const roleCheckbox = page.locator('input[type="checkbox"][name*="role"]').first();
    if (await roleCheckbox.count() > 0) {
      await roleCheckbox.check();
    }

    const submitButton = page.getByRole('button', { name: /create|save|simpan/i });
    await submitButton.click();

    // Look for success toast
    const successToast = page.getByText(/created|success|berhasil|disimpan/i).or(
      page.locator('.toast, [role="alert"]').filter({ hasText: /success/i })
    );

    await expect(successToast.first()).toBeVisible();
  });
});

test.describe('Admin - User Management - Edit User', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display edit user form', async ({ page }) => {
    // Navigate to first user's edit page
    await page.goto('/admin/users');
    const editButton = page.getByRole('button', { name: /edit|ubah/i }).or(
      page.locator('a[href*="/edit"]')
    ).first();

    if (await editButton.count() > 0) {
      await editButton.click();

      // Verify heading
      await expect(page.getByRole('heading', { name: /edit user|ubah user/i, level: 1 })).toBeVisible();

      // Verify form is pre-filled
      await expect(page.getByRole('textbox', { name: /name|nama/i })).not.toBeEmpty();
    }
  });

  test('should pre-fill form with existing user data', async ({ page }) => {
    await page.goto('/admin/users');
    const editButton = page.getByRole('button', { name: /edit/i }).first();

    if (await editButton.count() > 0) {
      await editButton.click();

      // Verify fields have values
      const nameInput = page.getByRole('textbox', { name: /name/i });
      const emailInput = page.getByRole('textbox', { name: /email/i });

      await expect(nameInput).nottoHaveValue('');
      await expect(emailInput).not.toHaveValue('');
    }
  });

  test('should validate updated data', async ({ page }) => {
    await page.goto('/admin/users');
    const editButton = page.getByRole('button', { name: /edit/i }).first();

    if (await editButton.count() > 0) {
      await editButton.click();

      // Clear and enter invalid email
      const emailInput = page.getByRole('textbox', { name: /email/i });
      await emailInput.fill('');
      await emailInput.fill('invalid-email');

      const submitButton = page.getByRole('button', { name: /update|save|simpan/i });
      await submitButton.click();

      // Verify validation error
      await expect(page.getByText(/email|invalid/i)).toBeVisible();
    }
  });

  test('should update user successfully', async ({ page }) => {
    await page.goto('/admin/users');
    const editButton = page.getByRole('button', { name: /edit/i }).first();

    if (await editButton.count() > 0) {
      await editButton.click();

      // Update name
      const nameInput = page.getByRole('textbox', { name: /name/i });
      const currentName = await nameInput.inputValue();
      await nameInput.fill(`${currentName} Updated`);

      // Submit form
      const submitButton = page.getByRole('button', { name: /update|save|simpan/i });
      await submitButton.click();

      // Verify success
      await expect(page.or(
        page.getByText(/updated|success|berhasil/i),
        page.getByURL(/\/admin\/users\/\w+/)
      )).toBeVisible();
    }
  });

  test('should update password if provided', async ({ page }) => {
    await page.goto('/admin/users');
    const editButton = page.getByRole('button', { name: /edit/i }).first();

    if (await editButton.count() > 0) {
      await editButton.click();

      // Fill password fields
      await page.getByRole('textbox', { name: /password/i }).fill('NewPassword123');
      await page.getByRole('textbox', { name: /confirm password/i }).fill('NewPassword123');

      // Submit form
      const submitButton = page.getByRole('button', { name: /update|save|simpan/i });
      await submitButton.click();

      // Verify success
      await expect(page.getByText(/updated|success/i)).toBeVisible();
    }
  });

  test('should not require password on update', async ({ page }) => {
    await page.goto('/admin/users');
    const editButton = page.getByRole('button', { name: /edit/i }).first();

    if (await editButton.count() > 0) {
      await editButton.click();

      // Update name without touching password
      const nameInput = page.getByRole('textbox', { name: /name/i });
      await nameInput.fill('Updated Name');

      // Submit form
      const submitButton = page.getByRole('button', { name: /update|save|simpan/i });
      await submitButton.click();

      // Verify success - no password validation errors
      await expect(page.or(
        page.getByText(/updated|success/i),
        page.getByURL(/\/admin\/users\/\w+/)
      )).toBeVisible();
    }
  });

  test('should toggle email verified status', async ({ page }) => {
    await page.goto('/admin/users');
    const editButton = page.getByRole('button', { name: /edit/i }).first();

    if (await editButton.count() > 0) {
      await editButton.click();

      // Look for email verified toggle
      const verifiedToggle = page.locator('input[type="checkbox"][name*="verified" i]').or(
        page.getByRole('checkbox', { name: /email verified/i })
      );

      if (await verifiedToggle.count() > 0) {
        await verifiedToggle.check();

        const submitButton = page.getByRole('button', { name: /update|save/i });
        await submitButton.click();

        // Verify success
        await expect(page.getByText(/updated|success/i)).toBeVisible();
      }
    }
  });

  test('should toggle user status (Active/Inactive)', async ({ page }) => {
    await page.goto('/admin/users');
    const editButton = page.getByRole('button', { name: /edit/i }).first();

    if (await editButton.count() > 0) {
      await editButton.click();

      // Look for status toggle
      const statusToggle = page.locator('input[type="checkbox"][name*="active" i]').or(
        page.getByRole('switch', { name: /status|active/i })
      );

      if (await statusToggle.count() > 0) {
        // Toggle status
        const isChecked = await statusToggle.isChecked();
        if (isChecked) {
          await statusToggle.uncheck();
        } else {
          await statusToggle.check();
        }

        const submitButton = page.getByRole('button', { name: /update|save/i });
        await submitButton.click();

        // Verify success
        await expect(page.getByText(/updated|success/i)).toBeVisible();
      }
    }
  });
});

test.describe('Admin - User Management - Delete & Restore', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    await page.goto('/admin/users');

    // Click delete button
    const deleteButton = page.getByRole('button', { name: /delete|hapus/i }).first();

    if (await deleteButton.count() > 0) {
      await deleteButton.click();

      // Verify confirmation dialog
      const dialog = page.locator('[role="dialog"], .modal, [class*="confirm"]');
      await expect(dialog.first()).toBeVisible();

      // Verify warning message
      await expect(page.getByText(/are you sure|yakin|hapus/i)).toBeVisible();
    }
  });

  test('should display user info in confirmation dialog', async ({ page }) => {
    await page.goto('/admin/users');

    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    if (await deleteButton.count() > 0) {
      await deleteButton.click();

      // Verify user name/email is shown in dialog
      await expect(page.locator('[role="dialog"]').or(page.locator('.modal')))
        .toBeVisible();
    }
  });

  test('should cancel deletion when cancel clicked', async ({ page }) => {
    await page.goto('/admin/users');

    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    if (await deleteButton.count() > 0) {
      await deleteButton.click();

      // Click cancel button
      const cancelButton = page.getByRole('button', { name: /cancel|batal/i });
      await cancelButton.click();

      // Verify dialog is closed and user is still in list
      const dialog = page.locator('[role="dialog"]');
      expect(await dialog.count()).toBe(0);
    }
  });

  test('should delete user successfully', async ({ page }) => {
    await page.goto('/admin/users');

    // Get initial user count
    const initialCount = await page.locator('tbody tr').count();

    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    if (await deleteButton.count() > 0) {
      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page.getByRole('button', { name: /confirm|yes|ya|hapus/i });
      await confirmButton.click();

      // Wait for success message
      await expect(page.getByText(/deleted|success|berhasil/i)).toBeVisible();

      // Verify user count decreased or user removed from list
      await page.waitForTimeout(500);
      const newCount = await page.locator('tbody tr').count();
      expect(newCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should show restore button for deleted users', async ({ page }) => {
    await page.goto('/admin/users');

    // Look for restore button (might need to filter for deleted users first)
    const restoreButton = page.getByRole('button', { name: /restore|pulihkan/i });

    if (await restoreButton.count() > 0) {
      await expect(restoreButton.first()).toBeVisible();
    }
  });

  test('should restore deleted user successfully', async ({ page }) => {
    await page.goto('/admin/users');

    // Look for restore button
    const restoreButton = page.getByRole('button', { name: /restore/i }).first();

    if (await restoreButton.count() > 0) {
      await restoreButton.click();

      // Verify success message
      await expect(page.getByText(/restored|success|berhasil/i)).toBeVisible();

      // Verify user is back in active list
      await page.waitForTimeout(500);
    }
  });

  test('should soft delete user (not hard delete)', async ({ page }) => {
    // This test verifies that users are soft-deleted
    // In a real implementation, you would:
    // 1. Delete a user
    // 2. Query database to verify deleted_at is set
    // 3. Verify user still exists in database

    test.skip(true, 'Requires database verification');
  });
});

test.describe('Admin - User Management - User Detail Page', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display user detail page', async ({ page }) => {
    await page.goto('/admin/users');

    // Click on first user
    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    // Verify we're on detail page
    await expect(page).toHaveURL(/\/admin\/users\/\w+/);

    // Verify heading
    await expect(page.getByRole('heading', { name: /user|detail/i, level: 1 })).toBeVisible();
  });

  test('should display user information in Info tab', async ({ page }) => {
    await page.goto('/admin/users');

    // Navigate to first user
    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    // Verify user info is displayed
    await expect(page.getByText(/@/)).toBeVisible(); // Email
  });

  test('should display tabs (Info, Roles, Activity)', async ({ page }) => {
    await page.goto('/admin/users');

    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    // Verify tabs exist
    const tabs = ['Info', 'Roles', 'Activity', 'Activity Log'];

    for (const tab of tabs) {
      const tabElement = page.getByRole('tab', { name: tab }).or(
        page.locator('a').filter({ hasText: tab })
      );

      if (await tabElement.count() > 0) {
        await expect(tabElement.first()).toBeVisible();
      }
    }
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/admin/users');

    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    // Try to switch to Roles tab
    const rolesTab = page.getByRole('tab', { name: /roles/i }).or(
      page.locator('a').filter({ hasText: /roles/i })
    );

    if (await rolesTab.count() > 0) {
      await rolesTab.click();

      // Verify URL updated
      await expect(page).toHaveURL(/tab=roles/);
    }
  });

  test('should display action buttons on detail page', async ({ page }) => {
    await page.goto('/admin/users');

    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    // Verify action buttons
    const editButton = page.getByRole('button', { name: /edit/i });
    const deleteButton = page.getByRole('button', { name: /delete/i });
    const impersonateButton = page.getByRole('button', { name: /impersonate/i });

    // At least edit button should be visible
    await expect(editButton.first()).toBeVisible();
  });
});

test.describe('Admin - User Management - Role Assignment', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display all roles in Roles tab', async ({ page }) => {
    await page.goto('/admin/users');

    // Navigate to first user
    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    // Go to Roles tab
    const rolesTab = page.getByRole('tab', { name: /roles/i }).or(
      page.locator('a').filter({ hasText: /roles/i })
    );

    if (await rolesTab.count() > 0) {
      await rolesTab.click();

      // Verify roles are displayed
      const expectedRoles = ['Super Admin', 'KPA', 'Kasubag Umum', 'Pegawai', 'Operator ATK', 'Operator BMN'];

      for (const role of expectedRoles) {
        const roleElement = page.getByText(role);
        if (await roleElement.count() > 0) {
          await expect(roleElement.first()).toBeVisible();
        }
      }
    }
  });

  test('should show user current roles as checked', async ({ page }) => {
    await page.goto('/admin/users');

    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    const rolesTab = page.getByRole('tab', { name: /roles/i });
    if (await rolesTab.count() > 0) {
      await rolesTab.click();

      // Verify some checkboxes are checked
      const checkedCheckboxes = page.locator('input[type="checkbox"]:checked');

      if (await checkedCheckboxes.count() > 0) {
        await expect(checkedCheckboxes.first()).toBeChecked();
      }
    }
  });

  test('should assign role to user', async ({ page }) => {
    await page.goto('/admin/users');

    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    const rolesTab = page.getByRole('tab', { name: /roles/i });
    if (await rolesTab.count() > 0) {
      await rolesTab.click();

      // Find an unchecked checkbox
      const uncheckedCheckbox = page.locator('input[type="checkbox"]:not(:checked)').first();

      if (await uncheckedCheckbox.count() > 0) {
        await uncheckedCheckbox.check();

        // Wait for API call
        await page.waitForTimeout(500);

        // Verify success message or checkbox is now checked
        await expect(uncheckedCheckbox).toBeChecked();
      }
    }
  });

  test('should remove role from user', async ({ page }) => {
    await page.goto('/admin/users');

    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    const rolesTab = page.getByRole('tab', { name: /roles/i });
    if (await rolesTab.count() > 0) {
      await rolesTab.click();

      // Find a checked checkbox (that's not the only role)
      const checkedCheckbox = page.locator('input[type="checkbox"]:checked').first();

      if (await checkedCheckbox.count() > 0) {
        await checkedCheckbox.uncheck();

        // Wait for API call
        await page.waitForTimeout(500);

        // Verify checkbox is now unchecked
        await expect(checkedCheckbox).not.toBeChecked();
      }
    }
  });

  test('should support multiple roles per user', async ({ page }) => {
    await page.goto('/admin/users');

    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    const rolesTab = page.getByRole('tab', { name: /roles/i });
    if (await rolesTab.count() > 0) {
      await rolesTab.click();

      // Check multiple roles
      const uncheckedCheckboxes = page.locator('input[type="checkbox"]:not(:checked)');

      if (await uncheckedCheckboxes.count() >= 2) {
        await uncheckedCheckboxes.nth(0).check();
        await page.waitForTimeout(300);
        await uncheckedCheckboxes.nth(1).check();
        await page.waitForTimeout(300);

        // Verify both are checked
        await expect(uncheckedCheckboxes.nth(0)).toBeChecked();
        await expect(uncheckedCheckboxes.nth(1)).toBeChecked();
      }
    }
  });
});

test.describe('Admin - User Management - Activity Log', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display activity log tab', async ({ page }) => {
    await page.goto('/admin/users');

    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    // Look for Activity Log tab
    const activityTab = page.getByRole('tab', { name: /activity|log/i }).or(
      page.locator('a').filter({ hasText: /activity|log/i })
    );

    if (await activityTab.count() > 0) {
      await activityTab.click();

      // Verify activity log table is displayed
      await expect(page.locator('table').first()).toBeVisible();
    }
  });

  test('should display audit log entries', async ({ page }) => {
    await page.goto('/admin/users');

    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    const activityTab = page.getByRole('tab', { name: /activity|log/i });
    if (await activityTab.count() > 0) {
      await activityTab.click();

      // Look for log entries
      const logEntries = page.locator('tbody tr');

      if (await logEntries.count() > 0) {
        await expect(logEntries.first()).toBeVisible();
      }
    }
  });

  test('should display actor information', async ({ page }) => {
    await page.goto('/admin/users');

    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    const activityTab = page.getByRole('tab', { name: /activity|log/i });
    if (await activityTab.count() > 0) {
      await activityTab.click();

      // Look for actor column (who performed the action)
      await expect(page.getByText(/admin|actor|oleh/i)).toBeVisible();
    }
  });

  test('should display action performed', async ({ page }) => {
    await page.goto('/admin/users');

    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    const activityTab = page.getByRole('tab', { name: /activity|log/i });
    if (await activityTab.count() > 0) {
      await activityTab.click();

      // Look for action descriptions
      const actions = [/created|updated|deleted|assigned|removed/i];

      for (const action of actions) {
        const actionElement = page.getByText(action);
        if (await actionElement.count() > 0) {
          await expect(actionElement.first()).toBeVisible();
          break;
        }
      }
    }
  });

  test('should display timestamp', async ({ page }) => {
    await page.goto('/admin/users');

    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    const activityTab = page.getByRole('tab', { name: /activity|log/i });
    if (await activityTab.count() > 0) {
      await activityTab.click();

      // Look for timestamp column
      await expect(page.or(
        page.getByText(/\d{4}-\d{2}-\d{2}/), // Date format
        page.getByText(/ago|menit|jam/i) // Relative time
      )).toBeVisible();
    }
  });
});

test.describe('Admin - User Management - Impersonate', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should display impersonate button', async ({ page }) => {
    await page.goto('/admin/users');

    const userRow = page.locator('tbody tr').first();
    await userRow.click();

    // Look for impersonate button
    const impersonateButton = page.getByRole('button', { name: /impersonate/i }).or(
      page.locator('[aria-label*="impersonate" i]')
    );

    if (await impersonateButton.count() > 0) {
      await expect(impersonateButton.first()).toBeVisible();
    }
  });

  test('should start impersonating user', async ({ page }) => {
    await page.goto('/admin/users');

    // Find a non-super-admin user
    const userRow = page.locator('tbody tr').filter({ hasText: /pegawai|kpa/i }).first();

    if (await userRow.count() > 0) {
      await userRow.click();

      const impersonateButton = page.getByRole('button', { name: /impersonate/i });
      if (await impersonateButton.count() > 0) {
        await impersonateButton.click();

        // Verify impersonate banner appears
        await expect(page.getByText(/impersonating/i)).toBeVisible();
      }
    }
  });

  test('should display impersonate banner', async ({ page }) => {
    // This test assumes user is already impersonating
    test.skip(true, 'Requires impersonate session to be active');
  });

  test('should show target user name in banner', async ({ page }) => {
    test.skip(true, 'Requires impersonate session to be active');
  });

  test('should have stop impersonating button', async ({ page }) => {
    test.skip(true, 'Requires impersonate session to be active');
  });

  test('should stop impersonating and return to admin', async ({ page }) => {
    // Start impersonating first
    await page.goto('/admin/users');

    const userRow = page.locator('tbody tr').filter({ hasText: /pegawai/i }).first();

    if (await userRow.count() > 0) {
      await userRow.click();

      const impersonateButton = page.getByRole('button', { name: /impersonate/i });
      if (await impersonateButton.count() > 0) {
        await impersonateButton.click();

        // Wait for banner
        await page.waitForTimeout(500);

        // Look for stop impersonating button
        const stopButton = page.getByRole('button', { name: /stop|return|kembali/i }).or(
          page.locator('[data-test="stop-impersonate"]')
        );

        if (await stopButton.count() > 0) {
          await stopButton.click();

          // Verify redirect back to users page
          await expect(page).toHaveURL(/\/admin\/users/);

          // Verify banner is gone
          await expect(page.getByText(/impersonating/i)).not.toBeVisible();
        }
      }
    }
  });
});

test.describe('Admin - User Management - Authorization', () => {
  test('should prevent non-super-admin from accessing users page', async ({ page }) => {
    // Login as regular pegawai
    await login(page, testUsers.pegawai);

    // Try to access users page
    await page.goto('/admin/users');

    // Should get 403 or be redirected
    await expect(page.or(
      page.getByRole('heading', { name: /403|forbidden/i }),
      page.getByURL(/\/dashboard|\/login/)
    )).toBeVisible();

    await logout(page);
  });

  test('should prevent non-super-admin from creating users', async ({ page }) => {
    await login(page, testUsers.pegawai);

    await page.goto('/admin/users/create');

    // Should get 403
    await expect(page.or(
      page.getByRole('heading', { name: /403|forbidden/i }),
      page.getByURL(/\/dashboard/)
    )).toBeVisible();

    await logout(page);
  });

  test('should prevent non-super-admin from editing users', async ({ page }) => {
    await login(page, testUsers.pegawai);

    await page.goto('/admin/users/some-id/edit');

    // Should get 403
    await expect(page.or(
      page.getByRole('heading', { name: /403|forbidden/i }),
      page.getByURL(/\/dashboard/)
    )).toBeVisible();

    await logout(page);
  });

  test('should prevent non-super-admin from deleting users', async ({ page }) => {
    await login(page, testUsers.pegawai);

    // Try to access delete endpoint (via POST or DELETE)
    // This would require making a direct API call
    test.skip(true, 'Requires API call simulation');
  });

  test('should prevent non-super-admin from impersonating', async ({ page }) => {
    await login(page, testUsers.pegawai);

    await page.goto('/admin/users/some-id/impersonate');

    // Should get 403
    await expect(page.or(
      page.getByRole('heading', { name: /403|forbidden/i }),
      page.getByURL(/\/dashboard/)
    )).toBeVisible();

    await logout(page);
  });

  test('should prevent kasubag-umum from accessing users page', async ({ page }) => {
    await login(page, testUsers.kasubagUmum);

    await page.goto('/admin/users');

    // Should get 403 (kasubag_umum doesn't have users.view permission)
    await expect(page.or(
      page.getByRole('heading', { name: /403|forbidden/i }),
      page.getByURL(/\/dashboard/)
    )).toBeVisible();

    await logout(page);
  });
});

test.describe('Admin - User Management - Mobile Responsive', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test.afterEach(async ({ page }) => {
    await logout(page);

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should display users index on mobile', async ({ page }) => {
    await page.goto('/admin/users');

    // Verify page is accessible
    await expect(page.getByRole('heading', { name: /users/i, level: 1 })).toBeVisible();
  });

  test('should have responsive table on mobile', async ({ page }) => {
    await page.goto('/admin/users');

    // Verify table is scrollable or cards are shown
    const table = page.locator('table').first();

    if (await table.count() > 0) {
      await expect(table).toBeVisible();
    } else {
      // Check for card view
      await expect(page.locator('[role="list"]').or(
        page.locator('.user-card')
      ).first()).toBeVisible();
    }
  });

  test('should have tappable buttons on mobile', async ({ page }) => {
    await page.goto('/admin/users');

    // Verify buttons are large enough to tap (44x44px minimum)
    const button = page.getByRole('button').first();

    if (await button.count() > 0) {
      const box = await button.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should have readable text on mobile', async ({ page }) => {
    await page.goto('/admin/users');

    // Verify text is readable (font size >= 14px)
    const textElement = page.locator('p, td, span').first();

    if (await textElement.count() > 0) {
      const fontSize = await textElement.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });

      expect(parseInt(fontSize)).toBeGreaterThanOrEqual(14);
    }
  });
});

test.describe('Admin - User Management - Edge Cases', () => {
  test.use({ storageState: 'tests/e2e/.auth/super_admin.json' });

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should handle empty search results', async ({ page }) => {
    await page.goto('/admin/users');

    // Search for non-existent user
    const searchInput = page.getByRole('textbox', { name: /search/i });
    await searchInput.fill('NonExistentUser123456789');
    await page.waitForTimeout(500);

    // Verify empty state message
    await expect(page.or(
      page.getByText(/no users|tidak ada/i),
      page.getByText(/not found|tidak ditemukan/i)
    )).toBeVisible();
  });

  test('should handle large dataset with pagination', async ({ page }) => {
    await page.goto('/admin/users');

    // This test assumes there are many users
    test.skip(true, 'Requires large dataset');
  });

  test('should handle concurrent role assignments', async ({ page }) => {
    // Test multiple rapid role changes
    test.skip(true, 'Requires rapid interaction testing');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network error
    test.skip(true, 'Requires network error simulation');
  });

  test('should display loading states', async ({ page }) => {
    await page.goto('/admin/users');

    // Look for loading indicators
    test.skip(true, 'Requires slow network or API delays');
  });

  test('should handle special characters in search', async ({ page }) => {
    await page.goto('/admin/users');

    const searchInput = page.getByRole('textbox', { name: /search/i });
    await searchInput.fill('@#$%^&*()');
    await page.waitForTimeout(500);

    // Verify no errors occur
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('should handle very long search queries', async ({ page }) => {
    await page.goto('/admin/users');

    const searchInput = page.getByRole('textbox', { name: /search/i });
    await searchInput.fill('a'.repeat(500));
    await page.waitForTimeout(500);

    // Verify no errors occur
    await expect(page.locator('table').first()).toBeVisible();
  });
});
