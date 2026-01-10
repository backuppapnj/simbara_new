# Spec: Setup Database & User Management Foundation

## Overview
Track ini membangun fondasi sistem dengan setup database, user management, dan authentication yang akan digunakan oleh seluruh modul aplikasi (Aset, ATK, Bahan Kantor).

## Goals
1. Database schema yang solid untuk user management dan reference data
2. Sistem authentication yang aman dengan Fortify
3. Role-based access control dengan Spatie Permission
4. Data awal yang siap untuk development dan testing

## Dependencies
- Laravel 12
- Laravel Fortify v1
- Spatie Laravel Permission
- Database: MySQL/SQLite

---

## Scope

### In Scope
- Migration tables: users, roles, permissions, model_has_roles, role_has_permissions
- Migration tables: locations (ruangan/gedung), departments (unit kerja)
- Konfigurasi Spatie Permission di ServiceProvider
- Custom User model dengan trait HasRoles
- Fortify features configuration (login, register, password reset, 2FA)
- Seeder untuk: roles, permissions, default users, locations, departments
- Unit tests untuk User model dan Permission setup

### Out of Scope
- Frontend UI components (akan di track terpisah)
- API authentication ( Sanctum tidak diperlukan untuk aplikasi ini)
- User profile management features
- Audit logging

---

## Data Model

### Users Table
Extends Laravel default dengan:
- `phone` - VARCHAR(20), untuk notifikasi WhatsApp
- `nip` - VARCHAR(20), nomor induk pegawai
- `position` - VARCHAR(100), jabatan
- `is_active` - BOOLEAN, status aktif

### Locations Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `nama_ruangan` | VARCHAR(100) | Nama ruangan |
| `gedung` | VARCHAR(50) | Nama gedung (opsional) |
| `lantai` | INTEGER | Lantai (opsional) |
| `kapasitas` | INTEGER | Kapasitas ruangan |
| `keterangan` | TEXT | Catatan |

### Departments Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `nama_unit` | VARCHAR(100) | Nama unit kerja |
| `singkat` | VARCHAR(20) | Singkatan (mis: "KEU", "UMUM") |
| `kepala_unit` | VARCHAR(100) | Nama kepala unit |

### Roles (dari Spatie)
| Role | Description | Permissions |
|------|-------------|-------------|
| super_admin | Administrator sistem | All permissions |
| kpa | Kuasa Pengguna Anggaran | View + Report + Approval L3 |
| kasubag_umum | Kepala Sub Bagian Umum | View + Report + CRUD + Approval L2 |
| operator_bmn | Operator BMN | CRUD Aset |
| operator_persediaan | Operator Persediaan | CRUD ATK + Approval L1 |
| pegawai | Pegawai umum | View + Request |

---

## Implementation Details

### Fortify Features
- `Features::registration()` - Enable user registration
- `Features::resetPasswords()` - Enable password reset
- `Features::emailVerification()` - Disable (sesuaikan kebutuhan)
- `Features::twoFactorAuthentication()` - Enable untuk extra security

### Spatie Configuration
- Cache permission untuk performance
- Register permission observer untuk logging
- Custom permission lookup middleware

### Seeders Priority
1. RolesSeeder - Create roles
2. PermissionsSeeder - Create permissions + assign to roles
3. LocationsSeeder - Create rooms/locations
4. DepartmentsSeeder - Create unit kerja
5. UsersSeeder - Create default users + assign roles
