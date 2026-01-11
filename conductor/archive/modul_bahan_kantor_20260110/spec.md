# Spec: Modul Bahan Keperluan Kantor

## Overview
Track ini membangun Modul Bahan Keperluan Kantor dengan workflow sederhana untuk pencatatan pembelian dan pemakaian barang-barang keperluan operasional kantor (gula, teh, kopi, cleaning supplies, dll) yang bukan ATK.

## Goals
1. Master data bahan kantor (consumables, cleaning supplies, operational)
2. Workflow sederhana: pembelian langsung update stok, permintaan direct approval
3. Tracking stok sederhana (masuk/keluar saja)
4. Pencatatan pemakaian (dari permintaan, manual, quick deduct)
5. Laporan: mutasi stok, pemakaian per unit, pembelian

## Dependencies
- Backend: Laravel 12, Spatie Permissions
- Frontend: React 19, Inertia.js v2, shadcn/ui, MagicUI
- Data: locations, departments, users (sudah ada dari track sebelumnya)

---

## Scope

### In Scope

#### 1. Database & Model

**OfficeSupplies Table (Master Data Bahan Kantor):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `nama_barang` | VARCHAR(255) | Nama barang |
| `satuan` | VARCHAR(20) | Satuan (pcs, kg, liter, pack) |
| `kategori` | VARCHAR(100) | Kategori (Consumables, Cleaning, Operational) |
| `deskripsi` | TEXT | Deskripsi barang |
| `stok` | INTEGER | Stok saat ini |
| `stok_minimal` | INTEGER | Reorder point |
| `soft_deletes` | - | Untuk audit trail |

**OfficePurchases Table (Pembelian):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `no_pembelian` | VARCHAR(50) | Nomor pembelian |
| `tanggal` | DATE | Tanggal pembelian |
| `supplier` | VARCHAR(100) | Nama supplier/toko |
| `total_nilai` | DECIMAL(15,2) | Total nilai pembelian |
| `keterangan` | TEXT | Catatan |
| `created_at` | TIMESTAMP | Waktu created |

**OfficePurchaseDetails Table:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `purchase_id` | ULID | Foreign key |
| `supply_id` | ULID | Foreign ke office_supplies |
| `jumlah` | INTEGER | Jumlah dibeli |
| `subtotal` | DECIMAL(15,2) | Subtotal (opsional) |

**OfficeMutations Table (Tracking Stok Sederhana):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `supply_id` | ULID | Foreign key |
| `jenis_mutasi` | ENUM | masuk, keluar |
| `jumlah` | INTEGER | Jumlah mutasi |
| `stok_sebelum` | INTEGER | Stok sebelum |
| `stok_sesudah` | INTEGER | Stok sesudah |
| `tipe` | VARCHAR(50) | pembelian, permintaan, manual, quick_deduct |
| `referensi_id` | ULID | Reference ID |
| `user_id` | ULID | Yang melakukan mutasi |
| `keterangan` | TEXT | Keterangan |
| `created_at` | TIMESTAMP | Waktu mutasi |

**OfficeRequests Table (Permintaan):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `no_permintaan` | VARCHAR(50) | Nomor permintaan |
| `user_id` | ULID | Foreign key (pemohon) |
| `department_id` | ULID | Foreign key |
| `tanggal` | DATE | Tanggal permintaan |
| `status` | ENUM | pending, approved, rejected, completed |
| `approved_by` | ULID | Foreign key (Operator) |
| `approved_at` | TIMESTAMP | Waktu approval |
| `completed_at` | TIMESTAMP | Waktu completed |
| `keterangan` | TEXT | Keterangan |
| `alasan_penolakan` | TEXT | Alasan jika ditolak |

**OfficeRequestDetails Table:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `request_id` | ULID | Foreign key |
| `supply_id` | ULID | Foreign key |
| `jumlah` | INTEGER | Jumlah diminta |
| `jumlah_diberikan` | INTEGER | Jumlah实际 diberikan |

**OfficeUsages Table (Pemakaian Manual):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `supply_id` | ULID | Foreign key |
| `jumlah` | INTEGER | Jumlah dipakai |
| `tanggal` | DATE | Tanggal pemakaian |
| `keperluan` | TEXT | Keperluan pemakaian |
| `user_id` | ULID | Yang mencatat |
| `created_at` | TIMESTAMP | Waktu catat |

#### 2. Perbedaan dengan Modul ATK

