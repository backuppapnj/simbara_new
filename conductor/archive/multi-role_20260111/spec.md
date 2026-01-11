# Multi-Role Management Feature

## Overview
Menambahkan kemampuan bagi satu user (pegawai) untuk memiliki lebih dari satu role secara simultan. Fitur ini akan diakses melalui halaman Role Management khusus yang memungkinkan super_admin untuk mengelola role assignments pada user.

## Functional Requirements

### 1. Role Management Page
- Halaman khusus `/admin/roles` untuk mengelola role assignments
- Menampilkan daftar semua roles dengan jumlah user yang memiliki role tersebut
- Klik pada role untuk melihat dan mengelola users yang memiliki role tersebut

### 2. Role Assignment UI
- Per role: Tampilkan list users dengan checkbox untuk multiple selection
- Semua role ditampilkan dengan checkbox (kecuali super_admin yang exclusive)
- Tombol Save untuk menyimpan perubahan role assignments
- Search/filter users untuk memudahkan pencarian

### 3. Authorization
- Hanya `super_admin` yang dapat mengakses halaman Role Management
- Hanya `super_admin` yang dapat menambah/menghapus role pada user lain

### 4. Business Rules
- User dapat memiliki kombinasi role apa saja secara bebas
- **Exception**: Role `super_admin` bersifat exclusive
  - User dengan role `super_admin` tidak dapat memiliki role lain
  - Jika user diberi role `super_admin`, semua role lain dihapus otomatis
  - Jika role `super_admin` dihapus dari user, user bisa memiliki role lain

### 5. Data Persistence
- Menggunakan Spatie Laravel Permission (sudah terinstall)
- Table `model_has_roles` menyimpan many-to-many relationship
- Perubahan role langsung aktif tanpa perlu notifikasi

## Non-Functional Requirements

### Performance
- Loading halaman Role Management < 500ms
- Save role assignments < 1 second

### User Experience
- Responsive design untuk mobile dan desktop
- Clear visual feedback saat role ditambah/dihapus
- Confirmation dialog untuk menghapus role dari user

## Acceptance Criteria

1. **AC1**: Super Admin dapat mengakses halaman Role Management di `/admin/roles`
2. **AC2**: Super Admin dapat melihat daftar semua roles dengan jumlah user per role
3. **AC3**: Super Admin dapat melihat list users untuk setiap role
4. **AC4**: Super Admin dapat menambahkan role ke user dengan checkbox multi-select
5. **AC5**: Super Admin dapat menghapus role dari user dengan menghapus checklist
6. **AC6**: System mencegah user memiliki role `super_admin` bersamaan dengan role lain
7. **AC7**: User selain super_admin tidak dapat mengakses halaman Role Management (403)
8. **AC8**: Perubahan role tersimpan di database dan langsung aktif

## Out of Scope

- Role creation/deletion (roles sudah pre-defined: super_admin, kpa, kasubag_umum, operator_bmn, operator_persediaan, pegawai)
- Permission management per role
- Audit trail untuk perubahan role (bisa ditambahkan di fase berikutnya)
- Self-service role assignment (user tidak bisa assign role ke diri sendiri)
