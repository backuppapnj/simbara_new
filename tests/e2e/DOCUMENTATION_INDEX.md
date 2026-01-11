# E2E Test Documentation Index

Quick navigation guide for E2E testing documentation.

---

## Quick Start

**New to E2E testing?** Start here:
1. [README.md](./README.md) - Overview and quick links
2. [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md) - Comprehensive guide (1,172 lines)

---

## Core Documentation

### Essential Reading
- **[E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md)** (26KB, 1,172 lines)
  - Complete guide to running and writing E2E tests
  - Prerequisites, setup, and configuration
  - Test writing best practices
  - Troubleshooting common issues
  - Working with Inertia.js

- **[DATA_TEST_STANDARDS.md](./DATA_TEST_STANDARDS.md)** (12KB, 593 lines)
  - `data-test` attribute naming convention
  - Component standards and patterns
  - Implementation examples by feature
  - Migration strategy for existing code

### Reference Documentation
- **[README.md](./README.md)** (6.3KB)
  - Test files overview
  - Environment setup
  - Running tests quick reference

- **[TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md)** (16KB)
  - Detailed test file documentation
  - Test scenarios covered
  - Routes and permissions tested

### Analysis & Planning
- **[GAP_ANALYSIS.md](./GAP_ANALYSIS.md)** (18KB)
  - Coverage gap analysis
  - Missing test scenarios
  - Recommendations for improvement

---

## Feature-Specific Documentation

### Authentication
- **[PASSWORD_RESET_TESTS.md](./PASSWORD_RESET_TESTS.md)** (11KB)
  - Password reset flow testing
  - Email verification tests
  - Security validation

### Asset Management
- **[ASSET_IMPORT_TESTS.md](./ASSET_IMPORT_TESTS.md)** (16KB)
  - Asset import feature tests
  - Excel upload validation
  - Batch processing tests

- **[ASSET_PHOTOS_TEST_DOCUMENTATION.md](./ASSET_PHOTOS_TEST_DOCUMENTATION.md)** (13KB)
  - Photo upload tests
  - Image validation
  - Gallery display tests

### Office Supplies
- **[OFFICE_PURCHASES_TEST_QUICKSTART.md](./OFFICE_PURCHASES_TEST_QUICKSTART.md)** (5.6KB)
  - Quick reference for purchase tests
  - Common test patterns

- **[OFFICE_PURCHASES_TEST_COVERAGE.md](./OFFICE_PURCHASES_TEST_COVERAGE.md)** (6.5KB)
  - Detailed coverage analysis
  - Test scenarios for purchases

### Admin Features
- **[ADMIN_PERMISSIONS_TEST_GUIDE.md](./ADMIN_PERMISSIONS_TEST_GUIDE.md)** (12KB)
  - Role-based access control tests
  - Permission validation
  - Multi-role scenarios

---

## How to Use This Documentation

### For New Developers
1. Read [README.md](./README.md) for overview
2. Read [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md) sections 1-5
3. Follow [DATA_TEST_STANDARDS.md](./DATA_TEST_STANDARDS.md) when adding components
4. Run tests using commands from [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md#running-tests)

### For Writing Tests
1. Check [TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md) for existing test patterns
2. Follow selector strategy from [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md#selector-strategies)
3. Use `data-test` attributes per [DATA_TEST_STANDARDS.md](./DATA_TEST_STANDARDS.md)
4. Use Inertia helpers from [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md#working-with-inertiajs)

### For Debugging Tests
1. Read [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md#troubleshooting)
2. Check feature-specific documentation above
3. Review [GAP_ANALYSIS.md](./GAP_ANALYSIS.md) for known issues

### For Adding Features
1. Add `data-test` attributes per [DATA_TEST_STANDARDS.md](./DATA_TEST_STANDARDS.md)
2. Write tests per [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md#writing-tests)
3. Update feature-specific documentation if applicable

---

## Quick Commands

```bash
# Run all tests
npx playwright test

# Run specific test
npx playwright test settings-profile.spec.ts

# Run in UI mode
npx playwright test --ui

# View report
npx playwright show-report

# Debug mode
npx playwright test --debug
```

---

## File Structure

```
tests/e2e/
├── DOCUMENTATION_INDEX.md       # This file
├── README.md                     # Quick overview
├── E2E_TESTING_GUIDE.md          # Main guide (START HERE)
├── DATA_TEST_STANDARDS.md        # Attribute standards
├── TEST_DOCUMENTATION.md         # Test file details
├── GAP_ANALYSIS.md               # Coverage analysis
├── PASSWORD_RESET_TESTS.md       # Feature docs
├── ASSET_IMPORT_TESTS.md         # Feature docs
├── ASSET_PHOTOS_TEST_DOCUMENTATION.md  # Feature docs
├── OFFICE_PURCHASES_TEST_QUICKSTART.md # Feature docs
├── OFFICE_PURCHASES_TEST_COVERAGE.md   # Feature docs
├── ADMIN_PERMISSIONS_TEST_GUIDE.md      # Feature docs
├── support/                      # Test helpers
│   ├── auth.ts                  # Login/logout
│   ├── inertia.ts               # Inertia helpers
│   └── test-users.ts            # Test credentials
└── *.spec.ts                     # Test files
```

---

## Key Concepts

### data-test Attributes
**Standard:** `data-test="{feature}-{element}-{type}"`

Examples:
- `submit-button`
- `email-input`
- `delete-dialog`
- `user-menu`

See [DATA_TEST_STANDARDS.md](./DATA_TEST_STANDARDS.md) for details.

### Inertia.js Helpers
**Use custom helpers for SPA navigation:**
- `waitForInertiaPage()` - Wait for page load
- `waitForInertiaFormSubmit()` - Wait for form submit
- `waitForInertiaDeferredProps()` - Wait for deferred props

See [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md#working-with-inertiajs) for details.

### Playwright Config
**Key decisions:**
- `workers: 1` - SQLite limitation
- `fullyParallel: false` - Test isolation
- `domcontentloaded` - Inertia navigation

See [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md#configuration) for details.

---

## Getting Help

### Documentation Issues
- Missing information? Create an issue
- Unclear explanations? Suggest improvements
- New patterns? Document them

### Test Failures
1. Check [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md#troubleshooting)
2. Review feature-specific docs
3. Check [GAP_ANALYSIS.md](./GAP_ANALYSIS.md) for known issues

---

**Last Updated:** 2025-01-12
**Total Documentation:** 11 files, ~130KB
