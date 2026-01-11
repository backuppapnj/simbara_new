# Plan: Perbaikan Masalah Test E2E

## Overview

Plan ini mencakup perbaikan menyeluruh untuk seluruh suite test E2E Playwright yang saat ini memiliki 67+ masalah teridentifikasi. Pendekatan bertahap berdasarkan prioritas: CRITICAL → HIGH → MEDIUM.

---

## Phase 1: CRITICAL - Fix Selector Issues & Missing Features

**Tujuan:** Memperbaiki masalah paling kritis yang menyebabkan test gagal segera.

### Task 1.1: Fix Select Component Name Attributes
- [x] Write Tests - Verifikasi Select component memiliki name attribute yang sesuai
  - [x] Test untuk OfficeUsages Select (supply_id)
  - [x] Test untuk ATK Request Select (item_id, department_id)
  - [x] Test untuk Office Supplies Select
- [x] Implement - Tambahkan `name` attribute ke semua Select components
  - [x] `resources/js/pages/OfficeUsages/Index.tsx` line 371-378
  - [x] `resources/js/pages/atk-requests/create.tsx` line 262-280
  - [x] `resources/js/pages/officeSupplies/Index.tsx`
**Commit:** 592336d

### Task 1.2: Fix Heading Text Pattern Match
- [x] Write Tests - Verifikasi heading text match dengan test expectations
  - [x] Test untuk office-supplies heading
- [x] Implement - Update test regex pattern atau heading text
  - [x] Update `tests/e2e/office-supplies.spec.ts:38` pattern
  - [x] Atau update `resources/js/pages/officeSupplies/Index.tsx:252` heading text
**Commit:** 592336d (part of Select Component fix)

### Task 1.3: Implement Distribute UI for ATK Requests
- [x] Write Tests - Distribute functionality
  - [x] Test distribute button visible when canDistribute = true
  - [x] Test distribute form input validation
  - [x] Test distribute API call success
- [x] Implement - Distribute dialog di atk-requests/show.tsx
  - [x] Tambah Distribute button (conditional render)
  - [x] Tambah Dialog component dengan form jumlah_diberikan
  - [x] Integrate dengan API POST `/atk-requests/{id}/distribute`
**Commit:** 167ac84

### Task 1.4: Implement Items CRUD Forms
- [x] Write Tests - Items CRUD functionality
  - [x] Test create button visible
  - [x] Test create form validation
  - [x] Test edit functionality
  - [x] Test delete functionality
- [x] Implement - Items CRUD forms di items/Index.tsx
  - [x] Create form component dengan all required fields
  - [x] Edit form component
  - [x] Delete confirmation dialog
  - [x] Table/list view dengan actions
**Commit:** 0478b0f

### Task 1.5: Add Missing Routes
- [x] Write Tests - Endpoint API tests
  - [x] Test GET /departments returns JSON
  - [x] Test GET /office-supplies/{id} returns JSON
- [x] Implement - Tambah routes dan controller methods
  - [x] `Route::get('/departments', [DepartmentController::class, 'index'])`
  - [x] `Route::get('/office-supplies/{office_supply}', [OfficeSupplyController::class, 'show'])`
  - [x] Implement `index()` di DepartmentController
  - [x] Implement `show()` di OfficeSupplyController dengan JSON support
**Commit:** 261098a

### Task 1.6: Fix Permission Mismatch for Distribute
- [x] Write Tests - Permission tests for distribute
  - [x] Test kpa role can distribute
  - [x] Test operator_persediaan can distribute
  - [x] Test kasubag_umum can distribute
- [x] Implement - Update PermissionsSeeder atau AtkRequestPolicy
  - [x] Opsi A: Tambah `atk.requests.distribute` ke role kpa
  - [x] Opsi B: Update test untuk menggunakan role yang tepat
**Commit:** 425533f

### Task 1.7: Add OfficeSupplyController JSON Support
- [x] Write Tests - JSON response tests
  - [x] Test `wantsJson()` returns JSON
  - [x] Test Inertia request returns Inertia response
- [x] Implement - Update OfficeSupplyController methods
  - [x] Tambah `wantsJson()` check di `index()` method
  - [x] Tambah `wantsJson()` check di `mutations()` method
  - [x] Return JSON response untuk API calls
