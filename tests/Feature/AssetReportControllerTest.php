<?php

use App\Models\Asset;
use App\Models\AssetMaintenance;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\post;

uses(RefreshDatabase::class);

beforeEach(function () {
    $user = User::factory()->create();
    actingAs($user);
});

describe('AssetReportController', function () {
    describe('Reports index page', function () {
        test('renders reports index page', function () {
            get(route('assets.reports.index'))
                ->assertSuccessful();
        });
    });

    describe('SAKTI/SIMAN export', function () {
        beforeEach(function () {
            Asset::factory()->create([
                'id_aset' => 123456,
                'kd_brg' => '2010104026',
                'nama' => 'Test Asset',
                'kd_kondisi' => '1',
                'ur_kondisi' => 'Baik',
                'rph_aset' => 1000000.00,
            ]);
        });

        test('exports SAKTI/SIMAN format successfully', function () {
            get(route('assets.reports.export.sakti-siman'))
                ->assertSuccessful()
                ->assertHeader('content-type', 'text/csv; charset=UTF-8');
        });

        test('exports with date filters', function () {
            get(route('assets.reports.export.sakti-siman'), [
                'date_from' => '2025-01-01',
                'date_to' => '2025-12-31',
            ])->assertSuccessful();
        });
    });

    describe('By location export', function () {
        beforeEach(function () {
            $location = Location::factory()->create(['nama_ruangan' => 'Ruang A']);
            Asset::factory()->create([
                'lokasi_ruang' => 'Ruang A',
                'lokasi_id' => $location->id,
                'rph_aset' => 1000000.00,
            ]);
        });

        test('exports by location successfully', function () {
            get(route('assets.reports.export.by-location'))
                ->assertSuccessful()
                ->assertHeader('content-type', 'text/csv; charset=UTF-8');
        });

        test('filters by location', function () {
            $location = Location::first();
            get(route('assets.reports.export.by-location'), [
                'lokasi_id' => $location->id,
            ])->assertSuccessful();
        });
    });

    describe('By category export', function () {
        beforeEach(function () {
            Asset::factory()->create([
                'kd_brg' => '2010104026',
                'ur_sskel' => 'Tanah',
                'rph_aset' => 1000000.00,
            ]);
        });

        test('exports by category successfully', function () {
            get(route('assets.reports.export.by-category'))
                ->assertSuccessful()
                ->assertHeader('content-type', 'text/csv; charset=UTF-8');
        });

        test('filters by category', function () {
            get(route('assets.reports.export.by-category'), [
                'kd_brg' => '2010104026',
            ])->assertSuccessful();
        });
    });

    describe('By condition export', function () {
        beforeEach(function () {
            Asset::factory()->create([
                'kd_kondisi' => '1',
                'ur_kondisi' => 'Baik',
                'rph_aset' => 1000000.00,
            ]);
        });

        test('exports by condition successfully', function () {
            get(route('assets.reports.export.by-condition'))
                ->assertSuccessful()
                ->assertHeader('content-type', 'text/csv; charset=UTF-8');
        });

        test('filters by condition', function () {
            get(route('assets.reports.export.by-condition'), [
                'kd_kondisi' => '1',
            ])->assertSuccessful();
        });
    });

    describe('Maintenance history export', function () {
        beforeEach(function () {
            $asset = Asset::factory()->create(['id_aset' => 123456]);
            AssetMaintenance::factory()->create([
                'asset_id' => $asset->id,
                'jenis_perawatan' => 'Perbaikan',
                'tanggal' => now(),
                'biaya' => 500000.00,
            ]);
        });

        test('exports maintenance history successfully', function () {
            get(route('assets.reports.export.maintenance-history'))
                ->assertSuccessful()
                ->assertHeader('content-type', 'text/csv; charset=UTF-8');
        });
    });

    describe('Value summary export', function () {
        beforeEach(function () {
            Asset::factory()->create([
                'kd_brg' => '2010104026',
                'ur_sskel' => 'Tanah',
                'rph_aset' => 1000000.00,
                'rph_buku' => 800000.00,
            ]);
        });

        test('exports value summary successfully', function () {
            get(route('assets.reports.export.value-summary'))
                ->assertSuccessful()
                ->assertHeader('content-type', 'text/csv; charset=UTF-8');
        });
    });

    describe('Preview endpoints', function () {
        beforeEach(function () {
            Asset::factory()->create([
                'kd_brg' => '2010104026',
                'kd_kondisi' => '1',
                'ur_kondisi' => 'Baik',
                'rph_aset' => 1000000.00,
                'lokasi_ruang' => 'Ruang A',
            ]);
        });

        test('previews SAKTI/SIMAN report', function () {
            post(route('assets.reports.preview'), [
                'report_type' => 'sakti_siman',
            ])->assertJson([
                'report_type' => 'SAKTI/SIMAN Format',
            ]);
        });

        test('previews by location report', function () {
            post(route('assets.reports.preview'), [
                'report_type' => 'by_location',
            ])->assertJson([
                'report_type' => 'Per Lokasi',
            ]);
        });

        test('previews by category report', function () {
            post(route('assets.reports.preview'), [
                'report_type' => 'by_category',
            ])->assertJson([
                'report_type' => 'Per Kategori',
            ]);
        });

        test('previews by condition report', function () {
            post(route('assets.reports.preview'), [
                'report_type' => 'by_condition',
            ])->assertJson([
                'report_type' => 'Per Kondisi',
            ]);
        });

        test('previews value summary report', function () {
            post(route('assets.reports.preview'), [
                'report_type' => 'value_summary',
            ])->assertJson([
                'report_type' => 'Ringkasan Nilai',
            ]);
        });

        test('applies filters in preview', function () {
            post(route('assets.reports.preview'), [
                'report_type' => 'sakti_siman',
                'kd_kondisi' => '1',
            ])->assertSuccessful();
        });
    });

    describe('Validation', function () {
        test('validates date range correctly', function () {
            post(route('assets.reports.preview'), [
                'report_type' => 'sakti_siman',
                'date_from' => '2025-12-31',
                'date_to' => '2025-01-01',
            ])->assertSessionHasErrors();
        });

        test('validates condition code', function () {
            post(route('assets.reports.preview'), [
                'report_type' => 'sakti_siman',
                'kd_kondisi' => 'invalid',
            ])->assertSessionHasErrors();
        });

        test('validates location exists', function () {
            post(route('assets.reports.preview'), [
                'report_type' => 'sakti_siman',
                'lokasi_id' => 'invalid-ulid',
            ])->assertSessionHasErrors();
        });
    });
});
