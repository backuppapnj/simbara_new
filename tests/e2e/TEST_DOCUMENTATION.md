# E2E Test Documentation
## Sistem Manajemen Aset dan Persediaan - PA Penajam

---

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [New Test Files](#new-test-files)
4. [Test Data & Fixtures](#test-data--fixtures)
5. [Running Tests](#running-tests)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This E2E test suite uses **Playwright** to test the Asset/Persediaan Management System built with Laravel 12, Inertia v2, and React 19. The tests cover critical user journeys, security features, admin functionality, and mobile/responsive behavior.

### Test Coverage Summary

| Category | Test Files | Coverage |
|----------|------------|----------|
| **Authentication** | 3 files | Login, 2FA, Password Reset, Profile, Password |
| **Admin Features** | 2 files | Roles, WhatsApp Settings |
| **Core CRUD** | 2 files | Items, Office Supplies |
| **Reports** | 1 file | ATK Reports, PDF/Excel exports |
| **RBAC/Security** | 1 file | Permissions, Role-based access |
| **Mobile** | 1 file | Responsive, PWA, Offline mode |
| **Existing** | 8 files | Assets, Purchases, Stock Opname, etc. |
| **TOTAL** | **18 files** | **Comprehensive coverage** |

---

## Test Structure

```
tests/e2e/
├── GAP_ANALYSIS.md           # Detailed coverage analysis
├── TEST_DOCUMENTATION.md      # This file
├── playwright.config.ts       # Playwright configuration
├── support/
│   ├── auth.ts               # Login/logout helpers
│   ├── test-users.ts         # Test user credentials
│   └── global-setup.ts       # Global test setup
├── .auth/
│   └── super_admin.json      # Auth state for super admin
│
├── auth.spec.ts                      # [Existing] Login, logout
├── assets.spec.ts                    # [Existing] Asset list, search
├── purchases-flow.spec.ts            # [Existing] Purchase workflow
├── stock-opname.spec.ts              # [Existing] Stock opname workflow
├── atk-request-workflow.spec.ts      # [Existing] ATK request flow
├── security.spec.ts                  # [Existing] Security checks
├── performance.spec.ts               # [Existing] Performance metrics
├── global-navigation.spec.ts         # [Existing] Navigation tests
│
├── settings-profile.spec.ts          # [NEW] Profile management
├── settings-password.spec.ts         # [NEW] Password change
├── settings-two-factor.spec.ts       # [NEW] 2FA setup and login
├── admin-roles.spec.ts               # [NEW] Role management
├── admin-whatsapp.spec.ts            # [NEW] WhatsApp settings
├── items-crud.spec.ts                # [NEW] Items CRUD
├── office-supplies.spec.ts           # [NEW] Office supplies
├── reports.spec.ts                   # [NEW] ATK reports
├── permissions-rbac.spec.ts          # [NEW] RBAC permissions
└── mobile-responsive.spec.ts         # [NEW] Mobile/responsive
```

---

## New Test Files

### 1. settings-profile.spec.ts
**Purpose:** Test user profile management

**Test Scenarios:**
- Display profile page with current information
- Update user name
- Update user email
- Validation for empty/invalid inputs
- Success messages
- Delete account flow
- Form autocomplete attributes
- Concurrent updates

**Key Routes:**
- `GET/PATCH /settings/profile`
- `DELETE /settings/profile`

**Permissions Required:** Authenticated user

---

### 2. settings-password.spec.ts
**Purpose:** Test password change functionality

**Test Scenarios:**
- Display password change page
- Change password with correct current password
- Error for wrong current password
- Password mismatch validation
- Same password validation
- Password strength requirements
- Rate limiting (6 attempts per minute)
- Input type validation (password type)
- Special characters handling

**Key Routes:**
- `GET/PUT /settings/password`
- Middleware: `throttle:6,1`

**Permissions Required:** Authenticated user

---

### 3. settings-two-factor.spec.ts
**Purpose:** Test two-factor authentication

**Test Scenarios:**
- Display 2FA settings page
- Enable 2FA
- Generate QR code
- Display recovery codes
- Verify TOTP code
- Invalid code error
- Disable 2FA
- Regenerate recovery codes
- Login with 2FA enabled
- Use recovery code
- Password confirmation to disable

**Key Routes:**
- `GET /settings/two-factor`
- `POST /two-factor-challenge`
- `POST /two-factor-recovery-code`

**Permissions Required:** Authenticated user, Fortify 2FA enabled

---

### 4. admin-roles.spec.ts
**Purpose:** Test role and permission management

**Test Scenarios:**
- Display roles index
- Display all system roles (Super Admin, KPA, Kasubag, etc.)
- View role detail (users tab)
- View role detail (permissions tab)
- Add users to role
- Remove users from role
- Grant permissions to role
- Revoke permissions from role
- Tab switching
- Search/filter users and permissions

**Key Routes:**
- `GET /admin/roles`
- `GET /admin/roles/{role}?tab=users|permissions`
- `PUT /admin/roles/{role}/users`
- `PUT /admin/roles/{role}/permissions`

**Permissions Required:** `permission:roles.manage`

---

### 5. admin-whatsapp.spec.ts
**Purpose:** Test WhatsApp notification settings

**Test Scenarios:**
- Display WhatsApp settings page
- Update API token
- Update sender number
- Validate token and number format
- Send test WhatsApp message
- Connection status indicator
- Mask API token for security
- Persist settings after reload
- Integrate with Fonnte service

**Key Routes:**
- `GET /admin/whatsapp-settings`
- `POST /admin/whatsapp-settings`
- `POST /admin/whatsapp-settings/test-send`

**Permissions Required:** `permission:settings.whatsapp`

---

### 6. items-crud.spec.ts
**Purpose:** Test ATK items CRUD operations

**Test Scenarios:**
- Display items list
- Create new item
- Validation for invalid input
- Update existing item
- Delete item with confirmation
- Search items
- Filter by category
- View item mutations/history
- Pagination
- Export to Excel/CSV
- Low stock indicators
- Bulk delete
- Unauthorized access prevention

**Key Routes:**
- `GET /items`
- `POST /items` (create)
- `PUT /items/{item}` (update)
- `DELETE /items/{item}` (delete)
- `GET /items/{item}/mutations`

**Permissions Required:**
- View: `permission:atk.view`
- Create: `permission:atk.items.create`
- Edit: `permission:atk.items.edit`
- Delete: `permission:atk.items.delete`

---

### 7. office-supplies.spec.ts
**Purpose:** Test office supplies management

**Test Scenarios:**
- Display supplies list
- Create new supply
- Update quantity
- Delete supply
- View mutations history
- Log usage
- Quick deduct from stock
- Validate usage doesn't exceed stock
- Create office request
- View purchase details

**Key Routes:**
- `GET/POST/PUT/DELETE /office-supplies`
- `GET/POST /office-usages`
- `POST /office-mutations/quick-deduct`
- `GET/POST /office-requests`
- `GET /office-purchases/{id}`

**Permissions Required:** Various `permission:office.*` permissions

---

### 8. reports.spec.ts
**Purpose:** Test ATK report generation

**Test Scenarios:**
- Stock card report
- Stock card PDF export
- Date filters
- Monthly report
- Monthly PDF/Excel export
- Requests report with status filter
- Purchases report
- Distributions report
- Low stock report
- Print option
- Email report option

**Key Routes:**
- `GET /atk-reports/stock-card/{item}`
- `GET /atk-reports/stock-card/{item}/pdf`
- `GET /atk-reports/monthly`
- `GET /atk-reports/monthly/pdf`
- `GET /atk-reports/monthly/excel`
- `GET /atk-reports/requests`
- `GET /atk-reports/purchases`
- `GET /atk-reports/distributions`
- `GET /atk-reports/low-stock`

**Permissions Required:** `permission:atk.reports`

---

### 9. permissions-rbac.spec.ts
**Purpose:** Test role-based access control

**Test Scenarios:**
- Super Admin can access all pages
- Operator ATK can access ATK features only
- Kasubag Umum can approve ATK requests
- KPA has limited access
- Pegawai has minimal access
- 403 forbidden pages display
- Navigation menu visibility based on role
- Direct URL access prevention
- API endpoint protection

**Test Users:**
- `super_admin`: Full access
- `operator_atk`: ATK features
- `kasubag_umum`: Approvals
- `kpa`: Limited access
- `pegawai`: Minimal access

**Key Routes:** All routes with permission middleware

---

### 10. mobile-responsive.spec.ts
**Purpose:** Test mobile and responsive behavior

**Test Scenarios:**
- Bottom navigation on mobile (375x667 viewport)
- Hamburger menu on mobile
- PWA install prompt
- PWA manifest
- Service worker registration
- Pull to refresh
- Tablet layout (768x1024 viewport)
- Desktop layout (1920x1080 viewport)
- Touch interactions
- Offline mode detection
- Mobile performance metrics

**Components Tested:**
- `BottomNav.tsx`
- `InstallButton.tsx`
- `InstallPrompt.tsx`
- `PullToRefresh.tsx`
- `OfflineAlert.tsx`

---

## Test Data & Fixtures

### Test Users (tests/e2e/support/test-users.ts)

```typescript
export const testUsers = {
  superAdmin: {
    label: 'super_admin',
    email: 'admin@pa-penajam.go.id',
    password: 'password',
  },
  operatorPersediaan: {
    label: 'operator_persediaan',
    email: 'operator_atk@demo.com',
    password: 'password',
  },
  kasubagUmum: {
    label: 'kasubag_umum',
    email: 'kasubag@demo.com',
    password: 'password',
  },
  kpa: {
    label: 'kpa',
    email: 'kpa@demo.com',
    password: 'password',
  },
  pegawai: {
    label: 'pegawai',
    email: 'pegawai@demo.com',
    password: 'password',
  },
};
```

### Auth Helpers (tests/e2e/support/auth.ts)

```typescript
// Login with test user
await login(page, testUsers.superAdmin);

// Logout
await logout(page);
```

---

## Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test settings-profile.spec.ts
```

### Run Tests by Pattern

```bash
# Run all settings tests
npx playwright test settings-

# Run all admin tests
npx playwright test admin-

# Run all mobile tests
npx playwright test mobile-
```

### Run Tests in UI Mode

```bash
npx playwright test --ui
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### Run Tests on Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Tests on Mobile Viewport

```bash
npx playwright test --project="Mobile Chrome"
```

### View Test Report

```bash
npx playwright show-report
```

---

## Best Practices

### 1. Test Organization

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.appropriateUser);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should do something specific', async ({ page }) => {
    // Arrange
    await page.goto('/route');

    // Act
    await page.click('selector');

    // Assert
    await expect(page).toHaveURL('/expected');
  });
});
```

### 2. Selector Strategy

**Prefer (in order):**
1. `data-testid` attributes: `page.locator('[data-test="submit-button"]')`
2. ARIA roles: `page.getByRole('button', { name: 'Submit' })`
3. Accessible labels: `page.getByText('Submit')`
4. Form inputs: `page.getByRole('textbox', { name: 'Email' })`

**Avoid:**
- CSS classes (unstable): `page.locator('.btn-primary')`
- Dynamic IDs: `page.locator('#btn-123')`
- XPath (brittle): `page.locator('//button[@text="Submit"]')`

### 3. Waiting Strategy

**Use appropriate waits:**
- `await page.waitForURL('/expected')` - Wait for navigation
- `await expect(element).toBeVisible()` - Wait for element
- `await page.waitForLoadState('networkidle')` - Wait for network
- `await page.waitForTimeout(500)` - Only for debounces/animations

### 4. Error Handling

```typescript
// Handle optional elements gracefully
const optionalButton = page.getByRole('button', { name: 'Optional' });

