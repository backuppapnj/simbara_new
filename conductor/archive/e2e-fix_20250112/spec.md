# Spec: Perbaikan Masalah Test E2E

## Overview

Track ini bertujuan untuk memperbaiki seluruh suite test E2E Playwright yang saat ini memiliki 67+ masalah teridentifikasi. Perbaikan mencakup dua aspek utama:

1. **Perbaikan Infrastruktur & Test** - Memperbaiki masalah teknis pada test, konfigurasi Playwright, timing, dan selector
2. **Implementasi Fitur Hilang** - Menambahkan fitur yang diharapkan oleh test tapi belum ada di aplikasi

### Current State

- 32 file test E2E
- 93+ komponen React
- 67 masalah teridentifikasi dari 13 agent analysis
- Issue tersebar di: Authentication, ATK Requests, Office Usages, Items CRUD, Infrastructure

### Target State

- Semua test E2E berjalan lancer tanpa error/timeout
- Test dapat dijalankan berulang kali secara konsisten (tidak flaky)
- Coverage mencakup happy path dan error path
- Fitur yang diharapkan test sudah diimplementasikan

---

## Functional Requirements

### FR1: Perbaikan Critical Selector Issues

**Priority:** CRITICAL

Sebagian besar test gagal karena selector tidak menemukan elemen di frontend:

| Test | Selector Issue | Komponen | Fix Required |
|------|---------------|----------|--------------|
| `office-usages.spec.ts:141` | `select[name*="supply" i]` | `OfficeUsages/Index.tsx:371` | Tambah `name` attribute ke Select |
| `office-supplies.spec.ts:38` | Heading text mismatch | `officeSupplies/Index.tsx:252` | Fix regex pattern |
| `items-crud.spec.ts:53+` | Semua CRUD selector | `items/Index.tsx` | Implement form components |
| `atk-request-workflow.spec.ts:98` | Distribute UI tidak ada | `atk-requests/show.tsx` | Implement distribute dialog |

**Acceptance Criteria:**
- [ ] Select component memiliki `name` attribute yang sesuai
- [ ] Text pattern match di test sesuai dengan actual content
- [ ] Form CRUD Items memiliki tombol dan input yang lengkap
- [ ] UI Distribute tersedia dengan form input jumlah_diberikan

### FR2: Implementasi Fitur Hilang

**Priority:** CRITICAL

Beberapa test mengharapkan fitur yang belum diimplementasikan:

| Fitur | Lokasi | Status | Requirement |
|-------|--------|--------|-------------|
| Distribute UI | `atk-requests/show.tsx` | tidak ada | Dialog dengan input jumlah_diberikan |
| Items CRUD Forms | `items/Index.tsx` | Stub kosong | Create/Edit/Delete forms |
| Route /departments | `routes/web.php` | tidak ada | GET endpoint |
| Route /office-supplies/{id} | `routes/web.php` | tidak ada | Show endpoint |

**Acceptance Criteria:**
- [ ] Distribute dialog muncul saat status = level3_approved dan user punya permission
- [ ] Items CRUD memiliki form create dan edit dengan validasi
- [ ] `/departments` endpoint mengembalikan JSON list departments
- [ ] `/office-supplies/{id}` endpoint mengembalikan detail supply

### FR3: Perbaikan Inertia.js Timing Issues

**Priority:** HIGH

Test menggunakan `waitForLoadState('networkidle')` yang tidak cocok untuk Inertia apps:

| Lokasi | Issue | Fix |
|--------|-------|-----|
| `auth.ts:8` | `networkidle` tidak reliable | Gunakan `domcontentloaded` atau wait element |
| Semua form tests | Tidak ada wait setelah submit | Tambah wait URL change atau success message |
| `dashboard.tsx:90` | WhenVisible deferred props | Tambah wait untuk skeleton hilang |

**Acceptance Criteria:**
- [ ] Tidak ada lagi `waitForLoadState('networkidle')` di test
- [ ] Setelah form submit, test menunggu URL change atau success message visible
- [ ] Helper function `waitForInertiaPage()` tersedia untuk digunakan test

### FR4: Perbaikan Permission Mismatch

**Priority:** HIGH

Test menggunakan user `kpa` untuk distribute tapi role kpa tidak punya permission:

```php
// PermissionsSeeder.php line 117-123
'kpa' => [
    '*.view',
    '*.reports.view',
    '*.reports.export',
    'atk.requests.approve',  // Level 3 approval
    // Tidak ada 'atk.requests.distribute'
],
```

**Acceptance Criteria:**
- [ ] Role `kpa` memiliki permission `atk.requests.distribute` ATAU
- [ ] Test diubah menggunakan user `operator_persediaan` atau `kasubag_umum` untuk distribute

### FR5: Perbaikan Flash Messages Display

**Priority:** MEDIUM

Controller mengirim flash messages tapi tidak ditampilkan ke user:

```php
// Controller
->with('success', 'Pemakaian berhasil dicatat.')

// HandleInertiaRequests middleware tidak share flash
```

