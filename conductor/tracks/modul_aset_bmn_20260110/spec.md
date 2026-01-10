# Spec: Modul Aset (BMN)

## Overview
Track ini membangun Modul Aset BMN untuk pendataan dan monitoring aset berdasarkan format **SIMAN (Sistem Informasi Manajemen Aset Negara)**. Aset di-input melalui import file JSON (format SIMAN), dilengkapi fitur tracking lokasi, perawatan, dan update kondisi.

## Goals
1. Master data aset sesuai format SIMAN (kode barang, kondisi, status, nilai)
2. Import bulk data aset dari JSON (format SIMAN)
3. Monitoring aset: lokasi, kondisi, perawatan
4. Tracking history pergerakan dan perubahan kondisi
5. Pencarian dan filter aset

## Dependencies
- Backend: Laravel 12, Spatie Permissions
- Frontend: React 19, Inertia.js v2, shadcn/ui, MagicUI
- Data: locations, departments, users (sudah ada dari track sebelumnya)
- Source Data: `docs/data_simplified.json` (format SIMAN)

---

## Scope

### In Scope

#### 1. Database & Model

**Assets Table:**
| Field | Type | Description | Source |
|-------|------|-------------|--------|
| `id` | ULID | Primary key | Local |
| `id_aset` | BIGINT | ID Aset dari SIMAN | SIMAN |
| `kd_brg` | VARCHAR(20) | Kode Barang (10 digit) | SIMAN |
| `no_aset` | INTEGER | Nomor Aset | SIMAN |
| `kode_register` | VARCHAR(50) | Kode Register | SIMAN |
| `nama` | VARCHAR(255) | Nama Aset | SIMAN |
| `merk` | VARCHAR(100) | Merk | SIMAN |
| `tipe` | VARCHAR(100) | Tipe | SIMAN |
| `ur_sskel` | TEXT | Uraian Sub Kelompok | SIMAN |
| `kd_jns_bmn` | INTEGER | Kode Jenis BMN | SIMAN |
| `kd_kondisi` | VARCHAR(2) | Kode Kondisi (1,2,3) | SIMAN |
| `ur_kondisi` | VARCHAR(50) | Uraian Kondisi | SIMAN |
| `kd_status` | VARCHAR(5) | Kode Status | SIMAN |
| `ur_status` | TEXT | Uraian Status | SIMAN |
| `tercatat` | VARCHAR(5) | Status Tercatat | SIMAN |
| `rph_aset` | DECIMAL(15,2) | Nilai Aset | SIMAN |
| `rph_susut` | DECIMAL(15,2) | Nilai Penyusutan | SIMAN |
| `rph_buku` | DECIMAL(15,2) | Nilai Buku | SIMAN |
| `rph_perolehan` | DECIMAL(15,2) | Nilai Perolehan | SIMAN |
| `tgl_perlh` | DATE | Tanggal Perolehan | SIMAN |
| `tgl_rekam` | DATE | Tanggal Rekam | SIMAN |
| `tgl_rekam_pertama` | DATE | Tanggal Rekam Pertama | SIMAN |
| `lokasi_ruang` | VARCHAR(100) | Lokasi Ruangan (SIMAN) | SIMAN |
| `lokasi_id` | ULID | Foreign key ke locations (local) | Local |
| `asl_perlh` | VARCHAR(100) | Asal Perolehan | SIMAN |
| `kd_satker` | VARCHAR(50) | Kode Satker | SIMAN |
| `ur_satker` | VARCHAR(100) | Uraian Satker | SIMAN |
| `jml_photo` | INTEGER | Jumlah Foto | SIMAN |
| `umur_sisa` | INTEGER | Umur Sisa (tahun) | SIMAN |
| `penanggung_jawab_id` | ULID | Foreign key ke users | Local |
| `soft_deletes` | - | Untuk audit trail | Laravel |

**AssetHistories Table (Tracking Pergerakan):**
- `id` - ULID
- `asset_id` - Foreign key
- `lokasi_id_lama` - Foreign key (lokasi sebelumnya)
- `lokasi_id_baru` - Foreign key (lokasi baru)
- `user_id` - Foreign key (user yang memindahkan)
- `keterangan` - TEXT
- `created_at` - Timestamp

**AssetMaintenances Table (Perawatan):**
- `id` - ULID
- `asset_id` - Foreign key
- `jenis_perawatan` - VARCHAR(100)
- `tanggal` - DATE
- `biaya` - DECIMAL(15,2)
- `pelaksana` - VARCHAR(100)
- `keterangan` - TEXT
- `created_at` - Timestamp

