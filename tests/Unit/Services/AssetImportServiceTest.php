<?php

use App\Models\Asset;
use App\Models\Location;
use App\Services\AssetImportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

describe('AssetImportService', function () {
    describe('JSON structure validation', function () {
        test('throws exception when JSON structure is invalid', function () {
            $invalidJson = json_encode(['invalid' => 'structure']);

            expect(fn () => AssetImportService::validateJsonString($invalidJson))
                ->toThrow(ValidationException::class);
        });

        test('throws exception when metadata is missing', function () {
            $invalidJson = json_encode(['data' => []]);

            expect(fn () => AssetImportService::validateJsonString($invalidJson))
                ->toThrow(ValidationException::class);
        });

        test('throws exception when data is missing', function () {
            $invalidJson = json_encode(['metadata' => []]);

            expect(fn () => AssetImportService::validateJsonString($invalidJson))
                ->toThrow(ValidationException::class);
        });

        test('returns true when JSON structure is valid', function () {
            $validJson = json_encode([
                'metadata' => ['generated_at' => now()->toIso8601String()],
                'data' => [],
            ]);

            $result = AssetImportService::validateJsonString($validJson);
            expect($result)->toBeArray();
            expect($result)->toHaveKeys(['metadata', 'data']);
        });

        test('returns decoded data when valid', function () {
            $validJson = json_encode([
                'metadata' => ['generated_at' => now()->toIso8601String()],
                'data' => [
                    [
                        'id_aset' => 123456,
                        'kd_brg' => '2010104026',
                        'no_aset' => 1,
                        'kode_register' => 'TEST123',
                        'nama' => 'Test Asset',
                        'kd_kondisi' => '1',
                        'ur_kondisi' => 'Baik',
                        'rph_aset' => 1000000,
                    ],
                ],
            ]);

            $result = AssetImportService::validateJsonString($validJson);
            expect($result)->toBeArray();
            expect($result['data'])->toHaveCount(1);
        });
    });

    describe('Record validation', function () {
        test('validates required fields', function () {
            $validRecord = [
                'id_aset' => 123456,
                'kd_brg' => '2010104026',
                'no_aset' => 1,
                'kode_register' => 'TEST123',
                'nama' => 'Test Asset',
                'kd_kondisi' => '1',
                'ur_kondisi' => 'Baik',
                'rph_aset' => 1000000,
            ];

            expect(AssetImportService::validateRecord($validRecord))->toBeTrue();
        });

        test('throws exception when required field is missing', function () {
            $invalidRecord = [
                'id_aset' => 123456,
                'kd_brg' => '2010104026',
                // 'no_aset' is missing
            ];

            expect(fn () => AssetImportService::validateRecord($invalidRecord))
                ->toThrow(ValidationException::class);
        });

        test('throws exception when required field is empty', function () {
            $invalidRecord = [
                'id_aset' => 123456,
                'kd_brg' => '', // empty
                'no_aset' => 1,
                'kode_register' => 'TEST123',
                'nama' => 'Test Asset',
                'kd_kondisi' => '1',
                'ur_kondisi' => 'Baik',
                'rph_aset' => 1000000,
            ];

            expect(fn () => AssetImportService::validateRecord($invalidRecord))
                ->toThrow(ValidationException::class);
        });
    });

    describe('Location mapping', function () {
        test('finds existing location by nama_ruangan', function () {
            $location = Location::factory()->create(['nama_ruangan' => 'Gedung A Lt 1']);

            $foundLocation = AssetImportService::findOrCreateLocation('Gedung A Lt 1');

            expect($foundLocation->id)->toBe($location->id);
        });

        test('creates new location if not found', function () {
            $locationName = 'New Location Room';

            $location = AssetImportService::findOrCreateLocation($locationName);

            expect($location)->toBeInstanceOf(Location::class);
            expect($location->nama_ruangan)->toBe($locationName);
            expect($location->fresh())->not->toBeNull(); // Verify it's saved
        });

        test('returns same location on subsequent calls', function () {
            $locationName = 'Persistent Location';

            $location1 = AssetImportService::findOrCreateLocation($locationName);
            $location2 = AssetImportService::findOrCreateLocation($locationName);

            expect($location1->id)->toBe($location2->id);
        });
    });

    describe('Chunk processing', function () {
        test('processes data in chunks of 100', function () {
            $data = [];
            for ($i = 1; $i <= 250; $i++) {
                $data[] = [
                    'id_aset' => $i,
                    'kd_brg' => '2010104026',
                    'no_aset' => $i,
                    'kode_register' => 'TEST'.$i,
                    'nama' => "Asset {$i}",
                    'kd_kondisi' => '1',
                    'ur_kondisi' => 'Baik',
                    'rph_aset' => 1000000,
                    'lokasi_ruang' => "Location {$i}",
                ];
            }

            $results = AssetImportService::processImport($data);

            expect($results['success'])->toBe(250);
            expect($results['errors'])->toHaveCount(0);
            expect(Asset::count())->toBe(250);
        });

        test('skips invalid records and continues processing', function () {
            Location::factory()->create(['nama_ruangan' => 'Valid Location']);

            $data = [
                [
                    'id_aset' => 1,
                    'kd_brg' => '2010104026',
                    'no_aset' => 1,
                    'kode_register' => 'TEST1',
                    'nama' => 'Valid Asset 1',
                    'kd_kondisi' => '1',
                    'ur_kondisi' => 'Baik',
                    'rph_aset' => 1000000,
                    'lokasi_ruang' => 'Valid Location',
                ],
                [
                    'id_aset' => 2,
                    'kd_brg' => '', // Invalid: empty
                ],
                [
                    'id_aset' => 3,
                    'kd_brg' => '2010104026',
                    'no_aset' => 3,
                    'kode_register' => 'TEST3',
                    'nama' => 'Valid Asset 2',
                    'kd_kondisi' => '1',
                    'ur_kondisi' => 'Baik',
                    'rph_aset' => 1000000,
                    'lokasi_ruang' => 'Valid Location',
                ],
            ];

            $results = AssetImportService::processImport($data);

            expect($results['success'])->toBe(2);
            expect($results['errors'])->toHaveCount(1);
            expect(Asset::count())->toBe(2);
        });

        test('creates locations during import', function () {
            $data = [
                [
                    'id_aset' => 1,
                    'kd_brg' => '2010104026',
                    'no_aset' => 1,
                    'kode_register' => 'TEST1',
                    'nama' => 'Asset 1',
                    'kd_kondisi' => '1',
                    'ur_kondisi' => 'Baik',
                    'rph_aset' => 1000000,
                    'lokasi_ruang' => 'Auto-created Location',
                ],
            ];

            AssetImportService::processImport($data);

            $location = Location::where('nama_ruangan', 'Auto-created Location')->first();
            expect($location)->not->toBeNull();

            $asset = Asset::where('id_aset', 1)->first();
            expect($asset->lokasi_id)->toBe($location->id);
        });

        test('continues processing when one record fails validation', function () {
            // This test verifies that if one record fails validation,
            // the process continues with other records
            Location::factory()->create(['nama_ruangan' => 'Valid Location']);

            $data = [
                [
                    'id_aset' => 1,
                    'kd_brg' => '2010104026',
                    'no_aset' => 1,
                    'kode_register' => 'TEST1',
                    'nama' => 'Asset 1',
                    'kd_kondisi' => '1',
                    'ur_kondisi' => 'Baik',
                    'rph_aset' => 1000000,
                    'lokasi_ruang' => 'Valid Location',
                ],
                [
                    'id_aset' => 2,
                    'kd_brg' => '2010104026',
                    // Missing required fields - will fail validation
                ],
                [
                    'id_aset' => 3,
                    'kd_brg' => '2010104026',
                    'no_aset' => 3,
                    'kode_register' => 'TEST3',
                    'nama' => 'Asset 3',
                    'kd_kondisi' => '1',
                    'ur_kondisi' => 'Baik',
                    'rph_aset' => 1000000,
                    'lokasi_ruang' => 'Valid Location',
                ],
            ];

            $results = AssetImportService::processImport($data);

            expect($results['success'])->toBe(2); // Two valid records succeed
            expect($results['errors'])->toHaveCount(1); // One invalid record fails
        });
    });

    describe('Import summary', function () {
        test('returns summary with success and error counts', function () {
            $data = [
                [
                    'id_aset' => 1,
                    'kd_brg' => '2010104026',
                    'no_aset' => 1,
                    'kode_register' => 'TEST1',
                    'nama' => 'Valid Asset',
                    'kd_kondisi' => '1',
                    'ur_kondisi' => 'Baik',
                    'rph_aset' => 1000000,
                ],
                [
                    'id_aset' => 2,
                    'kd_brg' => '', // Invalid
                ],
            ];

            $results = AssetImportService::processImport($data);

            expect($results)->toHaveKeys(['success', 'errors', 'total']);
            expect($results['success'])->toBe(1);
            expect($results['errors'])->toHaveCount(1);
            expect($results['total'])->toBe(2);
        });
    });
});