| Aspek | Modul ATK | Modul Bahan Kantor |
|-------|-----------|-------------------|
| **Workflow Approval** | 3-Level (Operator → Kasubag → KPA) | Direct Approval (Operator saja) |
| **Stock Opname** | Ada (dengan berita acara) | Tidak ada (barang habis pakai) |
| **Kartu Stok** | Detail dengan running balance | Sederhana (masuk/keluar saja) |
| **Kategori Barang** | ATK kantor (pulpen, kertas, dll) | Consumables, cleaning supplies, operational |
| **Contoh Barang** | Kertas A4, pulpen, map, binder | Gula, teh, kopi, sabun cuci piring, sabun tangan, pel, kemoceng, deterjen |
| **Pencatatan** | Pembelian → Penerimaan → Update Stok | Pembelian langsung Update Stok |
| **Laporan** | Mutasi, Stock Opname, Bulanan | Mutasi, Pemakaian per Unit, Pembelian |

#### 3. Master Data Bahan Kantor

**Kategori Barang:**
- **Consumables:** Gula, teh, kopi, snack, minuman
- **Cleaning Supplies:** Sabun cuci piring, sabun tangan, pel, kemoceng, deterjen
- **Operational:** Tisu, plastik, kertas roll, dll

**Fitur:**
- CRUD bahan kantor
- Indikator reorder point (badge warning jika stok <= stok_minimal)
- Search dan filter

#### 4. Workflow Pembelian

**Langkah Sederhana:**
1. Input pembelian (supplier, tanggal, items, jumlah)
2. Langsung update stok (create mutation masuk)
3. Selesai (tanpa penerimaan terpisah seperti ATK)

**Proses:**
- Form input pembelian
- Dynamic rows untuk items
- Save OfficePurchase + OfficePurchaseDetails
- Auto-create OfficeMutations (jenis: masuk)
- Update stok di OfficeSupplies

#### 5. Workflow Permintaan (Direct Approval)

**Alur Sederhana:**
1. Pegawai buat permintaan (status: pending)
2. Operator Persediaan approve/reject (langsung, tanpa level lain)
3. Jika approve, distribusi barang dan update stok (create mutation keluar)
4. Status berubah jadi completed

**Proses:**
- Pegawai create permintaan (items + jumlah)
- Operator lihat list permintaan pending
- Operator approve → distribusi barang → stok berkurang
- Operator reject → isi alasan penolakan

#### 6. Pencatatan Pemakaian

**3 Cara Input Pemakaian:**

**A. Dari Permintaan** (Otomatis):
- Ketika permintaan di-approve & completed
- Auto-create OfficeMutations (jenis: keluar, tipe: permintaan)

**B. Manual Input**:
- Form input pemakaian manual
- Input: supply, jumlah, tanggal, keperluan
- Create OfficeUsage + OfficeMutation (jenis: keluar, tipe: manual)

**C. Quick Deduct**:
- Quick form untuk mengurangi stok cepat
- Input: supply, jumlah, keterangan singkat
- Create OfficeMutation langsung (jenis: keluar, tipe: quick_deduct)
- Tanpa OfficeUsage record

#### 7. Laporan

**Laporan Mutasi Stok:**
- Periode (tanggal range)
- List semua mutasi: tanggal, barang, jenis, jumlah, stok sebelum/sesudah, tipe, keterangan
- Summary: total masuk, total keluar

**Laporan Pemakaian per Unit:**
- Periode (bulan/tahun)
- Group by department
- List: department, total pemakaian, items yang dipakai
- Summary per department

**Laporan Pembelian:**
- Periode (bulan/tahun)
- List pembelian: no, tanggal, supplier, items, total nilai
- Summary: total pengeluaran per periode

#### 8. Permissions (Spatie)
| Role | Master Data | Pembelian | Permintaan | Pemakaian Manual | Laporan |
|------|-------------|----------|-----------|-----------------|---------|
| Operator Persediaan | Full CRUD | Full | Approve | Full | View |
| Kasubag Umum | View | View | Approve | - | View |
| KPA | View | View | View | - | View |
| Pegawai | View | View | Create, View Own | - | View Own |

#### 9. API Endpoints (Inertia)
**Master Data:**
- `GET /office-supplies` - List bahan kantor
- `POST /office-supplies` - Create baru
- `PUT /office-supplies/{id}` - Update
- `GET /office-supplies/{id}/mutations` - List mutasi

**Pembelian:**
- `GET /office-purchases` - List pembelian
- `POST /office-purchases` - Input pembelian (auto update stok)

**Permintaan:**
- `GET /office-requests` - List permintaan
- `POST /office-requests` - Buat permintaan (Pegawai)
- `POST /office-requests/{id}/approve` - Approve & distribusi (Operator)
- `POST /office-requests/{id}/reject` - Reject (Operator)

