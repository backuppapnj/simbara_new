# Spec: Modul Persediaan ATK

## Overview
Track ini membangun Modul Persediaan ATK dengan workflow lengkap mulai dari pengadaan, permintaan 3-level approval, kartu stok digital real-time, dan stock opname dengan berita acara.

## Goals
1. Workflow pengadaan ATK 3-step (Pembelian → Penerimaan → Update Stok)
2. Permintaan ATK dengan 3-level approval
3. Kartu stok digital real-time
4. Stock opname dengan berita acara dan adjustment
5. Reorder point alert otomatis
6. Laporan bulanan transaksi kumulatif

## Dependencies
- Backend: Laravel 12, Spatie Permissions
- Frontend: React 19, Inertia.js v2, shadcn/ui, MagicUI
- Data: locations, departments, users (sudah ada dari track sebelumnya)

---

## Scope

### In Scope

#### 1. Database & Model

**Items Table (Master Data ATK):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `kode_barang` | VARCHAR(20) | Kode barang unik |
| `nama_barang` | VARCHAR(255) | Nama barang |
| `satuan` | VARCHAR(20) | Satuan (pcs, box, pack) |
| `kategori` | VARCHAR(100) | Kategori barang |
| `stok` | INTEGER | Stok saat ini |
| `stok_minimal` | INTEGER | Reorder point |
| `stok_maksimal` | INTEGER | Maksimal stok |
| `harga_beli_terakhir` | DECIMAL(15,2) | Harga beli terakhir |
| `harga_rata_rata` | DECIMAL(15,2) | Harga rata-rata |
| `harga_jual` | DECIMAL(15,2) | Harga jual |
| `soft_deletes` | - | Untuk audit trail |

**Purchases Table (Pembelian):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `no_pembelian` | VARCHAR(50) | Nomor pembelian |
| `tanggal` | DATE | Tanggal pembelian |
| `supplier` | VARCHAR(100) | Nama supplier |
| `total_nilai` | DECIMAL(15,2) | Total nilai pembelian |
| `status` | ENUM | draft, received, completed |
| `keterangan` | TEXT | Catatan |

**PurchaseDetails Table:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `purchase_id` | ULID | Foreign key |
| `item_id` | ULID | Foreign key |
| `jumlah` | INTEGER | Jumlah dibeli |
| `harga_satuan` | DECIMAL(15,2) | Harga per satuan |
| `subtotal` | DECIMAL(15,2) | Subtotal |

**StockMutations Table (Kartu Stok):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `item_id` | ULID | Foreign key |
| `jenis_mutasi` | ENUM | masuk, keluar, adjustment |
| `jumlah` | INTEGER | Jumlah mutasi |
| `stok_sebelum` | INTEGER | Stok sebelum mutasi |
| `stok_sesudah` | INTEGER | Stok sesudah mutasi |
| `referensi_id` | ULID | Reference (purchase/request ID) |
| `referensi_tipe` | VARCHAR(50) | Tipe referensi |
| `keterangan` | TEXT | Keterangan |
| `created_at` | TIMESTAMP | Waktu mutasi |

**Requests Table (Permintaan ATK):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `no_permintaan` | VARCHAR(50) | Nomor permintaan |
| `user_id` | ULID | Foreign key (pemohon) |
| `department_id` | ULID | Foreign key |
| `tanggal` | DATE | Tanggal permintaan |
| `status` | ENUM | pending, level1_approved, level2_approved, level3_approved, rejected, diserahkan, diterima |
| `level1_approval_by` | ULID | Foreign key (Operator Persediaan) |
| `level1_approval_at` | TIMESTAMP | Waktu approval L1 |
| `level2_approval_by` | ULID | Foreign key (Kasubag Umum) |
| `level2_approval_at` | TIMESTAMP | Waktu approval L2 |
| `level3_approval_by` | ULID | Foreign key (KPA) |
| `level3_approval_at` | TIMESTAMP | Waktu approval L3 |
| `keterangan` | TEXT | Keterangan permintaan |
| `alasan_penolakan` | TEXT | Alasan jika ditolak |

**RequestDetails Table:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `request_id` | ULID | Foreign key |
| `item_id` | ULID | Foreign key |
| `jumlah_diminta` | INTEGER | Jumlah diminta |
| `jumlah_disetujui` | INTEGER | Jumlah disetujui (bisa direview) |
| `jumlah_diberikan` | INTEGER | Jumlah实际 diberikan |

