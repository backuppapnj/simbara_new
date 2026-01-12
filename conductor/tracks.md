# Project Tracks

This file tracks all major tracks for the project. Each track has its own detailed plan in its respective folder.

---

## 🚧 Active Tracks

### [~] Perbaikan Masalah Test E2E
**Description:** Perbaikan menyeluruh suite test E2E Playwright - 67+ masalah teridentifikasi
**Location:** [./conductor/tracks/e2e-fix_20250112/](./conductor/tracks/e2e-fix_20250112/)

---

## 📁 Completed Tracks (Archived)

All completed tracks have been moved to `conductor/archive/`.

### [x] Frontend UI Foundation ✅
**Description:** Setup UI components, layouts, authentication pages (login/register), dashboard
**Location:** [./conductor/archive/frontend_ui_foundation_20260110/](./conductor/archive/frontend_ui_foundation_20260110/)

### [x] Modul Aset (BMN) ✅
**Description:** Pendataan aset, klasifikasi Kemenkeu 14 digit, tracking lokasi, foto, export SAKTI/SIMAN
**Location:** [./conductor/archive/modul_aset_bmn_20260110/](./conductor/archive/modul_aset_bmn_20260110/)

### [x] Modul Persediaan ATK ✅
**Description:** Workflow pengadaan, permintaan 3-level approval, kartu stok, stock opname
**Location:** [./conductor/archive/modul_persediaan_atk_20260110/](./conductor/archive/modul_persediaan_atk_20260110/)

### [x] Modul Bahan Keperluan Kantor ✅
**Description:** Pencatatan pembelian & pemakaian (sederhana)
**Location:** [./conductor/archive/modul_bahan_kantor_20260110/](./conductor/archive/modul_bahan_kantor_20260110/)

### [x] Integrasi WhatsApp ✅
**Description:** Notifikasi via Fonnte API
**Location:** [./conductor/archive/whatsapp_integration_20260110/](./conductor/archive/whatsapp_integration_20260110/)

### [x] PWA & Mobile Features ✅
**Description:** Camera access, installable PWA
**Location:** [./conductor/archive/pwa_mobile_20260111/](./conductor/archive/pwa_mobile_20260111/)

### [x] Multi-Role Management ✅
**Description:** Tambah fitur multi-role untuk user agar 1 pegawai bisa memiliki lebih dari satu role
**Location:** [./conductor/archive/multi-role_20260111/](./conductor/archive/multi-role_20260111/)

### [x] RBAC Management ✅
**Description:** Role-Based Access Control dengan permission dinamis, granular, dan lengkap
**Location:** [./conductor/archive/rbac_20260111/](./conductor/archive/rbac_20260111/)

### [x] RBAC Refinement ✅
**Description:** Remove users.view, roles.manage, settings.whatsapp dari kasubag_umum, hanya super_admin yang punya permission sistem
**Location:** [./conductor/archive/rbac_refinement_20260111/](./conductor/archive/rbac_refinement_20260111/)

### [x] User Management UI ✅
**Description:** User Management UI - Membuat antarmuka pengelolaan user (CRUD, Role Assignment, Impersonate, Audit Log)
**Location:** [./conductor/archive/user_management_ui_20260113/](./conductor/archive/user_management_ui_20260113/)

---

## 📊 Project Status

**Overall Progress:** 91% COMPLETE (1 active track)
**Total Tracks:** 11 (10 completed, 1 active)
**Tests:** 1036 passing (UserController: 17, AuditLog: 29, ImpersonateMiddleware: 8, RoleSync: 11, etc.)
**Status:** IN DEVELOPMENT - E2E test fixes in progress
