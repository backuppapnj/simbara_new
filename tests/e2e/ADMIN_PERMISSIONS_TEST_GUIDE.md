# Admin Permissions E2E Tests - Implementation Guide

## Overview
This document provides guidance for implementing and running the comprehensive E2E tests for the Admin Permissions feature in the Asset & Persediaan Management System.

## Test File Location
`/home/moohard/dev/work/asset-persediaan-system/tests/e2e/admin-permissions.spec.ts`

## Prerequisites

### Missing Frontend Component
**IMPORTANT**: The tests expect a Permissions index page that currently does NOT exist.

**Required Implementation:**
```
resources/js/pages/Admin/Permissions/Index.tsx
```

The backend is complete:
- Controller: `app/Http/Controllers/Admin/PermissionController.php`
- Routes: `/admin/permissions` (GET, POST, PUT, DELETE)
- Validation: `app/Http/Requests/StorePermissionRequest.php`
- Modal components: Created in `resources/js/components/Admin/Permissions/`

**Backend Route Details:**
```php
GET|HEAD  admin/permissions           - Index (list all permissions)
POST      admin/permissions           - Store (create permission)
PUT       admin/permissions/{id}      - Update (edit permission)
DELETE    admin/permissions/{id}      - Destroy (delete permission)
```

### Existing Components
The following components already exist and are used by the tests:
- `resources/js/components/Admin/Permissions/CreatePermissionModal.tsx`
- `resources/js/components/Admin/Permissions/EditPermissionModal.tsx`
- `resources/js/components/Admin/Permissions/DeletePermissionConfirmation.tsx`
- `resources/js/services/permissionService.ts`

## Test Coverage Summary

### Total Tests: 67 tests across 11 test suites

#### 1. Permissions Index Page (7 tests)
- Display permissions index page
- Display permissions grouped by module
- Display permission list with correct structure
- Display permission name and module
- Have create permission button
- Allow searching permissions
- Filter permissions by module

#### 2. Create Permission (9 tests)
- Open create permission modal
- Create permission with valid data
- Create permission with custom module
- Validate required permission name
- Validate required module
- Validate permission name format
- Prevent duplicate permission names
- Allow optional description
- Validate description max length

#### 3. Update Permission (6 tests)
- Open edit permission modal
- Update permission description
- Update permission name with validation
- Prevent editing module after creation
- Validate permission name on update
- Show warning about code impact when renaming

#### 4. Delete Permission (4 tests)
- Show delete confirmation dialog
- Delete orphaned permission
- Warn when deleting assigned permission
- Prevent deleting critical permissions

#### 5. Permission Display & Organization (4 tests)
- Display permissions in correct format
- Group permissions by module
- Show permission count per module
- Display permission description

#### 6. Permission Search & Filter (4 tests)
- Search permissions by name
- Search permissions by description
- Clear search and show all permissions
- Filter by multiple modules

#### 7. Permission Sync with Roles (2 tests)
- Show which roles have permission
- Display permission usage statistics

#### 8. Bulk Actions (3 tests)
- Select multiple permissions
- Allow bulk module assignment
- Allow bulk delete with confirmation

#### 9. Permission Details View (3 tests)
- Show permission detail modal
- Display roles using permission
- Show permission metadata

#### 10. API Endpoint Tests (6 tests)
- Return permissions via API
- Create permission via API
- Validate permission format via API
- Prevent duplicate permission via API
- Update permission via API
- Delete permission via API

#### 11. Unauthorized Access (3 tests)
- Prevent non-super-admin from accessing permissions
- Prevent API access for non-super-admin
- Prevent permission creation via API

#### 12. Edge Cases (6 tests)
- Handle very long permission names
- Handle special characters in description
- Handle concurrent permission creation
- Handle rapid delete operations
- Display empty state when no permissions exist
- Handle network errors gracefully

#### 13. Navigation (3 tests)
- Navigate from roles to permissions
- Navigate to roles from permissions
- Update browser history correctly

#### 14. Accessibility (4 tests)
- Have proper ARIA labels
- Support keyboard navigation
- Have proper heading hierarchy
- Have sufficient color contrast

## Running the Tests

### Run All Tests
```bash
npx playwright test admin-permissions.spec.ts
```

### Run Specific Test Suite
```bash
npx playwright test admin-permissions.spec.ts --grep "Create Permission"
```

### Run with UI Mode
```bash
npx playwright test admin-permissions.spec.ts --ui
```

### Run with Debugging
```bash
npx playwright test admin-permissions.spec.ts --debug
```

### Run Specific Test
```bash
npx playwright test admin-permissions.spec.ts --grep "should create permission with valid data"
```

### Run with Specific Browser
```bash
npx playwright test admin-permissions.spec.ts --project=chromium
```

## Expected Permission Format

### Naming Convention
**Format:** `module.action`

**Examples:**
- `assets.view`
- `atk.create`
- `office_requests.approve`
- `stock_opnames.edit`

### Validation Rules
- Must start with lowercase letter
- Can contain lowercase letters, numbers, and underscores
- Must have exactly one dot (.) separator
- Format: `/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/`

### Common Modules
- `assets` - Asset management
- `atk_requests` - ATK request management
- `office_mutations` - Office supply mutations
- `office_requests` - Office supply requests
- `office_usages` - Office supply usage tracking
- `stock_opnames` - Stock opname management
- `users` - User management
- `roles` - Role management
- `permissions` - Permission management
- `reports` - Report generation
- `settings` - System settings
- `notifications` - Notification management

## Test Data