**StockOpnames Table:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `no_so` | VARCHAR(50) | Nomor stock opname |
| `tanggal` | DATE | Tanggal stock opname |
| `periode_bulan` | VARCHAR(20) | Bulan periode |
| `periode_tahun` | INTEGER | Tahun periode |
| `status` | ENUM | draft, completed, approved |
| `approved_by` | ULID | Foreign key |
| `approved_at` | TIMESTAMP | Waktu approval |
| `keterangan` | TEXT | Catatan |

**StockOpnameDetails Table:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `stock_opname_id` | ULID | Foreign key |
| `item_id` | ULID | Foreign key |
| `stok_sistem` | INTEGER | Stok di sistem |
| `stok_fisik` | INTEGER | Hasil hitung fisik |
| `selisih` | INTEGER | Selisih (auto calculate) |
| `keterangan` | TEXT | Keterangan selisih |

#### 2. Workflow Pengadaan (3-Step)

**Step 1: Input Pembelian**
- Form input pembelian baru
- Input: supplier, tanggal, item list (item, jumlah, harga)
- Status: `draft`
- Create Purchase + PurchaseDetails

**Step 2: Penerimaan Barang**
- Verifikasi barang diterima sesuai pembelian
- Cek fisik: jumlah dan kondisi
- Update status: `received`
- Adjust item quantities jika ada selisih

**Step 3: Update Stok**
- Finalize penerimaan
- Update status: `completed`
- Auto-create StockMutations (jenis: `masuk`)
- Update stok di Items
- Update harga rata-rata

#### 3. Permintaan dengan 3-Level Approval

**Workflow States:**
1. `pending` - Permintaan baru dibuat oleh Pegawai
2. `level1_approved` - Disetujui Operator Persediaan (cek stok)
3. `level2_approved` - Disetujui Kasubag Umum (cek administratif)
4. `level3_approved` - Disetujui KPA (cek anggaran)
5. `rejected` - Ditolak di salah satu level
6. `diserahkan` - Barang sudah diserahkan ke pemohon
7. `diterima` - Barang diterima oleh pemohon

**Approval Process:**
- Setiap level bisa approve/reject
- Jika reject: wajib isi alasan penolakan
- Jika approve: lanjut ke level berikutnya
- Operator Persediaan bisa adjust jumlah yang diminta (jika stok tidak cukup)

#### 4. Kartu Stok Real-time

**Auto Update Triggers:**
- Pembelian completed → create masuk mutation
- Permintaan diterima → create keluar mutation
- Stock opname adjustment → create adjustment mutation

**Kartu Stok Display:**
- List mutasi per item dengan pagination
- Show: tanggal, jenis, jumlah, stok sebelum, stok sesudah, referensi, keterangan
- Real-time saldo akhir
- Filter by jenis mutasi, date range

#### 5. Stock Opname

**Workflow:**
1. Buat Stock Opname baru (periode bulan/tahun)
2. Input hasil hitung fisik per item
3. Sistem auto-calculate selisih:
   - `selisih = stok_fisik - stok_sistem`
   - Selisih > 0: stok fisik lebih banyak
   - Selisih < 0: stok fisik lebih sedikit
4. Generate Berita Acara (PDF)
5. Submit untuk approval
6. Approval oleh Kasubag Umum/KPA
7. Auto adjustment stok (jika approved)

**Berita Acara (PDF):**
- Header: Nomor SO, Tanggal, Periode
- List: Item, Stok Sistem, Stok Fisik, Selisih, Keterangan
- Summary: Total selisih, tanda tangan
- Downloadable PDF

#### 6. Reorder Point Alert

**Alert Conditions:**
- `stok <= stok_minimal` → Trigger alert

**Alert Actions:**
- Dashboard notification banner
- Badge warning di list item
- Optional: Email/WA notification (via Fonnte API)

**Alert Display:**
- Show items di bawah stok minimal
- Quick action: "Buat Permintaan" atau "Input Pembelian"

#### 7. Distribusi & Status Tracking

**Status Tracking:**
- Pegawai bisa lihat status permintaan sendiri
- Timeline approval
- History: siapa approve, kapan

**Laporan Bulanan:**
- Generate laporan bulanan kumulatif
- Per periode (bulan/tahun)
- List semua transaksi:
  - Permintaan: no, pemohon, department, items, total nilai, status
  - Pembelian: no, supplier, items, total nilai, status
  - Stock opname: no, periode, total selisih
- Downloadable PDF/Excel

#### 8. Permissions (Spatie)
| Role | Master Data | Pembelian | Permintaan | Stok Opname | Laporan |
|------|-------------|----------|-----------|-------------|---------|
| Operator Persediaan | Full CRUD | Full | Process, Approve L1 | Full | View |
| Kasubag Umum | View | View | Approve L2 | Approve | View |
| KPA | View | View | Approve L3 | View | View |
| Pegawai | View | View | Create, View Own | View | View Own |