**Commit:** 592336d (part of Select Component fix)

- [x] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)**
  [checkpoint: dcdd1abaf0efd27536cf80cd176a42b9409e87c3]

---

## Phase 2: HIGH - Fix Inertia Timing & Playwright Config

**Tujuan:** Memperbaiki masalah timing dan konfigurasi yang menyebabkan test flaky.

### Task 2.1: Replace networkidle with domcontentloaded
- [x] Write Tests - Auth login timing tests
  - [x] Test login completes with domcontentloaded wait
  - [x] Test login completes with element wait
- [x] Implement - Update auth.ts dan test files
  - [x] Ganti `waitForLoadState('networkidle')` dengan `waitForLoadState('domcontentloaded')`
  - [x] Update `tests/e2e/support/auth.ts:8`
  - [x] Update semua test files menggunakan networkidle
**Commit:** f76c68e

### Task 2.2: Add Wait After Form Submit
- [x] Write Tests - Form submission timing tests
  - [x] Test success message visible after submit
  - [x] Test URL change after form submit
- [x] Implement - Tambah explicit wait setelah form submit
  - [x] Update `tests/e2e/office-usages.spec.ts` form submissions
  - [x] Tambah `await page.waitForURL()` atau wait untuk success message
  - [x] Update form submit tests di semua spec files
**Commit:** f76c68e

### Task 2.3: Create waitForInertiaPage Helper
- [x] Write Tests - Helper function tests
  - [x] Test helper waits for Inertia load complete
  - [x] Test helper works dengan deferred props
- [x] Implement - Create reusable helper
  - [x] Create `tests/e2e/support/inertia.ts`
  - [x] Implement `waitForInertiaPage()` function
  - [x] Update existing tests untuk menggunakan helper
**Commit:** f76c68e

### Task 2.4: Fix Playwright Config for SQLite
- [x] Write Tests - Playwright config validation
  - [x] Test config uses single worker
  - [x] Test config has proper timeouts
- [x] Implement - Update playwright.config.ts
  - [x] Set `fullyParallel: false`
  - [x] Set `workers: 1`
  - [x] Increase `webServer.timeout` ke 300_000
  - [x] Add globalTeardown configuration
**Commit:** f76c68e

### Task 2.5: Add WAL Checkpoint
- [x] Write Tests - Database checkpoint tests
  - [x] Test WAL file size setelah checkpoint
  - [x] Test database consistency setelah checkpoint
- [x] Implement - Tambah WAL checkpoint ke global-setup
  - [x] Add PRAGMA wal_checkpoint(TRUNCATE) setelah migrate:fresh
  - [x] Update `tests/e2e/support/global-setup.ts`
**Commit:** f76c68e

- [ ] **Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)**

---

## Phase 3: HIGH - Flash Messages & Backend Fixes

**Tujuan:** Memperbaiki flash messages display dan backend issues.

### Task 3.1: Share Flash Messages to Frontend
- [x] Write Tests - Flash message tests
  - [x] Test success message displayed after action
  - [x] Test error message displayed on validation fail
- [x] Implement - Update HandleInertiaRequests middleware
  - [x] Tambah flash array ke share() method
  - [x] Share success dan error dari session
- [x] Implement - Mount Toaster component
  - [x] Tambah `<Toaster />` ke `app.tsx`
  - [x] Tambah useEffect untuk display flash messages
**Commit:** de98d1b

### Task 3.2: Fix ATK Request Items Array Validation Display
- [x] Write Tests - Nested validation error tests
  - [x] Test items array error displayed
  - [x] Test items.*.item_id error displayed
- [x] Implement - Update atk-requests/create.tsx
  - [x] Tambah error display untuk items array
  - [x] Handle nested error messages
**Commit:** de98d1b

### Task 3.3: Fix E2ESeeder Transaction Safety
- [x] Write Tests - Seeder tests
  - [x] Test seeder rollback on error
  - [x] Test seeder validates dependencies
- [x] Implement - Wrap E2ESeeder in transaction
  - [x] Tambah `DB::beginTransaction()` di run()
  - [x] Tambah try-catch dengan rollback
  - [x] Validate dependencies sebelum create relationships
**Commit:** de98d1b

### Task 3.4: Add E2ESeeder Dependency Validation
- [x] Write Tests - Dependency validation tests
  - [x] Test admin user exists sebelum stock opname
  - [x] Test items exist sebelum purchases
