# Product Guidelines

## Gaya Penulisan

### Dokumen Resmi
- Bahasa Indonesia baku sesuai standar dokumen resmi pemerintah
- Format formal dengan struktur yang jelas
- Istilah teknis sesuai standar Kemenkeu (SAKTI, SIMAN, BMN, KIB)

### UI/UX Aplikasi
- Bahasa semi-formal, mudah dipahami
- Label singkat dan jelas
- Placeholder yang membimbing input
- Feedback konfirmasi yang informatif

---

## Struktur Navigasi

### Layout Utama
- **Sidebar kiri**: Menu utama berdasarkan modul (Dashboard, Aset, ATK, Bahan Kantor, User, Pengaturan)
- **Breadcrumb**: Navigasi selalu menunjukkan posisi saat ini
- **Header**: Logo pengadilan, nama user, dropdown profil, notifikasi

### Organisasi Menu
```
📁 Dashboard
├── Overview (statistik ringkas)

📦 Aset (BMN)
├── Daftar Aset
├── Tambah Aset
├── Lokasi & Ruangan
├── Perawatan Aset
└── Laporan Aset

📂 Persediaan ATK
├── Master Barang
├── Stok & Transaksi
├── Pengadaan
├── Permintaan
├── Approval
├── Stock Opname
└── Laporan

🧹 Bahan Keperluan Kantor
├── Master Barang
├── Transaksi
├── Permintaan
└── Rekap

👥 Manajemen User
├── User
├── Role & Permission
└── Log Aktivitas

⚙️ Pengaturan
├── Profil Satker
├── Konfigurasi
└── Backup
```

---

## Konvensi Penamaan

### Database & Kode
- **Table names**: snake_case, plural (e.g., `atk_items`, `asset_maintenances`)
- **Column names**: snake_case, singular (e.g., `kode_barang`, `stok_aktual`)
- **Model names**: PascalCase, singular (e.g., `AtkItem`, `AssetMaintenance`)
- **Controller names**: PascalCase, suffixed dengan Controller
- **Route names**: snake_case dengan dot notation (e.g., `atk.items.index`)

### UI (Bahasa Indonesia)
- Label: "Nama Barang", "Tanggal Perolehan", "Jumlah"
- Button: "Tambah", "Simpan", "Batal", "Hapus"
- Status: "Menunggu Persetujuan", "Disetujui", "Ditolak"

### Kode Error & Exception
- Exception messages dalam Bahasa Indonesia
- Error codes dalam konstanta EN (e.g., `INVALID_ITEM_ID`)

---

## Visual Identity

### Warna Utama
- **Primary**: Emerald green (#10b981) - fresh, modern
- **Secondary**: Slate gray (#64748b) - netral
- **Accent**: Amber (#f59e0b) - warning/attention

### Warna Status
- **Sukses**: Green (#22c55e)
- **Warning**: Amber (#eab308)
- **Error**: Red (#ef4444)
- **Info**: Blue (#3b82f6)

### Tipografi
- Font utama: Inter atau system sans-serif
- Hierarchy yang jelas (size, weight, color)

---

## Notifikasi WhatsApp (Fonnte)

### Template Pesan
Semua notifikasi menggunakan format **lengkap dengan konteks**:

```
Halo {nama_penerima},

{isi_notifikasi_lengkap}

Detail:
- No. Permintaan: {nomor}
- Tanggal: {tanggal}
- Status: {status}

Terima kasih.
{Division}
```

### Contoh Notifikasi
- **Request Baru**: "Permintaan baru telah diajukan oleh {nama}. Silakan verifikasi ketersediaan stok."
- **Pending L2**: "Permintaan #{nomor} sudah diverifikasi Operator. Menunggu approval Anda."
- **Approved**: "Permintaan ATK Anda #{nomor} telah DISETUJUI. Silakan ambil barang di Sub Bagian Umum."
- **Rejected**: "Mohon maaf, permintaan ATK Anda #{nomor} DITOLAK. Alasan: {alasan}"
- **Stok Menipis**: "Peringatan: Stok {nama_barang} tersisa {qty} {satuan}. Segera lakukan pengadaan."

---

## Handling Error & Validasi

### Prinsip
- Pesan error yang **sopan dan membimbing**
- Jelaskan apa yang salah + saran perbaikan
- Hindari bahasa yang menakutkan atau menyalahkan

### Contoh Pesan

**Validasi:**
- Kurang baik: "Stok tidak boleh negatif"
- Baik: "Jumlah yang diminta melebihi stok tersedia ({stok} unit). Silakan kurangi jumlah atau hubungi Operator."

**Error:**
- Kurang baik: "Gagal menyimpan"
- Baik: "Terjadi kesalahan saat menyimpan data. Silakan coba lagi atau hubungi Administrator."

**Konfirmasi:**
- Kurang baik: "Hapus?"
- Baik: "Apakah Anda yakin ingin menghapus '{item}'? Tindakan ini tidak dapat dibatalkan."

---

## Aksesibilitas

- Label form yang jelas
- Required field ditandai dengan asterisks (*)
- Loading state selama proses
- Konfirmasi untuk tindakan destruktif
- Mobile-responsive design
