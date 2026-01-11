# E2E (Playwright) – Asset & Persediaan System

Dokumen ini menjelaskan cakupan skenario E2E, cara menjalankan pengujian, artefak laporan, serta cara mensimulasikan kondisi prod-like dan variasi jaringan.

## Quick Links / Tautan Cepat

- **[GAP_ANALYSIS.md](./GAP_ANALYSIS.md)** - Analisis lengkap celah test coverage / Complete coverage gap analysis
- **[TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md)** - Dokumentasi semua test file / Complete test file documentation
- **Summary Below** - Ringkasan test yang sudah ada dan yang baru / Summary of existing and new tests

---

## Test Files Overview / Ringkasan File Test

### Existing Test Files (8) / Test File yang Sudah Ada

## Alur Kerja Utama yang Diuji

### Autentikasi & Session
- Login valid/invalid, redirect setelah login, logout.
- Proteksi akses untuk user yang belum login.
- File test: [auth.spec.ts](file:///home/moohard/dev/work/asset-persediaan-system/tests/e2e/auth.spec.ts)

### Navigasi Global (Integrasi antar Modul)
- Navigasi ke Assets, ATK Items, Stock Opname, ATK Requests.
- File test: [global-navigation.spec.ts](file:///home/moohard/dev/work/asset-persediaan-system/tests/e2e/global-navigation.spec.ts)

### Manajemen Aset (BMN)
- List aset, search/filter via query string, buka detail aset.
- File test: [assets.spec.ts](file:///home/moohard/dev/work/asset-persediaan-system/tests/e2e/assets.spec.ts)

### Pembelian ATK (Multi-tahap)
- Draft → Terima barang → Selesaikan & update stok.
- Validasi status transaksi dan stabilitas alur (dialog confirm/alert).
- File test: [purchases-flow.spec.ts](file:///home/moohard/dev/work/asset-persediaan-system/tests/e2e/purchases-flow.spec.ts)

### Permintaan ATK (Workflow Approval Berjenjang)
- Buat permintaan (pegawai) → approve L1/L2/L3 (role approver) → distribusi → konfirmasi terima (pemohon).
- Validasi error: stok tidak cukup.
- Validasi state: status request berubah sesuai tahapan + kartu stok mencatat mutasi keluar.
- File test: [atk-request-workflow.spec.ts](file:///home/moohard/dev/work/asset-persediaan-system/tests/e2e/atk-request-workflow.spec.ts)

### Stock Opname (Dokumen BA/PDF)
- Buka stock opname approved → download BA PDF.
- File test: [stock-opname.spec.ts](file:///home/moohard/dev/work/asset-persediaan-system/tests/e2e/stock-opname.spec.ts)

### Keamanan Dasar
- Redirect unauthenticated, kontrol otorisasi role ke modul terbatas.
- File test: [security.spec.ts](file:///home/moohard/dev/work/asset-persediaan-system/tests/e2e/security.spec.ts)

### Performa Dasar & Stabilitas
- Threshold waktu load halaman (baseline).
- Simulasi jaringan lambat (Chromium CDP) untuk stabilitas login.
- File test: [performance.spec.ts](file:///home/moohard/dev/work/asset-persediaan-system/tests/e2e/performance.spec.ts)

## Environment & Dataset (Prod-like)

Pengujian E2E menggunakan environment `APP_ENV=e2e` dengan SQLite terpisah (`database/database.e2e.sqlite`). Global setup akan:
- Membuat/menyiapkan `.env.e2e` dari [.env.e2e.example](file:///home/moohard/dev/work/asset-persediaan-system/.env.e2e.example)
- Menjalankan `php artisan key:generate --env=e2e --force`
- Menjalankan `php artisan migrate:fresh --seed --env=e2e`
- Menjalankan `npm run build` jika `public/build/manifest.json` belum ada

Dataset representatif untuk E2E ditambahkan melalui [E2ESeeder.php](file:///home/moohard/dev/work/asset-persediaan-system/database/seeders/E2ESeeder.php) (items ATK fixed, pembelian draft, stock opname approved).

## Menjalankan Pengujian

1. Pastikan dependensi terpasang:
   - `composer install`
   - `npm install`

2. Jalankan Playwright:

```bash
npx playwright test
```

Secara default Playwright akan menjalankan web server:
- `php artisan serve --env=e2e --port=8011`
- `baseURL = http://localhost:8011`

Override bila diperlukan:
- `E2E_BASE_URL=http://localhost:8011`
- `E2E_WEB_COMMAND="php artisan serve --port=8011"`

Contoh:

```bash
E2E_BASE_URL=http://localhost:8011 E2E_WEB_COMMAND="php artisan serve --env=e2e --port=8011" npx playwright test
```

## Laporan & Artefak

Playwright menghasilkan:
- HTML report: `playwright-report/`
- JUnit: `test-results/junit.xml`
- JSON: `test-results/results.json`
- Screenshot/video hanya pada failure (tersimpan di `test-results/`)

### New Test Files (10) / Test File Baru yang Dibuat

| File | Fitur / Feature | Priority |
|------|-----------------|----------|
| `settings-profile.spec.ts` | Profile management (name, email update) | Medium |
| `settings-password.spec.ts` | Password change | **High** |
| `settings-two-factor.spec.ts` | 2FA setup and authentication | **Critical** |
| `admin-roles.spec.ts` | Role and permission management | **High** |
| `admin-whatsapp.spec.ts` | WhatsApp notification settings | Medium |
| `items-crud.spec.ts` | ATK items CRUD operations | Medium |
| `office-supplies.spec.ts` | Office supplies management | Medium |
| `reports.spec.ts` | ATK reports (PDF, Excel exports) | Medium |
| `permissions-rbac.spec.ts` | Role-based access control | **High** |
| `mobile-responsive.spec.ts` | Mobile, PWA, responsive behavior | Low |

---

## Running New Tests / Menjalankan Test Baru

### All Tests / Semua Test
```bash
npx playwright test
```

### Specific Category / Kategori Tertentu

```bash
# Settings tests (profile, password, 2FA)
npx playwright test settings-

# Admin tests (roles, whatsapp)
npx playwright test admin-

# CRUD tests (items, office supplies)
npx playwright test items-crud.spec.ts office-supplies.spec.ts

# Reports test
npx playwright test reports.spec.ts

# Permissions test
npx playwright test permissions-rbac.spec.ts

# Mobile test
npx playwright test mobile-responsive.spec.ts
```

### UI Mode (Interactive / Interaktif)
```bash
npx playwright test --ui
```

---

## Test Coverage Summary / Ringkasan Cakupan Test

| Category | Existing Files | New Files | Total |
|----------|----------------|-----------|-------|
| Authentication | 1 | 3 | 4 |
| Admin Features | 0 | 2 | 2 |
| CRUD Operations | 0 | 2 | 2 |
| Reports | 0 | 1 | 1 |
| Security/RBAC | 1 | 1 | 2 |
| Mobile/Responsive | 0 | 1 | 1 |
| Other | 5 | 0 | 5 |
| **TOTAL** | **8** | **10** | **18** |

---

## Severity Temuan (Panduan)
- Critical: alur inti (login, transaksi, approval) gagal total atau data corrupt.
- High: fitur utama gagal pada kondisi umum.
- Medium: edge case atau integrasi minor.
- Low: UI/UX, copy, minor flakiness.