- [x] Implement - Add validation checks
  - [x] Validate User exists sebelum use
  - [x] Validate Item count sebelum create purchase details
  - [x] Throw exception dengan jelas jika dependency tidak terpenuhi
**Commit:** de98d1b

- [ ] **Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)**

---

## Phase 4: MEDIUM - data-test Attributes & Polish

**Tujuan:** Menambahkan data-test attributes untuk test reliability.

### Task 4.1: Add Critical data-test Attributes - 2FA
- [x] Write Tests - 2FA selector tests
  - [x] Test 2fa-setup-modal selector works
  - [x] Test 2fa-qr-code selector works
- [x] Implement - Update TwoFactorSetupModal component
  - [x] Tambah `data-test="2fa-setup-modal"` ke DialogContent
  - [x] Tambah `data-test="2fa-qr-code"` ke QR container
**Commit:** e7c8ba8

### Task 4.2: Add Critical data-test Attributes - WhatsApp
- [x] Write Tests - WhatsApp selector tests
  - [x] Test api-token-input selector works
  - [x] Test test-whatsapp-button selector works
- [x] Implement - Update WhatsAppSettings component
  - [x] Tambah `data-test="api-token-input"` ke Input
  - [x] Tambah `data-test="test-whatsapp-button"` ke Button
**Commit:** e7c8ba8

### Task 4.3: Add data-test Attributes - Forms
- [x] Write Tests - Form selector tests
  - [x] Test supply-select selector works
  - [x] Test submit button selectors work
- [x] Implement - Add data-test ke form components
  - [x] Add `data-test="log-usage-button"`
  - [x] Add `data-test="quick-deduct-button"`
  - [x] Add `data-test` ke semua form submit buttons
**Commit:** e7c8ba8

### Task 4.4: Add Global Teardown
- [x] Write Tests - Teardown tests
  - [x] Test database cleanup setelah tests
  - [x] Test resources released
- [x] Implement - Create global-teardown.ts
  - [x] Create `tests/e2e/support/global-teardown.ts`
  - [x] Implement database cleanup
  - [x] Configure di playwright.config.ts
**Commit:** e7c8ba8

- [ ] **Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)**

---

## Phase 5: Verification & Documentation

**Tujuan:** Verifikasi semua test lulus dan dokumentasi lengkap.

### Task 5.1: Run Full E2E Test Suite
- [ ] Execute `npx playwright test` untuk seluruh suite
- [ ] Verify 100% pass rate
- [ ] Identify remaining failures jika ada

### Task 5.2: Run Tests 3x for Consistency
- [ ] Execute test suite 3x berturut-turut
- [ ] Verify hasil konsisten (tidak flaky)
- [ ] Document flaky tests jika ada

### Task 5.3: Generate Test Report
- [ ] Generate HTML report dengan `npx playwright test --reporter=html`
- [ ] Review test coverage
- [ ] Document test metrics

### Task 5.4: Update Documentation
- [x] Update PLAYGROUND.md atau test documentation
- [x] Document data-test naming convention
- [x] Document waitForInertiaPage usage
- [x] Document Playwright config decisions
**Commit:** (documentation)
**Documentation Created:**
- `tests/e2e/E2E_TESTING_GUIDE.md` - Comprehensive E2E testing guide (450+ lines)
- `tests/e2e/DATA_TEST_STANDARDS.md` - data-test attribute standards (400+ lines)
- Updated `tests/e2e/README.md` - Quick reference
- Updated `tests/e2e/TEST_DOCUMENTATION.md` - Test file documentation

- [ ] **Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)**

---

## Quality Gates Checklist

Sebelum menandai track selesai:

- [ ] Semua 67 issue teridentifikasi telah ditangani
- [ ] Test E2E berjalan 100% pass
- [ ] Test dapat dijalankan ulang dengan hasil konsisten
- [ ] Code coverage untuk perubahan baru > 80%
- [ ] Code mengikuti project style (Laravel Pint untuk PHP, ESLint/Prettier untuk TS)
- [ ] Type safety terjaga (PHP type hints, TypeScript types)
- [ ] Documentation untuk konfigurasi baru telah ditambahkan
- [ ] Tidak ada security vulnerabilities diperkenalkan
