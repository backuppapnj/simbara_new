# Initial Concept

Aplikasi Manajemen Aset dan Persediaan berbasis web untuk Pengadilan Agama Penajam Paser Utara Kelas II.

---

# Product Vision

Menyediakan sistem informasi terintegrasi yang mendukung Sub Bagian Umum dalam:
1. Pendataan & monitoring aset BMN untuk kemudahan pelaporan ke SAKTI & SIMAN
2. Manajemen persediaan ATK dengan workflow lengkap termasuk stock opname
3. Manajemen bahan keperluan kantor dengan pencatatan operasional sederhana

---

# Target Users

- **Super Admin**: Pengelola sistem penuh
- **KPA (Kuasa Pengguna Anggaran)**: View + Report + Approval Level 3
- **Kasubag Umum**: View + Report + Full CRUD + Approval Level 2
- **Operator BMN**: Full CRUD aset, View ATK & Bahan Kantor
- **Operator Persediaan**: View aset, Full CRUD ATK & Bahan Kantor + Approval Level 1
- **Pegawai**: View aset, Request ATK & Bahan Kantor

---

# Core Features

## Modul Aset (BMN)
- Pendataan aset sesuai format SIMAK BMN
- Klasifikasi kode akun 14 digit Kemenkeu
- Tracking lokasi & penanggung jawab
- Update kondisi (Baik/Rusak Ringan/Rusak Berat)
- Dokumentasi foto aset
- Pencarian & filter
- Export format Excel SAKTI/SIMAN
- Monitoring perawatan aset

## Modul Persediaan ATK
- Workflow pengadaan (Input Pembelian → Penerimaan → Update Stok)
- Workflow permintaan 3-level approval
- Kartu stok digital real-time
- Reorder point alert
- Stock opname dengan berita acara
- Distribusi & konfirmasi terima
- Pelaporan mutasi stok

## Modul Bahan Keperluan Kantor
- Pencatatan pembelian & pemakaian
- Permintaan barang (workflow sama dengan ATK)
- Rekap pengeluaran per periode

## Integrasi
- Notifikasi WhatsApp via Fonnte API
- PWA-ready (installable, camera access)

---

# User Stories

**Sebagai Operator Persediaan**, saya ingin memverifikasi ketersediaan stok sebelum meneruskan permintaan ke approver, agar tidak ada permintaan yang diproses padahal stok tidak tersedia.

**Sebagai Kasubag Umum**, saya ingin melakukan approval administratif terhadap permintaan ATK, agar dapat memastikan kebutuhan setiap unit kerja tercatat dengan baik.

**Sebagai KPA**, saya ingin memberikan approval final terhadap permintaan ATK, agar pengeluaran barang dapat dipertanggungjawabkan secara finance.

**Sebagai Operator BMN**, saya ingin mendokumentasikan setiap aset dengan foto dan lokasi yang jelas, agar memudahkan pelaporan ke sistem Kemenkeu.

**Sebagai Pegawai**, saya ingin mengajukan permintaan ATK secara online dan melacak status pengajuannya, agar tidak perlu datang langsung ke Sub Bagian Umum.
