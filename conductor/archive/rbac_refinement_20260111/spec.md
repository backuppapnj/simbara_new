# Spec: Refinement RBAC dan Permissions Sistem

## Overview

Refinement menyeluruh terhadap sistem Role-Based Access Control (RBAC) pada aplikasi Manajemen Aset dan Persediaan untuk Pengadilan Agama Penajam. Perubahan ini bertujuan memisahkan tanggung jawab operasional dari administratif sistem, menerapkan prinsip least privilege, dan menyesuaikan dengan struktur organisasi saat ini.

## Background

Sistem RBAC saat ini telah diimplementasikan dengan 6 roles utama:
1. `super_admin` - Akses penuh
2. `kpa` - Kuasa Pengguna Anggaran
3. `kasubag_umum` - Kepala Subbagian Umum
4. `operator_bmn` - Operator Barang Milik Negara
5. `operator_persediaan` - Operator Persediaan ATK
6. `pegawai` - Pegawai umum

Berdasarkan feedback dan review terhadap kebutuhan organisasi:
- Role `kasubag_umum` seharusnya fokus pada operasional aset dan persediaan
- Tugas administratif sistem (user management, role management, settings) seharusnya hanya menjadi tanggung jawab `super_admin`
- Workflow approval 3-level harus tetap berfungsi tanpa melibatkan kasubag_umum dalam approval ATK

## Functional Requirements

### FR-1: Review dan Update Permissions per Role

Setiap role harus ditinjau ulang permissions-nya:

#### 1.1 super_admin
- Memiliki semua permissions (`*`)
- Satu-satunya role dengan akses ke:
  - `users.view`, `users.create`, `users.edit`, `users.delete`, `users.activate`, `users.deactivate`
  - `roles.view`, `roles.manage`
  - `permissions.view`, `permissions.manage`
  - `settings.view`, `settings.whatsapp`, `settings.general`

#### 1.2 kasubag_umum
- Fokus pada operasional aset dan persediaan
- **MENGHAPUS** permissions:
  - `users.view`
  - `roles.manage`
  - `settings.whatsapp`
- **MEMPERTAHANKAN** permissions:
  - `assets.*` (CRUD lengkap aset)
  - `atk.*` (CRUD lengkap ATK)
  - `office.*` (CRUD lengkap perlengkapan kantor)

#### 1.3 operator_persediaan
- Review dan verifikasi permissions sudah sesuai:
  - `assets.view` (view saja)
  - `atk.*` (CRUD lengkap ATK)
  - `office.*` (CRUD lengkap perlengkapan)
  - `atk.requests.approve` (Level 1 approval)

#### 1.4 operator_bmn
- Review dan verifikasi permissions:
  - `assets.*` (CRUD lengkap aset)
  - `atk.view`, `atk.stock.view` (view saja)
  - `office.view` (view saja)

#### 1.5 kpa
- Review dan verifikasi permissions untuk approval dan reporting:
  - `*.view`, `*.reports.view`, `*.reports.export`
  - `atk.requests.approve`, `office.requests.approve`

#### 1.6 pegawai
- Review dan verifikasi permissions:
  - `assets.view`, `atk.view`, `atk.stock.view`, `office.view`
  - `atk.requests.create`, `office.requests.create`

### FR-2: Update DatabaseSeeder

File `database/seeders/DatabaseSeeder.php` harus diupdate untuk:
- Memastikan urutan eksekusi seeder yang benar
- Roles dibuat sebelum Permissions
- Permissions diset sesuai mapping baru

### FR-3: Update PermissionsSeeder

File `database/seeders/PermissionsSeeder.php` harus diupdate:
- Array `rolePermissions` diubah sesuai requirements di FR-1
- Menghapus `users.view`, `roles.manage`, `settings.whatsapp` dari `kasubag_umum`

### FR-4: Verifikasi Workflow Approval

Workflow approval 3-level untuk permintaan ATK harus tetap berfungsi:
1. Pegawai buat request
2. Operator Persediaan approve (Level 1)
3. KPA approve final (Level 3)
- Tanpa melibatkan kasubag_umum dalam approval

## Non-Functional Requirements

### NFR-1: Security
- Menerapkan prinsip least privilege
- Setiap role hanya memiliki akses minimal yang diperlukan

### NFR-2: Backward Compatibility
- Data pegawai existing tidak boleh terpengaruh
- 1019 existing tests harus tetap passing

### NFR-3: Integration
- Kompatibilitas dengan Fonnte WhatsApp API
- Kompatibilitas dengan SAKTI/SIMAN untuk export

## Acceptance Criteria

### AC-1: Permissions Terupdate
- [ ] Role `kasubag_umum` tidak memiliki permissions `users.view`, `roles.manage`, `settings.whatsapp`
- [ ] Role `super_admin` adalah satu-satunya role dengan permissions terkait sistem administratif

### AC-2: Workflow Approval Berfungsi
- [ ] Workflow approval 3-level berfungsi: Operator → KPA
- [ ] Request ATK bisa dibuat oleh Pegawai
- [ ] Request ATK bisa di-approve Level 1 oleh Operator Persediaan
- [ ] Request ATK bisa di-approve final oleh KPA

### AC-3: Test Coverage
- [ ] Semua 1019 existing tests passing
- [ ] Tidak ada tests yang broken setelah perubahan

### AC-4: Dokumentasi
- [ ] Dokumentasi RBAC diupdate (jika ada di `conductor/` atau `docs/`)

## Out of Scope

- Perubahan pada struktur database (tabel users, roles, permissions)
- Perubahan pada middleware atau policies (hanya permissions yang disesuaikan)
- Perubahan pada UI/frontend (hanya permissions backend)
- Implementasi fitur baru di luar scope RBAC

## Risks & Mitigations

### Risk 1: Test Failures
- **Risk**: 1019 tests mungkin gagal karena permissions berubah
- **Mitigation**: Jalankan test suite secara bertahap, perbaiki test yang broken karena permissions

### Risk 2: Broken Workflow
- **Risk:** Workflow approval mungkin tidak berfungsi jika permissions tidak tepat
- **Mitigation:** Verifikasi manual workflow approval setelah perubahan

### Risk 3: Existing Users
- **Risk:** User yang sedang menggunakan sistem mungkin kehilangan akses
- **Mitigation:** Gunakan `firstOrCreate` di seeder untuk preserve existing users

## Dependencies

- Database migration (jika ada perubahan struktur)
- Existing test suite harus bisa dijalankan
- PermissionsSeeder harus berjalan dengan benar

## Notes

- Perubahan ini terkait dengan diskusi sebelumnya tentang distribusi role pegawai
- Operator Persediaan (ASHAR) sudah ditetapkan berdasarkan user Sakti Kemenkeu
- Distribusi final users: 1 super_admin, 1 kpa, 1 kasubag_umum, 1 operator_bmn, 1 operator_persediaan, 25 pegawai