if (await optionalButton.count() > 0) {
  await optionalButton.click();
}
```

### 5. Test Data Management

- Use unique data for each test (timestamps, random strings)
- Clean up test data after tests
- Restore original state when modifying data
- Use factory pattern for creating test entities

---

## Troubleshooting

### Tests Fail with "Target closed"

**Issue:** Browser closes before test completes

**Solution:**
- Increase timeout in `playwright.config.ts`
- Check for unhandled promises
- Ensure proper async/await usage

### Tests Fail to Find Elements

**Issue:** `Element not found` errors

**Solution:**
- Add `data-testid` attributes to components
- Use `waitForSelector` or `waitForTimeout`
- Check if element is in iframe or shadow DOM
- Verify element is not hidden by CSS

### Tests Pass Locally but Fail in CI

**Issue:** Environment differences

**Solution:**
- Use absolute URLs instead of relative
- Check for timezone differences
- Verify test data exists in CI environment
- Check browser versions in CI

### Tests Are Slow

**Issue:** Tests take too long

**Solution:**
- Run tests in parallel (already configured)
- Use `test.step()` to group actions
- Avoid unnecessary `waitForTimeout`
- Use `storageState` to skip repeated logins

### Flaky Tests

**Issue:** Tests intermittently fail

**Solution:**
- Add retries in config (already set to 2 in CI)
- Use explicit waits instead of implicit
- Check for race conditions
- Ensure test data is isolated

---

## Recommendations

### 1. Add More `data-testid` Attributes

Many components lack stable selectors. Add `data-testid` to:
- Form inputs: `data-testid="email-input"`
- Buttons: `data-testid="submit-button"`
- Navigation items: `data-testid="dashboard-link"`
- Table rows: `data-testid="item-row-{id}"`

### 2. Create Page Object Model

For complex flows, create page objects:

```typescript
// tests/e2e/pages/ItemsPage.ts
export class ItemsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/items');
  }

  async createItem(data: ItemData) {
    await this.page.getByRole('button', { name: 'Add' }).click();
    // ...
  }
}
```

### 3. Add Visual Regression Tests

Consider adding visual regression tests for:
- Dashboard layout
- Reports (PDF exports)
- Mobile layouts
- Dark mode

### 4. Set Performance Budgets

Add performance assertions:

```typescript
test('should load quickly', async ({ page }) => {
  const start = Date.now();
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  expect(Date.now() - start).toBeLessThan(3000);
});
```

### 5. Add API Testing

Test API endpoints directly:

```typescript
test('API endpoint returns correct data', async ({ request }) => {
  const response = await request.get('/api/items');
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data).toHaveLengthGreaterThan(0);
});
```

---

## Conclusion

This E2E test suite provides comprehensive coverage for the Asset/Persediaan Management System. The tests cover:

- ✅ Authentication & Security (Login, 2FA, Password)
- ✅ Admin Features (Roles, WhatsApp Settings)
- ✅ Core CRUD (Items, Office Supplies)
- ✅ Reports (Stock cards, Monthly, Exports)
- ✅ RBAC (Permissions by role)
- ✅ Mobile/Responsive (PWA, Touch, Offline)

Run tests regularly to ensure system reliability and catch regressions early.

---

**Generated:** 2025-01-11
**Framework:** Playwright
**Application:** Laravel 12 + Inertia v2 + React 19