**Acceptance Criteria:**
- [ ] Flash messages shared ke frontend via `HandleInertiaRequests` middleware
- [ ] Component `<Toaster />` mounted di `app.tsx`
- [ ] Success/error messages tampil menggunakan sonner toast

### FR6: Perbaikan Playwright Configuration

**Priority:** HIGH

Konfigurasi saat ini bermasalah untuk SQLite:

```typescript
// playwright.config.ts
fullyParallel: true,  // SQLite lock contention
workers: undefined,
webServer: {
    timeout: 180_000,
},
```

**Acceptance Criteria:**
- [ ] `fullyParallel: false` untuk SQLite
- [ ] `workers: 1` untuk menghindari lock
- [ ] WAL checkpoint dijalankan setelah database setup
- [ ] Global teardown ditambahkan untuk cleanup

### FR7: Perbaikan Database Seeder

**Priority:** MEDIUM

E2ESeeder memiliki potensi NULL foreign key dan tidak ada transaction safety:

```php
// E2ESeeder.php line 163
$approver = User::where('email', 'admin@pa-penajam.go.id')->first();
// $approver bisa NULL

// Tidak ada DB::transaction()
```

**Acceptance Criteria:**
- [ ] E2ESeeder dibungkus transaction dengan try-catch
- [ ] Validasi dependencies sebelum create relationships
- [ ] Error handling jika user tidak ditemukan

### FR8: Penambahan data-test Attributes

**Priority:** MEDIUM

50+ test references mengharapkan `data-test` attributes yang belum ada:

**Kehilangan Critical:**
- `data-test="2fa-setup-modal"` untuk TwoFactorSetupModal
- `data-test="2fa-qr-code"` untuk QR code container
- `data-test="api-token-input"` untuk WhatsAppSettings
- `data-test="log-usage-button"` untuk OfficeUsages

**Acceptance Criteria:**
- [ ] Critical modals dan buttons memiliki `data-test` attributes
- [ ] Form inputs memiliki `data-test` untuk identifikasi yang jelas
- [ ] Submit buttons memiliki `data-test` yang konsisten

---

## Non-Functional Requirements

### NFR1: Test Reliability

- Test harus dapat dijalankan berulang kali tanpa random failure
- Tidak boleh ada hardcoded timeout yang tidak perlu
- Test harus cepat - idealnya seluruh suite selesai < 10 menit

### NFR2: Code Quality

- Perubahan harus mengikuti existing code style
- Type safety harus dijaga (TypeScript untuk frontend, type hints untuk PHP)
- Tidak boleh ada console errors atau warnings

### NFR3: Documentation

- Perubahan signifikan ke konfigurasi harus didokumentasikan
- Pattern baru (misal: data-test naming) harus didokumentasikan untuk developer lain

---

## Acceptance Criteria

### Criteria 1: Test Execution
- [ ] Semua test E2E dapat dijalankan dengan `npx playwright test` tanpa error
- [ ] Test report menunjukkan 100% pass rate
- [ ] Test dapat dijalankan ulang 3x dengan hasil konsisten

### Criteria 2: Feature Completeness
- [ ] Distribute UI berfungsi untuk ATK requests
- [ ] Items CRUD forms berfungsi (create, edit, delete, view)
- [ ] Missing routes telah ditambahkan

### Criteria 3: Infrastructure
- [ ] Playwright configuration optimal untuk environment E2E
- [ ] Database seeder berjalan tanpa error
- [ ] Flash messages tampil dengan benar

---

## Out of Scope

- Mengubah alur bisnis existing (approval workflow tidak diubah)
- Restructuring database (hanya fix seeder)
- Menambahkan test baru (hanya memperbaiki test yang ada)
- Performance optimization (kecuali yang terkait test timing)

---

## Implementation Priority

### Phase 1: CRITICAL (Wajib)
1. Fix critical selector issues (Select name attributes, heading patterns)
2. Implement missing Distribute UI
3. Implement Items CRUD forms
4. Add missing routes (/departments, /office-supplies/{id})
5. Fix permission mismatch (kpa distribute)

### Phase 2: HIGH (Penting)
1. Fix Inertia timing issues (replace networkidle, add waits)
2. Fix Playwright config (disable parallel, single worker)
3. Share flash messages to frontend
4. Add WAL checkpoint after database setup

### Phase 3: MEDIUM (Boleh ditunda)
1. Add data-test attributes
2. Fix E2ESeeder transaction safety
3. Add global teardown
4. Update tests to use more robust selectors

---

## Definition of Done

Track ini selesai ketika:

- [ ] Semua 67 issue teridentifikasi telah ditangani
- [ ] Test E2E berjalan 100% pass
- [ ] Test dapat dijalankan ulang dengan hasil konsisten
- [ ] Code coverage untuk perubahan baru > 80%
- [ ] Documentation untuk perubahan konfigurasi telah ditambahkan
- [ ] Code changes telah di-commit dengan proper commit message
