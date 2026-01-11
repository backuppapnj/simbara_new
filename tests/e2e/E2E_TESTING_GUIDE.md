# E2E Testing Guide
## Asset & Persediaan Management System

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Selector Strategies](#selector-strategies)
7. [Working with Inertia.js](#working-with-inertiajs)
8. [Test Data & Fixtures](#test-data--fixtures)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)
11. [Configuration](#configuration)

---

## Overview

This E2E test suite uses **Playwright** to test the Asset/Persediaan Management System built with:
- **Laravel 12** - Backend framework
- **Inertia.js v2** - SPA-like navigation without API endpoints
- **React 19** - Frontend library
- **Tailwind CSS v4** - Styling
- **SQLite** - E2E database (isolated from development)

### Why Playwright?

- **Cross-browser**: Chromium, Firefox, WebKit
- **Fast**: Parallel test execution by default
- **Reliable**: Auto-waiting for elements, network idle detection
- **Debugging**: Powerful UI mode, trace viewing, screenshots/videos
- **API Testing**: Can test backend endpoints directly

### Test Architecture

```
tests/e2e/
├── support/                    # Test helpers and utilities
│   ├── auth.ts                # Login/logout functions
│   ├── inertia.ts             # Inertia.js-specific helpers
│   ├── test-users.ts          # Test user credentials
│   ├── test-images.ts         # Image fixtures
│   ├── global-setup.ts        # Database setup, migrations
│   └── global-teardown.ts     # Database cleanup
├── fixtures/                   # Test data files
├── .auth/                      # Saved authentication states
├── *.spec.ts                  # Test files (organized by feature)
└── E2E_TESTING_GUIDE.md       # This file
```

---

## Prerequisites

### System Requirements

- **Node.js** v18+ (tested with v20)
- **PHP** 8.5.1
- **Composer** - PHP package manager
- **npm** or **yarn** - JavaScript package manager

### Initial Setup

```bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Environment Setup

The E2E tests use a separate environment to avoid affecting development data:

```bash
# Copy example environment file
cp .env.e2e.example .env.e2e

# Generate application key
php artisan key:generate --env=e2e --force

# Run migrations with seed data
php artisan migrate:fresh --seed --env=e2e

# Build frontend assets (if needed)
npm run build
```

---

## Quick Start

### Run All Tests

```bash
npx playwright test
```

This will:
1. Start the Laravel development server (`php artisan serve --env=e2e --port=8011`)
2. Run all E2E tests
3. Generate an HTML report

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

### View Test Report

```bash
npx playwright show-report
```

### Interactive UI Mode

```bash
npx playwright test --ui
```

This opens a graphical interface where you can:
- Run tests individually
- Inspect elements
- View network requests
- Debug in real-time

### Debug Mode

```bash
npx playwright test --debug
```

Opens browser with DevTools and pauses execution.

---

## Running Tests

### Standard Execution

```bash
# Run all tests
npx playwright test

# Run with specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Headless vs. Headed

```bash
# Headless (default, faster)
npx playwright test

# Headed (watch browser actions)
npx playwright test --headed
```

### Reporters

```bash
# HTML report (default)
npx playwright test --reporter=html

# JUnit XML (for CI/CD)
npx playwright test --reporter=junit

# Console output
npx playwright test --reporter=list

# Multiple reporters
npx playwright test --reporter=html,junit
```

### Parallel Execution

**Note:** Due to SQLite limitations, tests run sequentially:

```bash
# Current config: workers: 1 (forced)
# If using MySQL/PostgreSQL, you can enable parallel execution:
npx playwright test --workers=4
```

### Environment Variables

```bash
# Override base URL
E2E_BASE_URL=http://localhost:3000 npx playwright test

# Override web server command
E2E_WEB_COMMAND="php artisan serve --port=3000" npx playwright test

# CI mode (enables retries)
CI=true npx playwright test
```

---

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await login(page, testUsers.superAdmin);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
    await logout(page);
  });

  test('should do something specific', async ({ page }) => {
    // Arrange: Set up test conditions
    await page.goto('/some-page');

    // Act: Perform the action being tested
    await page.getByRole('button', { name: 'Submit' }).click();

    // Assert: Verify expected outcome
    await expect(page).toHaveURL('/success');
    await expect(page.getByText('Success!')).toBeVisible();
  });
});
```

### Test Organization

Group related tests using `test.describe()`:

```typescript
test.describe('User Profile', () => {
  test.describe('Update Profile', () => {
    test('should update name', async ({ page }) => {
      // Test updating name
    });

    test('should update email', async ({ page }) => {
      // Test updating email
    });
  });

  test.describe('Delete Account', () => {
    test('should delete account', async ({ page }) => {
      // Test account deletion
    });
  });
});
```

### Test Steps

Use `test.step()` to group actions:

```typescript
test('should complete purchase workflow', async ({ page }) => {
  await test.step('Navigate to purchase page', async () => {
    await page.goto('/purchases');
  });

  await test.step('Create new purchase', async () => {
    await page.getByRole('button', { name: 'Create' }).click();
    // Fill form, submit
  });

  await test.step('Verify purchase created', async () => {
    await expect(page.getByText('Purchase created')).toBeVisible();
  });
});
```

### Test Annotations

```typescript
// Skip test temporarily
test.skip('should do something', async ({ page }) => {
  // This test will be skipped
});

