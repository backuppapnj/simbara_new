# Spec: User Management UI

## Overview
Track ini membuat antarmuka pengelolaan user (User Management UI) lengkap untuk sistem. Backend foundation (User model, database, permissions) sudah ada dari track sebelumnya, namun UI untuk CRUD user belum diimplementasikan.

Track ini memungkinkan super_admin untuk mengelola user sistem secara penuh melalui antarmuka web.

## Goals
1. Halaman daftar user dengan pencarian, filter, dan pagination
2. Halaman detail user untuk melihat dan mengedit data user
3. Form create user dengan validasi lengkap
4. Operasi delete dan restore user (soft-delete)
5. Manajemen role assignment dari halaman user
6. Fitur impersonate untuk debugging/support
7. Audit log untuk semua aktivitas user management

## Dependencies
- Laravel 12
- React 19 + Inertia.js v2
- Spatie Laravel Permission (already installed)
- User Model dengan fields: phone, nip, position, is_active (already exists)
- Permissions: users.view, users.create, users.edit, users.delete (already defined)

---

## Scope

### In Scope
- **User Index Page** (`/admin/users`)
  - Tabel daftar user dengan pagination (20/50/100 per halaman)
  - Pencarian by: name, email, NIP
  - Filter by: role, status (active/inactive), department
  - Sorting by kolom: name, email, created_at, etc.
  - Export data ke Excel/CSV

- **User Detail Page** (`/admin/users/{id}`)
  - Tab "Info": Menampilkan dan mengedit data user
  - Tab "Roles": Assign/remove role (multi-role support)
  - Tab "Activity Log": Riwayat aktivitas user
  - Tombol aksi: Edit, Delete, Impersonate

- **Create User Modal/Page** (`/admin/users/create`)
  - Form input: name, email, phone, nip, position, department, password
  - Assign role(s) saat create
  - Validasi lengkap

- **Edit User Modal/Page** (`/admin/users/{id}/edit`)
  - Edit semua field user
  - Reset password
  - Toggle status is_active
  - Manage email_verified_at

- **Delete User**
  - Soft-delete dengan konfirmasi
  - Restore user yang dihapus

- **Impersonate User**
  - Login sebagai user lain
  - Return to super_admin setelah selesai

- **Audit Log**
  - Catat semua aktivitas: create, edit, delete, assign role
  - Informasi: siapa (actor), kapan (timestamp), apa yang diubah (changes)

### Out of Scope
- User self-profile management (sudah ada di halaman profile)
- User registration (sudah ada via Fortify)
- Password reset flow (sudah ada via Fortify)
- Audit log untuk aktivitas selain user management

---

## Data Model

### User Model (existing)
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `name` | VARCHAR | Full name |
| `email` | VARCHAR | Email address (unique) |
| `phone` | VARCHAR | Phone number Indonesia format |
| `nip` | VARCHAR | Nomor induk pegawai (unique) |
| `position` | VARCHAR | Jabatan |
| `is_active` | BOOLEAN | Status aktif user |
| `email_verified_at` | TIMESTAMP | Email verification timestamp |
| `password` | VARCHAR | Encrypted password |

### User-Role Relationship (many-to-many, existing)
- Satu user bisa memiliki multiple role
- Dikelola via Spatie Laravel Permission

---

## Functional Requirements

### 1. User Index Page

**Routing:**
- `GET /admin/users` - Halaman daftar user
- Middleware: `auth`, `permission:users.view`

**Permissions:**
- Hanya `super_admin` yang bisa akses

**Features:**
1. **Tabel User** dengan kolom:
   - Checkbox (untuk bulk action - optional)
   - Name (dengan avatar inisial)
   - Email
   - NIP
   - Phone
   - Position
   - Department (jika ada relasi)
   - Roles (badge list)
   - Status (Active/Inactive badge)
   - Created At
   - Actions (Edit, Delete, Impersonate buttons)

2. **Pencarian:**
   - Search by name, email, NIP
   - Real-time search dengan debouncing

3. **Filter:**
   - By Role: dropdown semua role
   - By Status: Active, Inactive, All
   - By Department: dropdown semua department

4. **Pagination:**
   - 20/50/100 per halaman
   - Show total users

