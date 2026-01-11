# Plan: Perbaikan Masalah Test E2E

## Overview

Plan ini mencakup perbaikan menyeluruh untuk seluruh suite test E2E Playwright yang saat ini memiliki 67+ masalah teridentifikasi. Pendekatan bertahap berdasarkan prioritas: CRITICAL → HIGH → MEDIUM.

---

## Phase 1: CRITICAL - Fix Selector Issues & Missing Features

**Tujuan:** Memperbaiki masalah paling kritis yang menyebabkan test gagal segera.

### Task 1.1: Fix Select Component Name Attributes
- [ ] Write Tests - Verifikasi Select component memiliki name attribute yang sesuai
  - [ ] Test untuk OfficeUsages Select (supply_id)
  - [ ] Test untuk ATK Request Select (item_id, department_id)
  - [ ] Test untuk Office Supplies Select
- [ ] Implement - Tambahkan `name` attribute ke semua Select components
  - [ ] `resources/js/pages/OfficeUsages/Index.tsx` line 371-378
  - [ ] `resources/js/pages/atk-requests/create.tsx` line 262-280
  - [ ] `resources/js/pages/officeSupplies/Index.tsx`

### Task 1.2: Fix Heading Text Pattern Match
- [ ] Write Tests - Verifikasi heading text match dengan test expectations
  - [ ] Test untuk office-supplies heading
- [ ] Implement - Update test regex pattern atau heading text
  - [ ] Update `tests/e2e/office-supplies.spec.ts:38` pattern
  - [ ] Atau update `resources/js/pages/officeSupplies/Index.tsx:252` heading text

### Task 1.3: Implement Distribute UI for ATK Requests
- [ ] Write Tests - Distribute functionality
  - [ ] Test distribute button visible when canDistribute = true
  - [ ] Test distribute form input validation
  - [ ] Test distribute API call success
- [ ] Implement - Distribute dialog di atk-requests/show.tsx
  - [ ] Tambah Distribute button (conditional render)
  - [ ] Tambah Dialog component dengan form jumlah_diberikan
  - [ ] Integrate dengan API POST `/atk-requests/{id}/distribute`

### Task 1.4: Implement Items CRUD Forms
- [ ] Write Tests - Items CRUD functionality
  - [ ] Test create button visible
  - [ ] Test create form validation
  - [ ] Test edit functionality
  - [ ] Test delete functionality
- [ ] Implement - Items CRUD forms di items/Index.tsx
  - [ ] Create form component dengan all required fields
  - [ ] Edit form component
  - [ ] Delete confirmation dialog
  - [ ] Table/list view dengan actions

### Task 1.5: Add Missing Routes
- [ ] Write Tests - Endpoint API tests
  - [ ] Test GET /departments returns JSON
  - [ ] Test GET /office-supplies/{id} returns JSON
- [ ] Implement - Tambah routes dan controller methods
  - [ ] `Route::get('/departments', [DepartmentController::class, 'index'])`
  - [ ] `Route::get('/office-supplies/{office_supply}', [OfficeSupplyController::class, 'show'])`
  - [ ] Implement `index()` di DepartmentController
  - [ ] Implement `show()` di OfficeSupplyController dengan JSON support

### Task 1.6: Fix Permission Mismatch for Distribute
- [ ] Write Tests - Permission tests for distribute
  - [ ] Test kpa role can distribute
  - [ ] Test operator_persediaan can distribute
  - [ ] Test kasubag_umum can distribute
- [ ] Implement - Update PermissionsSeeder atau AtkRequestPolicy
  - [ ] Opsi A: Tambah `atk.requests.distribute` ke role kpa
  - [ ] Opsi B: Update test untuk menggunakan role yang tepat

### Task 1.7: Add OfficeSupplyController JSON Support
- [ ] Write Tests - JSON response tests
  - [ ] Test `wantsJson()` returns JSON
  - [ ] Test Inertia request returns Inertia response
- [ ] Implement - Update OfficeSupplyController methods
  - [ ] Tambah `wantsJson()` check di `index()` method
  - [ ] Tambah `wantsJson()` check di `mutations()` method
  - [ ] Return JSON response untuk API calls

- [ ] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)**

---

## Phase 2: HIGH - Fix Inertia Timing & Playwright Config

**Tujuan:** Memperbaiki masalah timing dan konfigurasi yang menyebabkan test flaky.

### Task 2.1: Replace networkidle with domcontentloaded
- [ ] Write Tests - Auth login timing tests
  - [ ] Test login completes with domcontentloaded wait
  - [ ] Test login completes with element wait
- [ ] Implement - Update auth.ts dan test files
  - [ ] Ganti `waitForLoadState('networkidle')` dengan `waitForLoadState('domcontentloaded')`
  - [ ] Update `tests/e2e/support/auth.ts:8`
  - [ ] Update semua test files menggunakan networkidle

### Task 2.2: Add Wait After Form Submit
- [ ] Write Tests - Form submission timing tests
  - [ ] Test success message visible after submit
  - [ ] Test URL change after form submit
- [ ] Implement - Tambah explicit wait setelah form submit
  - [ ] Update `tests/e2e/office-usages.spec.ts` form submissions
  - [ ] Tambah `await page.waitForURL()` atau wait untuk success message
  - [ ] Update form submit tests di semua spec files

