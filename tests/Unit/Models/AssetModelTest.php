<?php

use App\Models\Asset;
use App\Models\Location;
use App\Models\User;

describe('Asset Model', function () {
    describe('model creation', function () {
        test('can be instantiated', function () {
            $asset = new Asset;
            expect($asset)->not->toBeNull();
        });

        test('uses ULID as primary key', function () {
            $asset = Asset::factory()->make();
            expect($asset->id)->toBeNull();

            $asset->save();
            expect($asset->id)->toBeString();
            expect(strlen($asset->id))->toBe(26);
        });
    });

    describe('table name', function () {
        test('uses assets table', function () {
            $asset = new Asset;
            expect($asset->getTable())->toBe('assets');
        });
    });

    describe('fillable attributes', function () {
        test('includes all SIMAN required fields', function () {
            $asset = new Asset;
            $fillable = $asset->getFillable();

            expect($fillable)->toContain('id_aset');
            expect($fillable)->toContain('kd_brg');
            expect($fillable)->toContain('no_aset');
            expect($fillable)->toContain('kode_register');
            expect($fillable)->toContain('nama');
            expect($fillable)->toContain('kd_kondisi');
            expect($fillable)->toContain('ur_kondisi');
            expect($fillable)->toContain('rph_aset');
            expect($fillable)->toContain('lokasi_id');
            expect($fillable)->toContain('penanggung_jawab_id');
        });
    });

    describe('casts configuration', function () {
        test('casts decimal fields correctly', function () {
            $asset = new Asset;
            $casts = $asset->getCasts();

            expect($casts['rph_aset'])->toBe('decimal:2');
            expect($casts['rph_susut'])->toBe('decimal:2');
            expect($casts['rph_buku'])->toBe('decimal:2');
            expect($casts['rph_perolehan'])->toBe('decimal:2');
        });

        test('casts date fields correctly', function () {
            $asset = new Asset;
            $casts = $asset->getCasts();

            expect($casts['tgl_perlh'])->toBe('date');
            expect($casts['tgl_rekam'])->toBe('date');
            expect($casts['tgl_rekam_pertama'])->toBe('date');
        });

        test('casts integer fields correctly', function () {
            $asset = new Asset;
            $casts = $asset->getCasts();

            expect($casts['id_aset'])->toBe('integer');
            expect($casts['no_aset'])->toBe('integer');
            expect($casts['kd_jns_bmn'])->toBe('integer');
            expect($casts['jml_photo'])->toBe('integer');
            expect($casts['umur_sisa'])->toBe('integer');
        });
    });

    describe('relationships', function () {
        test('belongs to a location', function () {
            $location = Location::factory()->create();
            $assetData = Asset::factory()->raw(['lokasi_id' => $location->id]);
            $asset = Asset::create($assetData);

            expect($asset->location)->toBeInstanceOf(Location::class);
            expect($asset->location->id)->toBe($location->id);
        });

        test('belongs to a handler (user)', function () {
            $user = User::factory()->create();
            $assetData = Asset::factory()->raw(['penanggung_jawab_id' => $user->id]);
            $asset = Asset::create($assetData);

            expect($asset->penanggungJawab)->toBeInstanceOf(User::class);
            expect($asset->penanggungJawab->id)->toBe($user->id);
        });

        test('has many histories', function () {
            $asset = Asset::factory()->make();
            $asset->save();
            expect($asset->histories())->not->toBeNull();
        });

        test('has many maintenances', function () {
            $asset = Asset::factory()->make();
            $asset->save();
            expect($asset->maintenances())->not->toBeNull();
        });

        test('has many condition logs', function () {
            $asset = Asset::factory()->make();
            $asset->save();
            expect($asset->conditionLogs())->not->toBeNull();
        });
    });

    describe('soft deletes', function () {
        test('uses soft deletes', function () {
            $asset = Asset::factory()->make();
            $asset->save();
            $asset->delete();

            expect(App\Models\Asset::withTrashed()->where('id', $asset->id)->exists())->toBeTrue();
            expect(App\Models\Asset::where('id', $asset->id)->exists())->toBeFalse();
        });
    });

    describe('scopes', function () {
        test('can filter by condition', function () {
            Asset::factory()->make(['kd_kondisi' => '1'])->save();
            Asset::factory()->make(['kd_kondisi' => '2'])->save();
            Asset::factory()->make(['kd_kondisi' => '3'])->save();

            $goodCondition = Asset::byCondition('1')->get();
            expect($goodCondition)->toHaveCount(1);
            expect($goodCondition->first()->kd_kondisi)->toBe('1');
        });

        test('can filter by location', function () {
            $location = Location::factory()->create();
            Asset::factory()->make(['lokasi_id' => $location->id])->save();
            Asset::factory()->make()->save();

            $locationAssets = Asset::byLocation($location->id)->get();
            expect($locationAssets)->toHaveCount(1);
            expect($locationAssets->first()->lokasi_id)->toBe($location->id);
        });
    });
});