5. **Sorting:**
   - Click column header untuk sort
   - Ascending/descending

6. **Export:**
   - Button "Export Excel/CSV"
   - Export data sesuai filter & search aktif

### 2. User Detail Page

**Routing:**
- `GET /admin/users/{id}` - Halaman detail user
- Middleware: `auth`, `permission:users.view`

**Tab Structure:**

**Tab "Info":**
- Tampilkan semua data user
- Tombol "Edit User" untuk buka modal edit
- Informasi yang ditampilkan:
  - Avatar dengan inisial
  - Name
  - Email
  - Phone
  - NIP
  - Position
  - Department
  - Status (Active/Inactive)
  - Roles
  - Email Verified status
  - Created At
  - Updated At

**Tab "Roles":**
- List semua role yang dimiliki user
- Checkbox untuk assign/unassign role
- Real-time update

**Tab "Activity Log":**
- Tabel audit log untuk user ini
- Kolom: Actor, Action, Changes, Timestamp

**Action Buttons:**
- Edit User
- Delete/Restore User
- Impersonate User

### 3. Create User

**Routing:**
- `GET /admin/users/create` - Halaman create user
- `POST /admin/users` - Submit create user
- Middleware: `auth`, `permission:users.create`

**Form Fields:**
- Name (required, text)
- Email (required, email, unique)
- Phone (required, regex +62...)
- NIP (optional, unique jika diisi)
- Position (optional, text)
- Department (optional, dropdown)
- Password (required, min 8 chars, mix letter & number)
- Confirm Password (required, must match)
- Roles (checkbox list, assign minimal 1 role)
- Status (toggle: Active/Inactive, default Active)

**Validasi:**
- Email: unique, valid format
- NIP: unique (jika diisi)
- Phone: Indonesia format (+62 atau 08...)
- Password: minimal 8 karakter, kombinasi huruf & angka
- Required: name, email, password

**On Success:**
- Tampilkan success toast
- Redirect ke halaman detail user yang baru dibuat
- Catat audit log

**No Notification:**
- Tidak kirim email/welcome (admin akan informasikan manual)

### 4. Edit User

**Routing:**
- `GET /admin/users/{id}/edit` - Halaman edit user
- `PUT /admin/users/{id}` - Submit update user
- Middleware: `auth`, `permission:users.edit`

**Form Fields (sama seperti create):**
- Semua field bisa diedit
- Password field optional (kosongkan = tidak diubah)
- Roles bisa di-update

**Additional Options:**
- Toggle "Email Verified" (set email_verified_at)
- Reset Password button (generate random password)

**Validasi:**
- Sama seperti create
- Password hanya divalidasi jika diisi

**On Success:**
- Tampilkan success toast
- Redirect ke halaman detail user
- Catat audit log dengan before/after changes

### 5. Delete User

**Routing:**
- `DELETE /admin/users/{id}` - Soft delete user
- `POST /admin/users/{id}/restore` - Restore user
- Middleware: `auth`, `permission:users.delete`

**Flow:**
1. Klik tombol Delete
2. Tampilkan confirmation dialog:
   - "Apakah Anda yakin ingin menghapus user {name}?"
   - List informasi user yang akan dihapus
3. Confirm → soft delete (set deleted_at)
4. Tampilkan success toast
5. Catat audit log

**Restore:**
- Jika user sudah dihapus, tombol Delete berubah menjadi Restore
- Klik Restore → set deleted_at = null
- Catat audit log

### 6. Role Assignment

**Dari User Detail Page (Tab "Roles"):**
- List semua role yang tersedia
- Checkbox untuk setiap role
- User bisa memiliki multiple role
- Real-time update saat checkbox di-klik

**Permissions:**
- `users.edit` untuk assign/unassign role
- `roles.manage` juga bisa akses (dari halaman Role)

**Audit Log:**
- Catat saat role di-assign atau di-remove
- Format: "Added role {role} to user {user}" atau "Removed role {role} from user {user}"

### 7. Impersonate User

**Routing:**
- `POST /admin/users/{id}/impersonate` - Start impersonating
- `GET /admin/users/stop-impersonate` - Stop impersonating
- Middleware: `auth`, `permission:users.impersonate` (new permission)