**AssetConditionLogs Table (Log Perubahan Kondisi):**
- `id` - ULID
- `asset_id` - Foreign key
- `kd_kondisi_lama` - VARCHAR(2)
- `kd_kondisi_baru` - VARCHAR(2)
- `ur_kondisi_lama` - VARCHAR(50)
- `ur_kondisi_baru` - VARCHAR(50)
- `alasan` - TEXT
- `user_id` - Foreign key
- `created_at` - Timestamp

#### 2. Import Features
- Upload file JSON (format SIMAN: `{metadata, data}`)
- Validate structure JSON sesuai format SIMAN
- Validate required fields: `kd_brg`, `nama`, `kd_kondisi`, `rph_aset`
- Preview data sebelum konfirmasi import (show first 50 records)
- Import dengan progress indicator
- Error handling dan reporting:
  - Skip invalid records, continue with valid ones
  - Report summary: success count, error count, error details
- Support batch import (chunk processing 100 records per batch)
- Map `lokasi_ruang` dari SIMAN ke `lokasi_id` (create if not exists)
- Map `penanggung_jawab` (optional, bisa di-assign nanti)

#### 3. Display & View

**List View (Responsive):**
- Desktop/Tablet: Table dengan kolom:
  - Kode Barang (`kd_brg`)
  - Nama Aset (`nama`)
  - Lokasi (`lokasi_ruang` atau `lokasi_id`)
  - Kondisi (`ur_kondisi`)
  - Nilai Aset (`rph_aset` - format Rupiah)
- Mobile: Card view dengan info ringkas
- Pagination (default 50 per page)
- Search by: Nama barang, Kode barang
- Filter by: Lokasi, Kondisi, Kode Status
- Sortable columns

**Detail View:**
- Full info aset (dari field SIMAN)
- History pergerakan (timeline)
- Riwayat perawatan
- Log perubahan kondisi
- Tombol aksi (Update Lokasi, Update Kondisi, Input Perawatan)

#### 4. Update Features (Operator BMN only)

**Update Lokasi:**
- Pindahkan aset ke lokasi baru (dari tabel locations)
- Input keterangan perpindahan
- Update `lokasi_id` (tetap keep `lokasi_ruang` dari SIMAN)
- Auto-record ke AssetHistories

**Update Kondisi:**
- Ubah kondisi aset (`kd_kondisi`: 1=Baik, 2=Rusak Ringan, 3=Rusak Berat)
- Input alasan perubahan
- Update `kd_kondisi` dan `ur_kondisi`
- Auto-record ke AssetConditionLogs

**Input Perawatan:**
- Form input perawatan baru
- Jenis, tanggal, biaya, pelaksana, keterangan
- Auto-record ke AssetMaintenances

**Update Penanggung Jawab:**
- Assign user sebagai penanggung jawab aset
- Optional, bisa di-assign nanti

#### 5. Permissions (Spatie)
| Role | View List | View Detail | Update Lokasi | Update Kondisi | Input Perawatan | Import | Update Penanggung Jawab |
|------|-----------|-------------|---------------|----------------|-----------------|--------|------------------------|
| Operator BMN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Kasubag Umum | ✅ | ✅ | ✅ (Approval) | ✅ (Approval) | - | - | ✅ |
| KPA | ✅ | ✅ | - | - | - | - | - |
| Pegawai | ✅ | ✅ | - | - | - | - | - |

#### 6. API Endpoints (Inertia)
- `GET /assets` - List aset dengan filter/search
- `GET /assets/{id}` - Detail aset
- `GET /assets/import` - Halaman import
- `POST /assets/import` - Upload & import file JSON
- `POST /assets/{id}/update-location` - Update lokasi
- `POST /assets/{id}/update-condition` - Update kondisi
- `POST /assets/{id}/maintenance` - Input perawatan
- `POST /assets/{id}/assign-handler` - Assign penanggung jawab
- `GET /assets/{id}/histories` - Get history pergerakan
- `GET /assets/{id}/maintenances` - Get riwayat perawatan

### Out of Scope
- CRUD individual (create/edit manual) - hanya import
- Upload foto aset (field `jml_photo` dari SIMAN, track foto terpisah)
- Export SAKTI/SIMAN (format DB sudah sesuai)
- Delete permanen (soft delete saja untuk audit)
- Barcode/QR Code generation (track terpisah)
- Edit field SIMAN asli (hanya field lokal: lokasi_id, penanggung_jawab_id, tracking)