#### 9. API Endpoints (Inertia)
**Master Data:**
- `GET /items` - List item ATK
- `POST /items` - Create item baru
- `PUT /items/{id}` - Update item
- `GET /items/{id}/mutations` - Kartu stok

**Pembelian:**
- `GET /purchases` - List pembelian
- `POST /purchases` - Input pembelian
- `POST /purchases/{id}/receive` - Penerimaan barang
- `POST /purchases/{id}/complete` - Finalize & update stok

**Permintaan:**
- `GET /requests` - List permintaan (filter by user/role)
- `POST /requests` - Buat permintaan (Pegawai)
- `POST /requests/{id}/approve-level1` - Approval L1
- `POST /requests/{id}/approve-level2` - Approval L2
- `POST /requests/{id}/approve-level3` - Approval L3
- `POST /requests/{id}/reject` - Reject permintaan
- `POST /requests/{id}/distribute` - Distribusi barang
- `POST /requests/{id}/confirm-receive` - Konfirmasi terima barang

**Stock Opname:**
- `GET /stock-opnames` - List stock opname
- `POST /stock-opnames` - Buat SO baru
- `POST /stock-opnames/{id}/submit` - Submit SO
- `POST /stock-opnames/{id}/approve` - Approval SO
- `GET /stock-opnames/{id}/ba-pdf` - Download berita acara

**Laporan:**
- `GET /reports/monthly` - Laporan bulanan
- `GET /reports/monthly/pdf` - Download PDF
- `GET /reports/monthly/excel` - Download Excel

### Out of Scope
- Multi-warehouse support
- Barcode/QR Code scanning
- Return barang
- Forecasting demand

---

## Technical Implementation Details

### Directory Structure
```
app/
├── Models/
│   ├── Item.php
│   ├── Purchase.php
│   ├── PurchaseDetail.php
│   ├── StockMutation.php
│   ├── Request.php
│   ├── RequestDetail.php
│   ├── StockOpname.php
│   └── StockOpnameDetail.php
├── Http/
│   ├── Controllers/
│   │   ├── ItemController.php
│   │   ├── PurchaseController.php
│   │   ├── RequestController.php
│   │   ├── StockOpnameController.php
│   │   └── ReportController.php
│   └── Requests/ (FormRequests)
resources/js/
├── Pages/
│   ├── Items/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   └── Show.tsx
│   ├── Purchases/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   ├── Receive.tsx
│   │   └── Show.tsx
│   ├── Requests/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   ├── Show.tsx
│   │   └── Approval.tsx
│   ├── StockOpnames/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   └── Show.tsx
│   └── Reports/
│       └── Monthly.tsx
├── Components/
│   ├── Items/
│   ├── Purchases/
│   ├── Requests/
│   └── StockOpnames/
```

### Kartu Stok Logic
```php
// Saat ada mutasi
StockMutation::create([
    'item_id' => $item_id,
    'jenis_mutasi' => 'masuk', // atau 'keluar', 'adjustment'
    'jumlah' => $jumlah,
    'stok_sebelum' => $item->stok,
    'stok_sesudah' => $item->stok + $jumlah, // atau - $jumlah
    'referensi_id' => $reference_id,
    'referensi_tipe' => 'purchase', // atau 'request', 'stock_opname'
    'keterangan' => $keterangan,
]);

// Update stok item
$item->stok += $jumlah;
$item->save();
```

### Approval Workflow
```php
// Level 1 - Operator Persediaan
if ($user->hasRole('Operator Persediaan')) {
    $request->level1_approval_by = $user->id;
    $request->level1_approval_at = now();
    $request->status = 'level1_approved';
}

// Level 2 - Kasubag Umum
if ($user->hasRole('Kasubag Umum')) {
    $request->level2_approval_by = $user->id;
    $request->level2_approval_at = now();
    $request->status = 'level2_approved';
}

// Level 3 - KPA
if ($user->hasRole('KPA')) {
    $request->level3_approval_by = $user->id;
    $request->level3_approval_at = now();
    $request->status = 'level3_approved';
}
```

### Reorder Alert
```php
// Check items di bawah stok minimal
$lowStockItems = Item::where('stok', '<=', 'stok_minimal')->get();

// Dashboard notification
if ($lowStockItems->count() > 0) {
    // Show alert in dashboard
}
```

### PDF Generation (Berita Acara & Laporan)
- Use: `laravel-dompdf` atau `snappy` (wkhtmltopdf)
- Template: Blade views dengan CSS styling
- Downloadable route dengan proper headers
