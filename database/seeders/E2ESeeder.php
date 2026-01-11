<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Item;
use App\Models\OfficeSupply;
use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\StockOpname;
use App\Models\StockOpnameDetail;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class E2ESeeder extends Seeder
{
    public function run(): void
    {
        $this->seedDepartments();
        $this->seedOfficeSupplies();
        $this->seedAtkItems();
        $this->seedPurchases();
        $this->seedStockOpname();
    }

    protected function seedDepartments(): void
    {
        Department::firstOrCreate(
            ['singkat' => 'IT'],
            [
                'id' => (string) Str::ulid(),
                'nama_unit' => 'Information Technology',
                'kepala_unit' => 'Kepala IT',
            ]
        );

        Department::firstOrCreate(
            ['singkat' => 'HRD'],
            [
                'id' => (string) Str::ulid(),
                'nama_unit' => 'Human Resource Development',
                'kepala_unit' => 'Kepala HRD',
            ]
        );

        Department::firstOrCreate(
            ['singkat' => 'KEU'],
            [
                'id' => (string) Str::ulid(),
                'nama_unit' => 'Keuangan',
                'kepala_unit' => 'Kepala Keuangan',
            ]
        );
    }

    protected function seedOfficeSupplies(): void
    {
        OfficeSupply::factory()->create([
            'id' => (string) Str::ulid(),
            'nama_barang' => 'Kertas A4',
            'satuan' => 'rim',
            'kategori' => 'Kertas',
            'stok' => 100,
            'stok_minimal' => 20,
        ]);

        OfficeSupply::factory()->create([
            'id' => (string) Str::ulid(),
            'nama_barang' => 'Pulpen Hitam',
            'satuan' => 'pcs',
            'kategori' => 'Alat Tulis',
            'stok' => 200,
            'stok_minimal' => 50,
        ]);

        OfficeSupply::factory()->create([
            'id' => (string) Str::ulid(),
            'nama_barang' => 'Stapler',
            'satuan' => 'pcs',
            'kategori' => 'Perlengkapan Kantor',
            'stok' => 30,
            'stok_minimal' => 10,
        ]);

        OfficeSupply::factory()->create([
            'id' => (string) Str::ulid(),
            'nama_barang' => 'Klip Kertas',
            'satuan' => 'pcs',
            'kategori' => 'Perlengkapan Kantor',
            'stok' => 500,
            'stok_minimal' => 100,
        ]);

        OfficeSupply::factory()->create([
            'id' => (string) Str::ulid(),
            'nama_barang' => 'Buku Tulis',
            'satuan' => 'pcs',
            'kategori' => 'Buku',
            'stok' => 150,
            'stok_minimal' => 30,
        ]);
    }

    protected function seedAtkItems(): void
    {
        Item::factory()->create([
            'kode_barang' => 'ATK-0001',
            'nama_barang' => 'Kertas A4',
            'satuan' => 'rim',
            'kategori' => 'Kertas',
            'stok' => 50,
            'stok_minimal' => 10,
            'stok_maksimal' => 200,
        ]);

        Item::factory()->create([
            'kode_barang' => 'ATK-0002',
            'nama_barang' => 'Pulpen Hitam',
            'satuan' => 'pcs',
            'kategori' => 'Alat Tulis',
            'stok' => 100,
            'stok_minimal' => 20,
            'stok_maksimal' => 300,
        ]);

        Item::factory()->create([
            'kode_barang' => 'ATK-0003',
            'nama_barang' => 'Stapler',
            'satuan' => 'pcs',
            'kategori' => 'Perlengkapan Kantor',
            'stok' => 10,
            'stok_minimal' => 5,
            'stok_maksimal' => 50,
        ]);
    }

    protected function seedPurchases(): void
    {
        $purchase = Purchase::factory()->draft()->create([
            'id' => (string) Str::ulid(),
            'no_pembelian' => 'PB-'.date('Ymd').'-0001',
            'supplier' => 'Supplier E2E',
        ]);

        $items = Item::query()->take(2)->get();
        foreach ($items as $item) {
            $jumlah = 5;
            $hargaSatuan = 10000;

            PurchaseDetail::factory()->create([
                'purchase_id' => $purchase->id,
                'item_id' => $item->id,
                'jumlah' => $jumlah,
                'harga_satuan' => $hargaSatuan,
                'subtotal' => $jumlah * $hargaSatuan,
            ]);
        }
    }

    protected function seedStockOpname(): void
    {
        $approver = User::where('email', 'admin@pa-penajam.go.id')->first();

        $stockOpname = StockOpname::factory()->approved()->create([
            'no_so' => 'SO-'.date('Ymd').'-0001',
            'tanggal' => now()->toDateString(),
            'periode_bulan' => now()->translatedFormat('F'),
            'periode_tahun' => (int) now()->format('Y'),
            'approved_by' => $approver?->id,
            'approved_at' => now(),
        ]);

        $items = Item::query()->take(3)->get();
        foreach ($items as $item) {
            StockOpnameDetail::factory()->create([
                'stock_opname_id' => $stockOpname->id,
                'item_id' => $item->id,
                'stok_sistem' => $item->stok,
                'stok_fisik' => $item->stok,
                'selisih' => 0,
            ]);
        }
    }
}