**Pemakaian:**
- `GET /office-usages` - List pemakaian manual
- `POST /office-usages` - Input pemakaian manual
- `POST /office-mutations/quick-deduct` - Quick deduct stok

**Laporan:**
- `GET /office-reports/mutations` - Laporan mutasi stok
- `GET /office-reports/usage-by-unit` - Laporan pemakaian per unit
- `GET /office-reports/purchases` - Laporan pembelian
- `GET /office-reports/{type}/pdf` - Download PDF
- `GET /office-reports/{type}/excel` - Download Excel

### Out of Scope
- 3-Level approval (hanya direct approval)
- Stock opname (bahan kantor adalah consumables)
- Kartu stok detail (cukup mutasi sederhana)
- Harga management (opsional, tidak fokus)
- Multi-warehouse
- Barang ATK (sudah ada modul terpisah)

---

## Technical Implementation Details

### Directory Structure
```
app/
├── Models/
│   ├── OfficeSupply.php
│   ├── OfficePurchase.php
│   ├── OfficePurchaseDetail.php
│   ├── OfficeMutation.php
│   ├── OfficeRequest.php
│   ├── OfficeRequestDetail.php
│   └── OfficeUsage.php
├── Http/
│   ├── Controllers/
│   │   ├── OfficeSupplyController.php
│   │   ├── OfficePurchaseController.php
│   │   ├── OfficeRequestController.php
│   │   ├── OfficeUsageController.php
│   │   └── OfficeReportController.php
│   └── Requests/
resources/js/
├── Pages/
│   ├── OfficeSupplies/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   └── Show.tsx
│   ├── OfficePurchases/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   └── Show.tsx
│   ├── OfficeRequests/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   ├── Show.tsx
│   │   └── Approval.tsx
│   ├── OfficeUsages/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   └── QuickDeduct.tsx
│   └── OfficeReports/
│       ├── Mutations.tsx
│       ├── UsageByUnit.tsx
│       └── Purchases.tsx
├── Components/
│   ├── OfficeSupplies/
│   ├── OfficePurchases/
│   ├── OfficeRequests/
│   └── OfficeUsages/
```

### Pembelian Direct Update Stok
```php
// Saat pembelian dibuat
OfficePurchase::create([...]);
OfficePurchaseDetail::create([...]);

// Langsung update stok
foreach ($details as $detail) {
    $supply = OfficeSupply::find($detail->supply_id);
    $stok_sebelum = $supply->stok;
    $supply->stok += $detail->jumlah;
    $supply->save();

    // Create mutation
    OfficeMutation::create([
        'supply_id' => $detail->supply_id,
        'jenis_mutasi' => 'masuk',
        'jumlah' => $detail->jumlah,
        'stok_sebelum' => $stok_sebelum,
        'stok_sesudah' => $supply->stok,
        'tipe' => 'pembelian',
        'referensi_id' => $purchase->id,
        'user_id' => auth()->id(),
    ]);
}
```

### Permintaan Direct Approval
```php
// Approve by Operator
$request->approved_by = auth()->id();
$request->approved_at = now();
$request->status = 'approved';

// Distribusi & update stok
foreach ($request->details as $detail) {
    $supply = OfficeSupply::find($detail->supply_id);
    $stok_sebelum = $supply->stok;
    $supply->stok -= $detail->jumlah_diberikan;
    $supply->save();

    // Create mutation keluar
    OfficeMutation::create([
        'supply_id' => $detail->supply_id,
        'jenis_mutasi' => 'keluar',
        'jumlah' => $detail->jumlah_diberikan,
        'stok_sebelum' => $stok_sebelum,
        'stok_sesudah' => $supply->stok,
        'tipe' => 'permintaan',
        'referensi_id' => $request->id,
        'user_id' => auth()->id(),
    ]);
}

$request->status = 'completed';
$request->completed_at = now();
$request->save();
```

### Quick Deduct
```php
// Quick deduct tanpa form lengkap
$supply = OfficeSupply::find($supply_id);
$stok_sebelum = $supply->stok;
$supply->stok -= $jumlah;
$supply->save();

OfficeMutation::create([
    'supply_id' => $supply_id,
    'jenis_mutasi' => 'keluar',
    'jumlah' => $jumlah,
    'stok_sebelum' => $stok_sebelum,
    'stok_sesudah' => $supply->stok,
    'tipe' => 'quick_deduct',
    'keterangan' => $keterangan,
    'user_id' => auth()->id(),
]);
```

### Kategori Default
Seeding data untuk kategori:
- Consumables
- Cleaning Supplies
- Operational