// Only run this test
test.only('should do something', async ({ page }) => {
  // Only this test will run
});

// Mark as slow (extends timeout)
test.slow('should do something', async ({ page }) => {
  // This test gets 3x timeout
});

// Add custom timeout
test('should do something', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // Test code
});
```

---

## Selector Strategies

### Priority Order (Best to Worst)

#### 1. data-test Attributes (RECOMMENDED)

**Best choice:** Stable, explicit, designed for testing.

```typescript
// In React component
<button data-test="submit-button">Submit</button>

// In test
await page.locator('[data-test="submit-button"]').click();
```

**Naming Convention:**
- Use kebab-case
- Format: `{feature}-{element}-{type}`
- Examples:
  - `submit-button` (button)
  - `email-input` (input)
  - `user-menu` (container)
  - `delete-confirmation-dialog` (dialog)

#### 2. ARIA Roles

**Good choice:** Accessible, semantic.

```typescript
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
await page.getByRole('link', { name: 'Dashboard' }).click();
```

**Common roles:**
- `button`, `link`, `textbox`, `checkbox`, `radio`
- `heading`, `list`, `listitem`, `table`
- `dialog`, `alert`, `status`

#### 3. Text Content

**Acceptable:** Can be fragile with i18n.

```typescript
await page.getByText('Submit').click();
await page.getByText(/submit/i).click(); // Case-insensitive regex
```

#### 4. Form Labels

**Good for forms:**

```typescript
await page.getByLabel('Email').fill('user@example.com');
await page.getByPlaceholder('Search').fill('query');
```

#### 5. CSS Selectors (USE WITH CAUTION)

**Fragile:** Breaks with design changes.

```typescript
// Better (class names from Tailwind are more stable)
await page.locator('.btn-primary').click();

// Avoid: Complex selectors
await page.locator('div > div > button').click();
```

#### 6. Test ID (Alternative to data-test)

```typescript
// In React component
<button-testid="submit-button">Submit</button>

// In test
await page.getByTestId('submit-button').click();
```

### Selectors to Avoid

```typescript
// ❌ Dynamic IDs
await page.locator('#btn-12345').click();

// ❌ XPath (brittle)
await page.locator('//button[@text="Submit"]').click();

// ❌ Complex CSS
await page.locator('div.container > div.row > button.btn').click();
```

### Filtering Locators

```typescript
// Get by role, filter by text
await page.getByRole('button')
  .filter({ hasText: 'Submit' })
  .click();

// Get by text, filter by role
await page.getByText('Submit')
  .filter({ hasRole: 'button' })
  .click();

// Get multiple, pick specific
await page.getByRole('listitem')
  .nth(2)
  .click();
```

---

## Working with Inertia.js

### The Challenge

Inertia.js doesn't use full page reloads. Navigation happens via XHR/fetch, making traditional `waitForLoadState('load')` unreliable.

### Solution: Custom Inertia Helpers

We've created custom helpers in `tests/e2e/support/inertia.ts`:

#### waitForInertiaPage

Wait for Inertia page to complete loading:

```typescript
import { waitForInertiaPage } from './support/inertia';

// Basic usage
await page.goto('/dashboard');
await waitForInertiaPage(page);

// Wait for specific URL
await page.getByRole('link', { name: 'Profile' }).click();
await waitForInertiaPage(page, { url: /\/profile/ });

// Custom timeout
await waitForInertiaPage(page, { timeout: 15000 });
```

#### waitForInertiaFormSubmit

Wait for form submission, navigation, and success message:

```typescript
import { waitForInertiaFormSubmit } from './support/inertia';

// Submit form
await page.getByRole('button', { name: 'Save' }).click();

// Wait for completion
await waitForInertiaFormSubmit(page, {
  successMessage: /saved successfully/i,
  targetUrl: /\/dashboard/,
});
```

#### waitForInertiaDeferredProps

Wait for Inertia v2 deferred props:

```typescript
import { waitForInertiaDeferredProps } from './support/inertia';