**Flow:**
1. Klik tombol "Impersonate" di halaman user detail
2. Session di-switch ke user target
3. Tampilkan banner di atas: "Impersonating {user name} | Stop Impersonating"
4. User bisa menjelajahi aplikasi sebagai user tersebut
5. Klik "Stop Impersonating" untuk kembali ke super_admin

**Security:**
- Hanya super_admin yang bisa impersonate
- Catat audit log: "Impersonated user {user}" dan "Stopped impersonating user {user}"

### 8. Export Data

**Routing:**
- `GET /admin/users/export` - Export user data
- Middleware: `auth`, `permission:users.view`

**Format:**
- Excel (.xlsx)
- CSV

**Data yang di-export:**
- Sesuai filter & search aktif
- Kolom: name, email, phone, nip, position, department, roles, status, created_at

### 9. Audit Log

**Model:**
```php
// Migration
$table->id();
$table->foreignId('user_id'); // target user
$table->foreignId('actor_id'); // siapa yang melakukan aksi
$table->string('action'); // create, update, delete, role_assigned, role_removed, impersonate
$table->json('changes')->nullable(); // before/after data
$table->timestamp('created_at');
```

**Yang dicatat:**
- Create user: actor, target, new user data
- Update user: actor, target, changes (before/after)
- Delete user: actor, target
- Restore user: actor, target
- Role assigned: actor, target, role
- Role removed: actor, target, role
- Impersonate: actor, target, start/stop

**Tampil di:**
- Tab "Activity Log" di halaman user detail

---

## Non-Functional Requirements

### Security
- Hanya `super_admin` yang bisa akses semua fitur
- Permission check di setiap route
- Password tidak boleh ditampilkan di UI (hanya ****)
- Impersonate session harus secure (tidak bisa di-abuse)

### Performance
- Loading daftar user < 1 detik
- Pencarian real-time dengan debouncing 300ms
- Export max 10.000 user (limitasi untuk performance)

### User Experience
- Responsive di mobile & desktop
- Feedback visual untuk semua aksi (toast, modal, loading state)
- Konfirmasi dialog untuk aksi berbahaya (delete, impersonate)
- Error message yang jelas untuk validasi

### Accessibility
- Keyboard navigation
- Screen reader friendly
- ARIA labels untuk form & button

---

## Acceptance Criteria

1. **AC1**: Super_admin dapat mengakses halaman `/admin/users` dan melihat daftar semua user
2. **AC2**: Daftar user dapat dicari by name, email, NIP
3. **AC3**: Daftar user dapat difilter by role, status, department
4. **AC4**: Daftar user dapat di-sort by column header
5. **AC5**: Daftar user memiliki pagination 20/50/100
6. **AC6**: Super_admin dapat membuat user baru dengan form lengkap
7. **AC7**: Validasi form berfungsi (email unique, NIP unique, phone format, password secure)
8. **AC8**: Super_admin dapat mengedit data user termasuk password
9. **AC9**: Super_admin dapat menghapus user (soft-delete) dengan konfirmasi
10. **AC10**: Super_admin dapat meng-restore user yang dihapus
11. **AC11**: Super_admin dapat assign/remove role dari halaman user detail
12. **AC12**: User bisa memiliki multiple role
13. **AC13**: Super_admin dapat impersonate user lain
14. **AC14**: Saat impersonate, banner muncul dan bisa stop impersonate
15. **AC15**: Export data berfungsi (Excel/CSV)
16. **AC16**: Audit log tercatat untuk semua aktivitas
17. **AC17**: Audit log dapat dilihat di tab "Activity Log" user detail
18. **AC18**: User selain super_admin tidak bisa akses halaman ini (403)
19. **AC19**: Responsive & mobile-friendly
20. **AC20**: Code coverage > 80%

---

## Out of Scope

- User self-profile management (sudah ada di `/settings/profile`)
- User registration (sudah ada via Fortify)
- Password reset flow by user (sudah ada via Fortify)
- Audit log untuk aktivitas lain di luar user management
- Hard delete user (selalu soft-delete)
- Impersonate dari user selain super_admin