### Task 2.3: Create waitForInertiaPage Helper
- [ ] Write Tests - Helper function tests
  - [ ] Test helper waits for Inertia load complete
  - [ ] Test helper works dengan deferred props
- [ ] Implement - Create reusable helper
  - [ ] Create `tests/e2e/support/inertia.ts`
  - [ ] Implement `waitForInertiaPage()` function
  - [ ] Update existing tests untuk menggunakan helper

### Task 2.4: Fix Playwright Config for SQLite
- [ ] Write Tests - Playwright config validation
  - [ ] Test config uses single worker
  - [ ] Test config has proper timeouts
- [ ] Implement - Update playwright.config.ts
  - [ ] Set `fullyParallel: false`
  - [ ] Set `workers: 1`
  - [ ] Increase `webServer.timeout` ke 300_000
  - [ ] Add globalTeardown configuration

### Task 2.5: Add WAL Checkpoint
- [ ] Write Tests - Database checkpoint tests
  - [ ] Test WAL file size setelah checkpoint
  - [ ] Test database consistency setelah checkpoint
- [ ] Implement - Tambah WAL checkpoint ke global-setup
  - [ ] Add PRAGMA wal_checkpoint(TRUNCATE) setelah migrate:fresh
  - [ ] Update `tests/e2e/support/global-setup.ts`

- [ ] **Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)**

---

## Phase 3: HIGH - Flash Messages & Backend Fixes

**Tujuan:** Memperbaiki flash messages display dan backend issues.

### Task 3.1: Share Flash Messages to Frontend
- [ ] Write Tests - Flash message tests
  - [ ] Test success message displayed after action
  - [ ] Test error message displayed on validation fail
- [ ] Implement - Update HandleInertiaRequests middleware
  - [ ] Tambah flash array ke share() method
  - [ ] Share success dan error dari session
- [ ] Implement - Mount Toaster component
  - [ ] Tambah `<Toaster />` ke `app.tsx`
  - [ ] Tambah useEffect untuk display flash messages

### Task 3.2: Fix ATK Request Items Array Validation Display
- [ ] Write Tests - Nested validation error tests
  - [ ] Test items array error displayed
  - [ ] Test items.*.item_id error displayed
- [ ] Implement - Update atk-requests/create.tsx
  - [ ] Tambah error display untuk items array
  - [ ] Handle nested error messages

### Task 3.3: Fix E2ESeeder Transaction Safety
- [ ] Write Tests - Seeder tests
  - [ ] Test seeder rollback on error
  - [ ] Test seeder validates dependencies
- [ ] Implement - Wrap E2ESeeder in transaction
  - [ ] Tambah `DB::beginTransaction()` di run()
  - [ ] Tambah try-catch dengan rollback
  - [ ] Validate dependencies sebelum create relationships

### Task 3.4: Add E2ESeeder Dependency Validation
- [ ] Write Tests - Dependency validation tests
  - [ ] Test admin user exists sebelum stock opname
  - [ ] Test items exist sebelum purchases
- [ ] Implement - Add validation checks
  - [ ] Validate User exists sebelum use
  - [ ] Validate Item count sebelum create purchase details
  - [ ] Throw exception dengan jelas jika dependency tidak terpenuhi

- [ ] **Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)**

---

## Phase 4: MEDIUM - data-test Attributes & Polish

**Tujuan:** Menambahkan data-test attributes untuk test reliability.

### Task 4.1: Add Critical data-test Attributes - 2FA
- [ ] Write Tests - 2FA selector tests
  - [ ] Test 2fa-setup-modal selector works
  - [ ] Test 2fa-qr-code selector works
- [ ] Implement - Update TwoFactorSetupModal component
  - [ ] Tambah `data-test="2fa-setup-modal"` ke DialogContent
  - [ ] Tambah `data-test="2fa-qr-code"` ke QR container

### Task 4.2: Add Critical data-test Attributes - WhatsApp
- [ ] Write Tests - WhatsApp selector tests
  - [ ] Test api-token-input selector works
  - [ ] Test test-whatsapp-button selector works
- [ ] Implement - Update WhatsAppSettings component
  - [ ] Tambah `data-test="api-token-input"` ke Input
  - [ ] Tambah `data-test="test-whatsapp-button"` ke Button

### Task 4.3: Add data-test Attributes - Forms
- [ ] Write Tests - Form selector tests
  - [ ] Test supply-select selector works
  - [ ] Test submit button selectors work
- [ ] Implement - Add data-test ke form components
  - [ ] Add `data-test="log-usage-button"`
  - [ ] Add `data-test="quick-deduct-button"`
  - [ ] Add `data-test` ke semua form submit buttons

### Task 4.4: Add Global Teardown
- [ ] Write Tests - Teardown tests
  - [ ] Test database cleanup setelah tests
  - [ ] Test resources released
- [ ] Implement - Create global-teardown.ts
  - [ ] Create `tests/e2e/support/global-teardown.ts`
  - [ ] Implement database cleanup
  - [ ] Configure di playwright.config.ts

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
- [ ] Update PLAYGROUND.md atau test documentation
- [ ] Document data-test naming convention
- [ ] Document waitForInertiaPage usage
- [ ] Document Playwright config decisions

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