// Wait for deferred prop to load
await page.goto('/dashboard');
await waitForInertiaDeferredProps(page, '[data-test="user-stats"]');
```

### Manual Inertia Waiting

If helpers don't fit your needs:

```typescript
// Wait for DOM content loaded
await page.waitForLoadState('domcontentloaded');

// Wait for specific URL
await page.waitForURL(/\/dashboard/);

// Wait for element
await expect(page.getByText('Dashboard')).toBeVisible();

// Small delay for React rendering (use sparingly)
await page.waitForTimeout(100);
```

### What to Avoid

```typescript
// ❌ Don't use networkidle (too slow)
await page.waitForLoadState('networkidle');

// ❌ Don't use load (Inertia doesn't trigger it)
await page.waitForLoadState('load');

// ✅ Use domcontentloaded instead
await page.waitForLoadState('domcontentloaded');
```

---

## Test Data & Fixtures

### Test Users

Defined in `tests/e2e/support/test-users.ts`:

```typescript
import { testUsers } from './support/test-users';

// Available users
testUsers.superAdmin      // Full access
testUsers.operatorPersediaan  // ATK features
testUsers.kasubagUmum     // Approvals
testUsers.kpa             // Limited access
testUsers.pegawai         // Minimal access
```

### Authentication Helpers

```typescript
import { login, logout } from './support/auth';

// Login with test user
await login(page, testUsers.superAdmin);

// Logout
await logout(page);
```

### Saved Authentication State

For faster tests, save and reuse auth state:

```typescript
// Save auth state (in auth.setup.ts)
await page.context().storageState({ path: '.auth/super_admin.json' });

// Use saved state (in playwright.config.ts)
use: {
  storageState: '.auth/super_admin.json',
}
```

### Test Data Management

#### Use Unique Data

```typescript
// Use timestamp for uniqueness
const timestamp = Date.now();
const itemName = `Test Item ${timestamp}`;

// Use random strings
const randomId = Math.random().toString(36).substring(7);
```

#### Clean Up Test Data

```typescript
test.afterEach(async ({ page }) => {
  // Restore original state
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Reset' }).click();
});
```

#### Use Factory Pattern

```typescript
// Define a factory function
async function createItem(page: Page, data: Partial<ItemData> = {}) {
  const defaults = {
    name: `Test Item ${Date.now()}`,
    category: 'ATK',
    stock: 100,
  };

  const itemData = { ...defaults, ...data };

  await page.goto('/items/create');
  await page.getByLabel('Name').fill(itemData.name);
  await page.getByLabel('Category').selectOption(itemData.category);
  await page.getByLabel('Stock').fill(String(itemData.stock));
  await page.getByRole('button', { name: 'Create' }).click();
}

// Use in tests
test('should create item', async ({ page }) => {
  await createItem(page, { name: 'Custom Item' });
});
```

### Image Fixtures

For testing image uploads:

```typescript
import { getTestImagePath } from './support/test-images';

// Get test image path
const imagePath = getTestImagePath('sample.jpg');

// Upload image
await page.getByLabel('Photo').setInputFiles(imagePath);
```

---

## Best Practices

### 1. Test Independence

Each test should be able to run independently:

```typescript
// ❌ Bad: Tests depend on execution order
test('should create item', async ({ page }) => {
  // Creates item
});

test('should edit item', async ({ page }) => {
  // Assumes item exists from previous test
});

// ✅ Good: Each test is self-contained
test('should create and edit item', async ({ page }) => {
  // Create item
  // Edit item
  // Cleanup
});
```

### 2. Use Explicit Waits

```typescript
// ❌ Bad: Arbitrary timeout
await page.waitForTimeout(5000);

// ✅ Good: Wait for specific condition
await expect(page.getByText('Loaded')).toBeVisible();
```

### 3. Avoid Brittle Selectors

```typescript
// ❌ Bad: CSS class that might change
await page.locator('.btn-primary').click();

// ✅ Good: data-test attribute
await page.locator('[data-test="submit-button"]').click();
```

### 4. Test User Flows, Not Implementation

```typescript
// ❌ Bad: Tests implementation details
test('button has click handler', async ({ page }) => {
  const button = await page.$('button');
  expect(button).toBeTruthy();
});

// ✅ Good: Tests user behavior
test('user can submit form', async ({ page }) => {
  await page.goto('/form');
  await page.fill('#name', 'John');
  await page.click('[data-test="submit-button"]');
  await expect(page.getByText('Success')).toBeVisible();
});
```

### 5. Handle Asynchronous Operations

```typescript
// ❌ Bad: Don't wait for navigation
await page.click('a');
expect(page.url()).toContain('/dashboard');