---

## Technical Implementation Details

### Directory Structure
```
app/
├── Models/
│   ├── Asset.php
│   ├── AssetHistory.php
│   ├── AssetMaintenance.php
│   └── AssetConditionLog.php
├── Http/
│   ├── Controllers/
│   │   └── AssetController.php
│   └── Requests/
│       ├── ImportAssetRequest.php
│       ├── UpdateLocationRequest.php
│       ├── UpdateConditionRequest.php
│       ├── StoreMaintenanceRequest.php
│       └── AssignHandlerRequest.php
resources/js/
├── Pages/
│   └── Assets/
│       ├── Index.tsx
│       ├── Show.tsx
│       └── Import.tsx
├── Components/
│   └── Assets/
│       ├── AssetTable.tsx
│       ├── AssetCard.tsx
│       ├── AssetDetail.tsx
│       ├── AssetSummary.tsx
│       ├── UpdateLocationForm.tsx
│       ├── UpdateConditionForm.tsx
│       ├── MaintenanceForm.tsx
│       └── AssignHandlerForm.tsx
database/
├── migrations/
│   ├── xxx_create_assets_table.php
│   ├── xxx_create_asset_histories_table.php
│   ├── xxx_create_asset_maintenances_table.php
│   └── xxx_create_asset_condition_logs_table.php
```

### Import Format (JSON dari SIMAN)
Format mengikuti `docs/data_simplified.json`:
```json
{
  "metadata": {
    "generated_at": "2026-01-10T15:02:42.556Z",
    "total_records": 350,
    "fields": [...]
  },
  "data": [
    {
      "id_aset": 104155109,
      "kd_brg": "2010104026",
      "no_aset": 1,
      "kode_register": "E106A688E2D7A008E0531161F20AA364",
      "nama": "Tanah Pemkab Penajam Paer Utara",
      "merk": "Tanah Pemkab Penajam Paer Utara",
      "tipe": null,
      "ur_sskel": "Tanah Bangunan Gedung Kantor Pengadilan",
      "kd_jns_bmn": 1,
      "kd_kondisi": "1",
      "ur_kondisi": "Baik",
      "kd_status": "02",
      "ur_status": "Digunakan sendiri untuk operasional",
      "tercatat": "-2",
      "rph_aset": 2399692000,
      "rph_susut": 0,
      "rph_buku": 2399692000,
      "rph_perolehan": 2399692000,
      "tgl_perlh": "2015-08-11",
      "tgl_rekam": "2025-05-28",
      "tgl_rekam_pertama": "2015-08-11",
      "lokasi_ruang": "Belum berlokasi",
      "asl_perlh": "Perolehan Migrasi SIMAK",
      "kd_satker": "005011600401877000KD",
      "ur_satker": "PENGADILAN AGAMA PENAJAM",
      "jml_photo": 1,
      "umur_sisa": 0
    }
  ]
}
```

### Import Processing
1. Validate JSON structure (must have `metadata` and `data`)
2. Validate each record's required fields
3. Map `lokasi_ruang`:
   - Cek apakah lokasi sudah ada di tabel locations
   - Jika belum ada, create new location dengan `nama_ruangan` = `lokasi_ruang`
   - Assign `lokasi_id` ke asset
4. Chunk processing (100 records per batch)
5. Transaction per chunk
6. Progress feedback via session/polling
7. Rollback chunk jika ada error
8. Report summary: success count, error count, error details

### Kode Kondisi Mapping
| `kd_kondisi` | `ur_kondisi` |
|-------------|-------------|
| 1 | Baik |
| 2 | Rusak Ringan |
| 3 | Rusak Berat |

### Responsive Table/Card
- Tailwind breakpoints:
  - `hidden md:table-row` - show rows on desktop+
  - `md:hidden` - show cards on mobile only
- Card displays: Kode, Nama, Lokasi, Kondisi, Nilai (formatted)

### Integration dengan shadcn/ui
- Table: `@shadcn/table`
- Card: `@shadcn/card`
- Form components: `@shadcn/input`, `@shadcn/select`, `@shadcn/textarea`
- Upload: File input dengan drag-drop
- Dialog: `@shadcn/dialog` untuk forms update
- Alert: `@shadcn/sonner` untuk notifications
- Skeleton: `@shadcn/skeleton` untuk loading states
