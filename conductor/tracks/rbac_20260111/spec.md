# RBAC (Role-Based Access Control) Management

## Overview
Sistem manajemen permission yang lengkap dan dinamis untuk mengatur akses setiap role ke berbagai fitur aplikasi. Permission didefinisikan secara dinamis di database dan dapat di-assign ke role melalui UI. Implementasi authorization menggunakan kombinasi middleware, policy, dan directive.

## Functional Requirements

### 1. Permission Structure (Hybrid Grouping)

Permissions dikelompokkan berdasarkan modul dengan nama format: `{module}.{action}`

**Modul Aset (BMN):**
- `assets.view` - Melihat daftar aset
- `assets.create` - Menambah aset baru
- `assets.edit` - Mengedit data aset
- `assets.delete` - Menghapus aset
- `assets.photos.manage` - Kelola foto aset
- `assets.locations.update` - Update lokasi aset
- `assets.condition.update` - Update kondisi aset
- `assets.maintenance.manage` - Kelola perawatan
- `assets.histories.view` - Lihat riwayat aset
- `assets.export` - Export data (SAKTI/SIMAN)

**Modul ATK (Persediaan):**
- `atk.view` - Melihat daftar ATK
- `atk.create` - Menambah ATK baru
- `atk.edit` - Mengedit data ATK
- `atk.delete` - Menghapus ATK
- `atk.stock.view` - Melihat stok
- `atk.mutations.view` - Melihat mutasi stok
- `atk.requests.create` - Buat permintaan
- `atk.requests.view` - Lihat daftar permintaan
- `atk.requests.approve` - Approve permintaan (multi-level)
- `atk.requests.distribute` - Distribusi barang
- `atk.reports.view` - Lihat laporan
- `atk.reports.export` - Export laporan

**Modul Bahan Kantor:**
- `office.view` - Melihat daftar bahan
- `office.create` - Menambah bahan baru
- `office.edit` - Mengedit data bahan
- `office.delete` - Menghapus bahan
- `office.requests.create` - Buat permintaan
- `office.requests.approve` - Approve permintaan
- `office.usage.log` - Catat pemakaian

**Modul Users & Roles:**
- `users.view` - Melihat daftar user
- `users.create` - Menambah user
- `users.edit` - Mengedit user
- `users.delete` - Menghapus user
- `roles.manage` - Kelola role (assign ke user)
- `permissions.manage` - Kelola permission (assign ke role)

**Modul Settings:**
- `settings.whatsapp` - Kelola pengaturan WhatsApp
- `settings.notifications` - Kelola notifikasi
- `settings.appearance` - Kelola tampilan

### 2. Permission Management UI

**Halaman Role Detail dengan Tabs:**
- **Tab "Users"**: List user yang memiliki role ini (dari track multi-role)
- **Tab "Permissions"**: List permission yang di-assign ke role ini dengan checkbox multi-select

**Fitur Permission Management:**
- Create new permission via UI (tambah permission baru)
- Edit permission name/description
- Delete permission (hanya jika tidak digunakan)
- Group permissions by module untuk navigasi mudah
- Search/filter permissions

### 3. Role-Permission Mapping

Setiap role memiliki permission default:

**super_admin**: Semua permissions ( wildcard permission `*` )

**kpa**:
- Semua `*.view`
- Semua `*.reports.view`
- Semua `*.reports.export`
- `atk.requests.approve` (level 3)
- `office.requests.approve`

**kasubag_umum**:
- Semua `assets.*`
- Semua `atk.*`
- Semua `office.*`
- `users.view`
- `roles.manage`
- `settings.whatsapp`

**operator_bmn**:
- Semua `assets.*`
- `atk.view`
- `atk.stock.view`
- `office.view`

**operator_persediaan**:
- `assets.view`
- Semua `atk.*`
- Semua `office.*`
- `atk.requests.approve` (level 1)

**pegawai**:
- `assets.view`
- `atk.view`
- `atk.stock.view`
- `office.view`
- `atk.requests.create`
- `office.requests.create`

### 4. Authorization Implementation

**4.1 Middleware Route:**
```php
Route::delete('/assets/{id}', [AssetController::class, 'destroy'])
    ->middleware('permission:assets.delete');
```

**4.2 Policy Class:**
```php
// AssetPolicy
public function delete(User $user, Asset $asset): bool
{
    return $user->can('assets.delete') || $user->hasRole('super_admin');
}
```

**4.3 Blade/Inertia Directive:**
```tsx
{user.can('assets.delete') && <Button>Delete</Button>}
// atau
{!! Gate::allows('assets.delete') !!}
```

### 5. Dynamic Permission CRUD

**Create Permission:**
- Form dengan input: name, module, description
- Auto-generate permission name: `{module}.{action}`
- Validation untuk unique name

**Edit Permission:**
- Update name dan description
- Re-assign ke roles jika diperlukan

**Delete Permission:**
- Soft delete atau hard delete
- Cek apakah permission sedang digunakan oleh role
- Konfirmasi dialog sebelum hapus

### 6. Permission Seeder

Seeding otomatis semua default permissions:
- Buat ~50+ permissions sesuai struktur di atas
- Assign ke role sesuai mapping default
- Bisa di-run ulang dengan `--seeder` option

## Non-Functional Requirements

### Performance
- Loading permission list < 500ms
- Permission check (via middleware/policy) < 10ms
- Cache permission untuk super_admin (always true)

### Security
- Hanya super_admin yang bisa CRUD permissions
- Permission check tidak bisa dibypass
- Auto-cache permission oleh Spatie package

### User Experience
- Clear grouping by module
- Search permission by name
- Visual feedback saat permission di-assign
- Warning ketika menghapus permission yang sedang digunakan

## Acceptance Criteria

1. **AC1**: Super Admin dapat melihat tab "Permissions" di halaman role detail
2. **AC2**: Super Admin dapat create/edit/delete permissions via UI
3. **AC3**: Super Admin dapat assign permission ke role dengan checkbox
4. **AC4**: Permission di-group by module untuk navigasi mudah
5. **AC5**: Permission check via middleware berfungsi (403 jika tidak punya akses)
6. **AC6**: Permission check via Policy berfungsi
7. **AC7**: Permission check via Blade directive berfungsi
8. **AC8**: Seeder membuat semua default permissions dan mapping
9. **AC9**: Permission dinamis tersimpan di database dan bisa ditambah
10. **AC10**: User selain super_admin tidak bisa akses permission management (403)

## Out of Scope

- Permission revocation dari user individual (role-based only, not user-based)
- Temporary permission (permission dengan expiry)
- Permission inheritance (role inherits from another role)
- Audit trail untuk perubahan permission (bisa di fase berikutnya)