### Test Users (from tests/e2e/support/test-users.ts)
```typescript
{
  superAdmin: {
    email: 'admin@pa-penajam.go.id',
    password: 'password'
  },
  operatorPersediaan: {
    email: 'operator_atk@demo.com',
    password: 'password'
  },
  kasubagUmum: {
    email: 'kasubag@demo.com',
    password: 'password'
  },
  kpa: {
    email: 'kpa@demo.com',
    password: 'password'
  },
  pegawai: {
    email: 'pegawai@demo.com',
    password: 'password'
  }
}
```

## Implementation Checklist

### Required for Tests to Pass

#### Frontend Implementation
- [ ] Create `resources/js/pages/Admin/Permissions/Index.tsx`
  - Display permissions grouped by module
  - Show permission details (name, description, module)
  - Implement search functionality
  - Implement module filtering
  - Add "Create Permission" button
  - Add edit/delete buttons for each permission
  - Show permission usage (which roles use it)

#### UI Components
- [ ] Permission list/cards display
- [ ] Module grouping sections
- [ ] Search input field
- [ ] Module filter dropdown
- [ ] Create permission modal (already exists)
- [ ] Edit permission modal (already exists)
- [ ] Delete confirmation dialog (already exists)
- [ ] Permission detail view/modal

#### Features
- [ ] Permission search by name and description
- [ ] Module filtering
- [ ] Permission CRUD operations
- [ ] Validation error display
- [ ] Success message display
- [ ] Permission usage statistics
- [ ] Role assignment display
- [ ] Bulk actions (optional)

## Test Scenarios Explained

### 1. Index Page Tests
Verify the permissions list page loads correctly and displays:
- Page title and headings
- Permissions grouped by module
- Permission names in correct format
- Create button
- Search and filter controls

### 2. Create Permission Tests
Verify permission creation:
- Modal opens correctly
- Form validation (required fields, format)
- Duplicate prevention
- Success/error messages
- Custom module support

### 3. Update Permission Tests
Verify permission editing:
- Modal pre-fills with existing data
- Module field is read-only
- Name validation applies
- Description can be updated
- Changes persist

### 4. Delete Permission Tests
Verify permission deletion:
- Confirmation dialog shows
- Warnings for assigned permissions
- Critical permissions protected
- Orphaned permissions can be deleted

### 5. API Tests
Verify backend endpoints:
- JSON responses work correctly
- Validation errors return proper format
- CRUD operations work via API
- Authorization is enforced

## Known Issues & Workarounds

### Missing Permissions Index Page
**Issue:** The `resources/js/pages/Admin/Permissions/Index.tsx` component does not exist.

**Workaround:**
1. Tests will fail until the component is created
2. API tests will pass (they test endpoints directly)
3. Some tests use conditional checks (`if (await element.count() > 0)`) to handle missing features

**Solution:**
Create the Permissions index page following the pattern of:
- `resources/js/pages/Admin/Roles/Index.tsx`
- Use the existing modal components
- Implement grouping by module as shown in the controller

### Permission Format
**Issue:** Backend expects `module.action` format but some permissions might use different formats.

**Validation:**
- Backend regex: `/^[a-z][a-z0-9_]*\.[a-z0-9_]*$/`
- Examples in seeder: `assets.view`, `atk.create`, `roles.manage`

## Troubleshooting

### Test Failures

#### "Element not found" Errors
- Check if the Permissions index page exists
- Verify selectors match your implementation
- Use `--debug` flag to see test execution

#### Authorization Failures
- Ensure super_admin user exists
- Check authentication state
- Verify session storage

#### Validation Errors
- Check permission format matches regex
- Verify module names are valid
- Ensure unique permission names

### Debugging Tips

1. **Run with UI mode:**
   ```bash
   npx playwright test admin-permissions.spec.ts --ui
   ```

2. **Run with debugging:**
   ```bash
   npx playwright test admin-permissions.spec.ts --debug
   ```

3. **Run specific test:**
   ```bash
   npx playwright test admin-permissions.spec.ts --grep "test name"
   ```

4. **Check screenshots:**
   Screenshots are saved on failure to `test-results/`

5. **View traces:**
   ```bash
   npx playwright show-trace test-results/[test-name]/trace.zip
   ```

## Best Practices

### When Implementing the Permissions Page

1. **Follow Existing Patterns**
   - Use the same layout structure as Roles/Index.tsx
   - Reuse existing modal components
   - Match the styling and UI patterns

2. **Implement Proper Accessibility**
   - Use ARIA labels
   - Support keyboard navigation
   - Ensure proper heading hierarchy

3. **Handle Edge Cases**
   - Empty state (no permissions)
   - Network errors
   - Concurrent operations
   - Permission in use by roles

4. **Provide Good UX**
   - Clear success/error messages
   - Loading states for operations
   - Confirmation for destructive actions
   - Search and filter capabilities

## Next Steps

1. **Implement the Frontend Page**
   - Create `resources/js/pages/Admin/Permissions/Index.tsx`
   - Use the existing modal components
   - Implement the features described in this guide

2. **Run the Tests**
   - Execute the full test suite
   - Fix any failing tests
   - Ensure all scenarios pass

3. **Review Results**
   - Check test coverage
   - Verify all features work
   - Test manually in the browser

4. **Deploy**
   - Ensure tests pass in CI/CD
   - Monitor for any issues
   - Gather user feedback

## Additional Resources

### Laravel Boost Documentation
- Search docs: `mcp-cli call laravel-boost/search-docs`
- Get routes: `mcp-cli call laravel-boost/list-routes`

### Playwright Documentation
- Official docs: https://playwright.dev
- Best practices: https://playwright.dev/docs/best-practices

### Project Documentation
- Test README: `tests/e2e/README.md`
- Project guidelines: `CLAUDE.md`

---

**Last Updated:** 2026-01-11
**Test Version:** 1.0.0
**Maintainer:** E2E Testing Team