// ✅ Good: Wait for navigation
await page.click('a');
await page.waitForURL(/\/dashboard/);
await expect(page).toHaveURL(/\/dashboard/);
```

### 6. Use Descriptive Test Names

```typescript
// ❌ Bad: Vague
test('test1', async ({ page }) => {
  // ...
});

// ✅ Good: Descriptive
test('should redirect unauthenticated users to login page', async ({ page }) => {
  // ...
});
```

### 7. Group Related Tests

```typescript
test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    // ...
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // ...
  });
});
```

### 8. Use Page Object Model for Complex Flows

```typescript
// tests/e2e/pages/ItemsPage.ts
export class ItemsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/items');
  }

  async createItem(data: ItemData) {
    await this.page.getByRole('button', { name: 'Create' }).click();
    await this.page.getByLabel('Name').fill(data.name);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async getItem(name: string) {
    return this.page.getByRole('row', { name: name });
  }
}

// In test
test('should create item', async ({ page }) => {
  const itemsPage = new ItemsPage(page);
  await itemsPage.goto();
  await itemsPage.createItem({ name: 'Test Item' });
  await expect(await itemsPage.getItem('Test Item')).toBeVisible();
});
```

### 9. Handle Optional Elements

```typescript
// Element might not exist
const optionalButton = page.getByRole('button', { name: 'Optional' });

