# E2E Test Quick Reference
## Asset & Persediaan Management System

**Last Updated:** January 12, 2026

---

## Test Suite Overview

| Metric | Count |
|--------|-------|
| **Test Files** | 29 |
| **Test Cases** | 601 |
| **Categories** | 8 |

---

## Test Files by Category

### 🔐 Authentication & Security (42 tests)
| File | Tests | Description |
|------|-------|-------------|
| `auth.spec.ts` | 3 | Login, logout, session management |
| `auth-password-reset.spec.ts` | 36 | Password reset flow (email, token, update) |
| `settings-two-factor.spec.ts` | 15 | 2FA setup, QR codes, recovery codes |
| `security.spec.ts` | 2 | Authorization, access control |

### 👨‍💼 Admin Features (108 tests)
| File | Tests | Description |
|------|-------|-------------|
| `admin-roles.spec.ts` | 24 | Role CRUD, user assignments |
| `admin-permissions.spec.ts` | 64 | Permission management, sync |
| `admin-whatsapp.spec.ts` | 20 | WhatsApp API settings |

### 📝 CRUD Operations (38 tests)
| File | Tests | Description |
|------|-------|-------------|
| `items-crud.spec.ts` | 21 | ATK items create, edit, delete |
| `office-supplies.spec.ts` | 17 | Office supplies management |

### 📊 Reports (78 tests)
| File | Tests | Description |
|------|-------|-------------|
| `reports.spec.ts` | 26 | ATK reports, stock, transactions |
| `asset-reports.spec.ts` | 52 | Asset reports, BMN, maintenance |

### 📦 Assets (94 tests)
| File | Tests | Description |
|------|-------|-------------|
| `assets.spec.ts` | 3 | Asset list, search |
| `asset-import.spec.ts` | 41 | Bulk import from CSV/Excel |
| `asset-photos.spec.ts` | 20 | Photo upload, gallery |
| `asset-maintenance.spec.ts` | 29 | Maintenance scheduling, history |

### 🔄 Workflows (124 tests)
| File | Tests | Description |
|------|-------|-------------|
| `purchases.spec.ts` | 28 | Purchase management |
| `purchases-flow.spec.ts` | 1 | Purchase workflow |
| `atk-request-workflow.spec.ts` | 2 | ATK request approval |
| `office-requests.spec.ts` | 18 | Office request approval |
| `office-usages.spec.ts` | 38 | Daily usage logging |
| `stock-opname.spec.ts` | 1 | Stock reconciliation |

### ⚙️ Settings (77 tests)
| File | Tests | Description |
|------|-------|-------------|
| `settings-profile.spec.ts` | 13 | Profile management |
| `settings-password.spec.ts` | 14 | Password change |
| `settings-two-factor.spec.ts` | 15 | 2FA settings |
| `settings-notifications.spec.ts` | 50 | Notification preferences |

### 📱 Mobile & Quality (32 tests)
| File | Tests | Description |
|------|-------|-------------|
| `mobile-responsive.spec.ts` | 22 | Mobile, responsive, PWA |
| `performance.spec.ts` | 2 | Page load metrics |
| `data-test-selectors.spec.ts` | 8 | Selector validation |
| `global-navigation.spec.ts` | 4 | Navigation tests |

---

## Running Tests

### All Tests
```bash
npx playwright test
```

### Specific Category
```bash
# Authentication tests
npx playwright test auth- settings-

# Admin tests
npx playwright test admin-

# Asset tests
npx playwright test asset- assets.spec.ts

# Workflow tests
npx playwright test purchases- office- atk-request- stock-opname.spec.ts
```

### Single File
```bash
npx playwright test auth.spec.ts
```

### With HTML Report
```bash
npx playwright test --reporter=html
```

### View HTML Report
```bash
npx playwright show-report
# Or open: playwright-report/index.html
```

---

## Test Reports

### HTML Report
**Location:** `/home/moohard/dev/work/asset-persediaan-system/playwright-report/index.html`

**Features:**
- Test execution timeline
- Screenshots of failures
- Video recordings
- Detailed error messages
- Duration metrics

### Comprehensive Report
**Location:** `/home/moohard/dev/work/asset-persediaan-system/tests/e2e/TEST_REPORT.md`

**Contents:**
- Detailed coverage analysis
- Test infrastructure
- Known issues
- Recommendations
- Test files reference

---

## Test Data

### Database
- **Type:** SQLite
- **Location:** `database/database.e2e.sqlite`
- **Seeder:** E2ESeeder

### Pre-seeded Data
- **Assets:** 350 items
- **Users:** Multiple roles (admin, kpa, kasubag, pegawai)
- **Items:** Fixed ATK items
- **Locations:** Various locations
- **Departments:** Multiple departments

---

## Test Users

| Role | Email | Permissions |
|------|-------|-------------|
| Super Admin | super_admin@example.com | Full access |
| KPA | kpa@example.com | ATK management |
| Kasubag Umum | kasubag_umum@example.com | Office supplies |
| Pegawai | pegawai@example.com | Request items |

---

## Known Issues

### Current Blockers
1. **Auth Setup Timeout:** Email input not found during setup
2. **SQLite WAL:** sqlite3 command not available (warning only)
3. **Server Startup:** Requires manual pre-start in some environments

### Workarounds
1. Pre-start server: `php artisan serve --env=e2e --port=8011`
2. Ignore WAL checkpoint warnings
3. Increase timeouts for slow networks

---

## Test Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| Pass Rate | > 95% | Blocked |
| Flakiness | < 5% | N/A |
| Execution Time | < 30 min | N/A |
| Coverage | > 80% | ✅ |

---

## Quick Commands

```bash
# Setup
npm install
composer install

# Run tests
npx playwright test

# Run with UI mode
npx playwright test --ui

# Run specific test
npx playwright test auth.spec.ts

# Debug test
npx playwright test auth.spec.ts --debug

# View report
npx playwright show-report

# Clean test results
rm -rf test-results playwright-report
```

---

## Documentation

- **[TEST_REPORT.md](./TEST_REPORT.md)** - Comprehensive test report
- **[README.md](./README.md)** - E2E testing overview
- **[TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md)** - Test file documentation
- **[GAP_ANALYSIS.md](./GAP_ANALYSIS.md)** - Coverage gap analysis
- **[E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md)** - Testing guide
- **[DATA_TEST_STANDARDS.md](./DATA_TEST_STANDARDS.md)** - data-test standards

---

## Maintenance

### Regular Tasks
- [ ] Update test data when schema changes
- [ ] Review and fix flaky tests
- [ ] Add tests for new features
- [ ] Update documentation
- [ ] Check test execution time

### Quality Checks
- [ ] All tests pass
- [ ] No flaky tests
- [ ] Coverage > 80%
- [ ] Documentation current
- [ ] Performance acceptable

---

**Generated by:** Agent 7 (SubAgent-AllRounder)
**Date:** January 12, 2026
**Track:** e2e-fix_20250112
**Task:** 5.3 - Generate Test Report
