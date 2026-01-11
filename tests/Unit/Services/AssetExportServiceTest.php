<?php

use App\Models\Asset;
use App\Models\AssetMaintenance;
use App\Models\Location;
use App\Services\AssetExportService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = new AssetExportService;
});

describe('AssetExportService', function () {
    describe('CSV export generation', function () {
        beforeEach(function () {
            // Create test assets
            $location = Location::factory()->create(['nama_ruangan' => 'Ruang Test']);

            Asset::factory()->create([
                'id_aset' => 123456,
                'kd_brg' => '2010104026',
                'no_aset' => 1,
                'kode_register' => 'TEST123',
                'nama' => 'Test Asset 1',
                'kd_kondisi' => '1',
                'ur_kondisi' => 'Baik',
                'rph_aset' => 1000000.00,
                'rph_buku' => 800000.00,
                'lokasi_ruang' => 'Ruang Test',
                'lokasi_id' => $location->id,
                'tgl_rekam' => now()->subMonth(),
            ]);

            Asset::factory()->create([
                'id_aset' => 123457,
                'kd_brg' => '2010104027',
                'no_aset' => 2,
                'kode_register' => 'TEST124',
                'nama' => 'Test Asset 2',
                'kd_kondisi' => '2',
                'ur_kondisi' => 'Rusak Ringan',
                'rph_aset' => 2000000.00,
                'rph_buku' => 1500000.00,
                'lokasi_ruang' => 'Ruang Test 2',
                'tgl_rekam' => now(),
            ]);
        });

        test('generates SAKTI/SIMAN format CSV', function () {
            $assets = Asset::all();
            $csv = $this->service->exportAssetsToSaktiSimanFormat($assets);

            expect($csv)->toContain('id_aset,kd_brg,no_aset');
            expect($csv)->toContain('123456,2010104026,1');
            expect($csv)->toContain('TEST123');
            expect($csv)->toContain('Test Asset 1');
        });

        test('generates by location CSV', function () {
            $assets = Asset::all();
            $csv = $this->service->exportByLocation($assets);

            expect($csv)->toContain('Lokasi,Kode Barang,Nama Aset');
            expect($csv)->toContain('Ruang Test');
            expect($csv)->toContain('Ruang Test 2');
        });

        test('generates by category CSV', function () {
            $assets = Asset::all();
            $csv = $this->service->exportByCategory($assets);

            expect($csv)->toContain('Kode Barang,Uraian Sub Kelompok');
            expect($csv)->toContain('2010104026');
            expect($csv)->toContain('2010104027');
        });

        test('generates by condition CSV', function () {
            $assets = Asset::all();
            $csv = $this->service->exportByCondition($assets);

            expect($csv)->toContain('Kondisi,Kode Barang');
            expect($csv)->toContain('Baik');
            expect($csv)->toContain('Rusak Ringan');
        });

        test('generates value summary CSV', function () {
            $assets = Asset::all();
            $csv = $this->service->exportValueSummary($assets);

            expect($csv)->toContain('Kode Barang,Uraian Sub Kelompok,Jumlah Aset');
            expect($csv)->toContain('Total Nilai Aset');
            expect($csv)->toContain('2010104026');
            expect($csv)->toContain('2010104027');
        });
    });

    describe('Maintenance history export', function () {
        beforeEach(function () {
            $asset = Asset::factory()->create([
                'id_aset' => 123456,
                'nama' => 'Test Asset',
            ]);

            AssetMaintenance::factory()->create([
                'asset_id' => $asset->id,
                'jenis_perawatan' => 'Perbaikan',
                'tanggal' => now()->subWeek(),
                'biaya' => 500000.00,
                'pelaksana' => 'Teknisi A',
                'keterangan' => 'Ganti sparepart',
            ]);
        });

        test('generates maintenance history CSV', function () {
            $maintenances = AssetMaintenance::with('asset')->get();
            $csv = $this->service->exportMaintenanceHistory($maintenances);

            expect($csv)->toContain('ID Aset,Nama Aset,Jenis Perawatan');
            expect($csv)->toContain('123456');
            expect($csv)->toContain('Test Asset');
            expect($csv)->toContain('Perbaikan');
            expect($csv)->toContain('Teknisi A');
        });
    });

    describe('Filter functionality', function () {
        beforeEach(function () {
            $location = Location::factory()->create();

            Asset::factory()->create([
                'kd_brg' => '2010104026',
                'kd_kondisi' => '1',
                'tgl_rekam' => '2025-01-01',
                'lokasi_id' => $location->id,
            ]);

            Asset::factory()->create([
                'kd_brg' => '2010104027',
                'kd_kondisi' => '2',
                'tgl_rekam' => '2025-02-01',
                'lokasi_id' => $location->id,
            ]);
        });

        test('filters assets by date range', function () {
            $location = Location::first();
            $assets = $this->service->getAssetsWithFilters([
                'date_from' => '2025-01-15',
                'date_to' => '2025-02-15',
            ]);

            expect($assets)->toHaveCount(1);
            expect($assets->first()->kd_brg)->toBe('2010104027');
        });

        test('filters assets by category', function () {
            $assets = $this->service->getAssetsWithFilters([
                'kd_brg' => '2010104026',
            ]);

            expect($assets)->toHaveCount(1);
            expect($assets->first()->kd_brg)->toBe('2010104026');
        });

        test('filters assets by condition', function () {
            $assets = $this->service->getAssetsWithFilters([
                'kd_kondisi' => '1',
            ]);

            expect($assets)->toHaveCount(1);
            expect($assets->first()->kd_kondisi)->toBe('1');
        });

        test('filters assets by location', function () {
            $location = Location::first();
            $assets = $this->service->getAssetsWithFilters([
                'lokasi_id' => $location->id,
            ]);

            expect($assets)->toHaveCount(2);
        });
    });

    describe('CSV field escaping', function () {
        test('escapes fields with commas', function () {
            $asset = Asset::factory()->create([
                'nama' => 'Test, Asset, With, Commas',
            ]);

            $csv = $this->service->exportAssetsToSaktiSimanFormat(collect([$asset]));

            expect($csv)->toContain('"Test, Asset, With, Commas"');
        });

        test('escapes fields with quotes', function () {
            $asset = Asset::factory()->create([
                'nama' => 'Test "Asset" With Quotes',
            ]);

            $csv = $this->service->exportAssetsToSaktiSimanFormat(collect([$asset]));

            // CSV standard: quotes inside quoted fields are doubled
            expect($csv)->toContain('"Test ""Asset"" With Quotes"');
        });

        test('handles null values gracefully', function () {
            $asset = Asset::factory()->create([
                'merk' => null,
                'tipe' => null,
            ]);

            $csv = $this->service->exportAssetsToSaktiSimanFormat(collect([$asset]));

            expect($csv)->toContain(','); // Empty fields
        });
    });

    describe('Filename generation', function () {
        test('generates valid filename', function () {
            $filename = $this->service->generateFilename('test-report');

            expect($filename)->toContain('laporan-aset-test-report-');
            expect($filename)->toContain('.csv');
            expect($filename)->toMatch('/\d{4}-\d{2}-\d{2}_\d{6}/'); // Date format
        });
    });
});