if (await optionalButton.count() > 0) {
  await optionalButton.click();
}
```

### 10. Test Error Cases

```typescript
test.describe('Validation', () => {
  test('should show error for empty name', async ({ page }) => {
    await page.goto('/items/create');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Name is required')).toBeVisible();
  });

  test('should show error for duplicate name', async ({ page }) => {
    // Create item with existing name
    // Verify error message
  });
});
```

---

## Troubleshooting

### Tests Fail with "Target closed"

**Symptom:** Browser closes before test completes.

**Solutions:**
1. Increase timeout in `playwright.config.ts`:
   ```typescript
   use: {
     actionTimeout: 30000,
     navigationTimeout: 30000,
   }
   ```

2. Check for unhandled promises:
   ```typescript
   // ❌ Bad: Don't await
   page.click('button');

   // ✅ Good: Await the action
   await page.click('button');
   ```

3. Ensure proper async/await usage

### Tests Fail to Find Elements

**Symptom:** `Element not found` or `TimeoutError`.

**Solutions:**
1. Add `data-test` attributes to components
2. Use explicit waits:
   ```typescript
   await page.waitForSelector('[data-test="element"]');
   ```

3. Check if element is in iframe or shadow DOM
4. Verify element is not hidden by CSS
5. Increase timeout:
   ```typescript
   await expect(page.getByText('Text')).toBeVisible({ timeout: 30000 });
   ```

### Tests Pass Locally but Fail in CI

**Symptom:** Environment differences between local and CI.

**Solutions:**
1. Use absolute URLs instead of relative:
   ```typescript
   // ❌ Might fail
   await page.goto('/page');

   // ✅ More reliable
   await page.goto(`${process.env.E2E_BASE_URL}/page`);
   ```

2. Check for timezone differences:
   ```typescript
   // Use UTC for dates
   const date = new Date().toUTCString();
   ```

3. Verify test data exists in CI environment
4. Check browser versions in CI
5. Add retries in CI (already configured):
   ```typescript
   retries: process.env.CI ? 2 : 0,
   ```

### Tests Are Slow

**Symptom:** Tests take too long to run.

**Solutions:**
1. Run tests in parallel (if not using SQLite):
   ```bash
   npx playwright test --workers=4
   ```

2. Use `test.step()` to group actions:
   ```typescript
   await test.step('Navigate', async () => {
     await page.goto('/page');
   });
   ```

3. Avoid unnecessary `waitForTimeout`:
   ```typescript
   // ❌ Bad: Fixed delay
   await page.waitForTimeout(5000);

   // ✅ Good: Wait for condition
   await expect(page.getByText('Ready')).toBeVisible();
   ```

4. Use `storageState` to skip repeated logins:
   ```typescript
   // In playwright.config.ts
   projects: [
     {
       name: 'authenticated',
       use: {
         storageState: '.auth/user.json',
       },
     },
   ]
   ```

### Flaky Tests

**Symptom:** Tests intermittently fail.

**Solutions:**
1. Add retries in config (already set to 2 in CI):
   ```typescript
   retries: process.env.CI ? 2 : 0,
   ```

2. Use explicit waits instead of implicit:
   ```typescript
   // ❌ Implicit wait (brittle)
   await page.click('button');
   await expect(page.getByText('Success')).toBeVisible();

   // ✅ Explicit wait (reliable)
   await page.click('button');
   await page.waitForURL(/\/success/);
   await expect(page.getByText('Success')).toBeVisible();
   ```

3. Check for race conditions:
   ```typescript
   // Wait for all async operations
   await Promise.all([
     page.waitForNavigation(),
     page.click('a'),
   ]);
   ```

4. Ensure test data is isolated:
   ```typescript
   // Use unique data per test
   const itemName = `Item ${Date.now()}`;
   ```

### Database Issues

**Symptom:** SQLite database locked or corrupted.

**Solutions:**
1. Run tests sequentially (already configured):
   ```typescript
   workers: 1,
   ```

2. Add WAL checkpoint (already implemented):
   ```typescript
   // In global-setup.ts
   DB::statement('PRAGMA wal_checkpoint(TRUNCATE)');
   ```

3. Clean up database between runs:
   ```bash
   rm database/database.e2e.sqlite*
   ```

### Memory Leaks

**Symptom:** Tests slow down over time or crash.

**Solutions:**
1. Close pages after use:
   ```typescript
   test.afterEach(async ({ page }) => {
   await page.close();
   });
   ```

2. Use context isolation:
   ```typescript
   test('test1', async ({ browser }) => {
     const context = await browser.newContext();
     const page = await context.newPage();
     // Test code
     await context.close();
   });
   ```

3. Limit test data size
4. Run garbage collection (Node.js):
   ```bash
   node --expose-gc node_modules/.bin/playwright test
   ```

---

## Configuration

### Playwright Config

Located in `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Disable parallel execution (SQLite limitation)
  fullyParallel: false,
  workers: 1,

  // Fail on `test.only` in CI
  forbidOnly: !!process.env.CI,

  // Retries in CI
  retries: process.env.CI ? 2 : 0,

  // Reporters
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // Global setup/teardown
  globalSetup: './tests/e2e/support/global-setup.ts',
  globalTeardown: './tests/e2e/support/global-teardown.ts',

  // Default options
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:8011',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Web server (auto-started)
  webServer: {
    command: process.env.E2E_WEB_COMMAND ?? 'php artisan serve --env=e2e --port=8011',
    url: process.env.E2E_BASE_URL ?? 'http://localhost:8011',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },

  // Projects
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      testIgnore: /.*\.setup\.ts/,
      dependencies: ['setup'],
    },
  ],
});
```

### Key Configuration Decisions

#### Single Worker (`workers: 1`)

**Why:** SQLite database limitations
- SQLite doesn't support concurrent writes
- Multiple workers would cause "database is locked" errors
- If using MySQL/PostgreSQL, can increase to 4+ workers

#### Sequential Execution (`fullyParallel: false`)

**Why:** Test data isolation
- Prevents race conditions
- Ensures predictable test execution
- Makes debugging easier

#### Long Timeout (`webServer.timeout: 300_000`)

**Why:** Development server startup time
- Laravel takes time to boot
- Migrations can be slow
- Asset building adds delay

#### DOM Content Loaded (`domcontentloaded`)

**Why:** Inertia.js navigation
- Inertia doesn't trigger full page load
- `domcontentloaded` fires after Inertia navigation
- Avoids waiting for network idle (too slow)

### Environment Variables

```bash
# Base URL for tests
E2E_BASE_URL=http://localhost:8011

# Web server command
E2E_WEB_COMMAND="php artisan serve --env=e2e --port=8011"

# CI mode (enables retries)
CI=true
```

### Test Profiles

Create custom test profiles for different scenarios:

```typescript
// playwright.config.ts
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'Authenticated',
    use: {
      storageState: '.auth/super_admin.json',
    },
  },
],
```

---

## Conclusion

This E2E test suite provides comprehensive coverage for the Asset/Persediaan Management System. By following this guide, you can:

- Run tests efficiently
- Write reliable, maintainable tests
- Debug test failures effectively
- Extend test coverage for new features

### Key Takeaways

1. **Use data-test attributes** for stable selectors
2. **Use Inertia helpers** for SPA navigation
3. **Keep tests independent** and self-contained
4. **Test user flows**, not implementation
5. **Run tests frequently** to catch regressions early

### Further Resources

- [Playwright Documentation](https://playwright.dev)
- [Inertia.js Documentation](https://inertiajs.com)
- [Laravel Testing Documentation](https://laravel.com/docs/testing)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)

---

**Last Updated:** 2025-01-12
**Framework:** Playwright v1.40+
**Application:** Laravel 12 + Inertia v2 + React 19
