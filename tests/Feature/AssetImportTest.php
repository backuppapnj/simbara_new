<?php

use App\Models\Asset;
use App\Models\Location;
use App\Models\User;
use App\Services\AssetImportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

describe('AssetImport', function () {
    describe('ImportAssetRequest', function () {
        it('requires json_file field', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('assets.import.process'), []);

            $response->assertSessionHasErrors('json_file');
        });

        it('validates json_file is a file', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('assets.import.process'), [
                    'json_file' => 'not a file',
                ]);

            $response->assertSessionHasErrors('json_file');
        });

        it('validates json_file is json format', function () {
            $user = User::factory()->create();
            $file = UploadedFile::fake()->create('assets.txt', 100);

            $response = $this->actingAs($user)
                ->post(route('assets.import.process'), [
                    'json_file' => $file,
                ]);

            $response->assertSessionHasErrors('json_file');
        });

        it('validates json_file max size', function () {
            $user = User::factory()->create();
            $file = UploadedFile::fake()->create('assets.json', 20000); // 20MB

            $response = $this->actingAs($user)
                ->post(route('assets.import.process'), [
                    'json_file' => $file,
                ]);

            $response->assertSessionHasErrors('json_file');
        });

        it('accepts valid json file', function () {
            $user = User::factory()->create();
            $file = UploadedFile::fake()->createWithContent('assets.json', json_encode([
                'metadata' => ['generated_at' => now(), 'total_records' => 1],
                'data' => [
                    [
                        'id_aset' => 123456,
                        'kd_brg' => '2010104026',
                        'nama' => 'Test Asset',
                        'kd_kondisi' => '1',
                        'rph_aset' => 1000000,
                    ],
                ],
            ]));

            $response = $this->actingAs($user)
                ->post(route('assets.import.process'), [
                    'json_file' => $file,
                ]);

            $response->assertSessionHasNoErrors();
        });
    });

    describe('AssetImportService', function () {
        it('validates json structure with missing metadata', function () {
            $service = app(AssetImportService::class);
            $data = ['data' => []];

            expect(fn () => $service->import($data))
                ->toThrow(\InvalidArgumentException::class, 'Invalid JSON format: missing "metadata" key');
        });

        it('validates json structure with missing data', function () {
            $service = app(AssetImportService::class);
            $data = ['metadata' => []];

            expect(fn () => $service->import($data))
                ->toThrow(\InvalidArgumentException::class, 'Invalid JSON format: missing or invalid "data" key');
        });

        it('imports valid asset data', function () {
            $service = app(AssetImportService::class);
            $data = [
                'metadata' => ['generated_at' => now(), 'total_records' => 2],
                'data' => [
                    [
                        'id_aset' => 123456,
                        'kd_brg' => '2010104026',
                        'nama' => 'Test Asset 1',
                        'kd_kondisi' => '1',
                        'rph_aset' => 1000000,
                        'lokasi_ruang' => 'Ruang 1',
                    ],
                    [
                        'id_aset' => 123457,
                        'kd_brg' => '2010104027',
                        'nama' => 'Test Asset 2',
                        'kd_kondisi' => '2',
                        'rph_aset' => 2000000,
                    ],
                ],
            ];

            $result = $service->import($data);

            expect($result['success'])->toBe(2);
            expect($result['errors'])->toBe(0);
            expect($result['error_details'])->toBeArray();

            $this->assertDatabaseHas('assets', [
                'id_aset' => 123456,
                'nama' => 'Test Asset 1',
            ]);

            $this->assertDatabaseHas('assets', [
                'id_aset' => 123457,
                'nama' => 'Test Asset 2',
            ]);
        });

        it('creates location when lokasi_ruang does not exist', function () {
            $service = app(AssetImportService::class);
            $data = [
                'metadata' => ['generated_at' => now(), 'total_records' => 1],
                'data' => [
                    [
                        'id_aset' => 123456,
                        'kd_brg' => '2010104026',
                        'nama' => 'Test Asset',
                        'kd_kondisi' => '1',
                        'rph_aset' => 1000000,
                        'lokasi_ruang' => 'Ruang Baru',
                    ],
                ],
            ];

            $service->import($data);

            $this->assertDatabaseHas('locations', [
                'nama_ruangan' => 'Ruang Baru',
            ]);

            $location = Location::where('nama_ruangan', 'Ruang Baru')->first();
            $this->assertDatabaseHas('assets', [
                'id_aset' => 123456,
                'lokasi_id' => $location->id,
            ]);
        });

        it('uses existing location when lokasi_ruang exists', function () {
            $location = Location::factory()->create(['nama_ruangan' => 'Ruang 1']);

            $service = app(AssetImportService::class);
            $data = [
                'metadata' => ['generated_at' => now(), 'total_records' => 1],
                'data' => [
                    [
                        'id_aset' => 123456,
                        'kd_brg' => '2010104026',
                        'nama' => 'Test Asset',
                        'kd_kondisi' => '1',
                        'rph_aset' => 1000000,
                        'lokasi_ruang' => 'Ruang 1',
                    ],
                ],
            ];

            $service->import($data);

            $this->assertDatabaseHas('assets', [
                'id_aset' => 123456,
                'lokasi_id' => $location->id,
            ]);

            expect(Location::where('nama_ruangan', 'Ruang 1')->count())->toBe(1);
        });

        it('handles invalid records gracefully', function () {
            $service = app(AssetImportService::class);
            $data = [
                'metadata' => ['generated_at' => now(), 'total_records' => 3],
                'data' => [
                    [
                        'id_aset' => 123456,
                        'kd_brg' => '2010104026',
                        'nama' => 'Valid Asset',
                        'kd_kondisi' => '1',
                        'rph_aset' => 1000000,
                    ],
                    [
                        'id_aset' => 123457,
                        'kd_brg' => '2010104027',
                        // Missing nama
                        'kd_kondisi' => '1',
                        'rph_aset' => 1000000,
                    ],
                    [
                        'id_aset' => 123458,
                        'kd_brg' => '2010104028',
                        'nama' => 'Another Valid Asset',
                        'kd_kondisi' => '1',
                        'rph_aset' => 2000000,
                    ],
                ],
            ];

            $result = $service->import($data);

            expect($result['success'])->toBe(2);
            expect($result['errors'])->toBe(1);
            expect($result['error_details'])->toHaveCount(1);
            expect($result['error_details'][0]['row'])->toBe(2);
        });

        it('updates existing assets based on id_aset', function () {
            $asset = Asset::factory()->create([
                'id_aset' => 123456,
                'nama' => 'Old Name',
                'rph_aset' => 1000000,
            ]);

            $service = app(AssetImportService::class);
            $data = [
                'metadata' => ['generated_at' => now(), 'total_records' => 1],
                'data' => [
                    [
                        'id_aset' => 123456,
                        'kd_brg' => '2010104026',
                        'nama' => 'Updated Name',
                        'kd_kondisi' => '2',
                        'rph_aset' => 1500000,
                    ],
                ],
            ];

            $result = $service->import($data);

            expect($result['success'])->toBe(1);

            $asset->refresh();
            expect($asset->nama)->toBe('Updated Name');
            expect((float) $asset->rph_aset)->toBe(1500000.0);
        });

        it('returns preview of first 50 records', function () {
            $service = app(AssetImportService::class);
            $data = [
                'metadata' => ['generated_at' => now(), 'total_records' => 100],
                'data' => array_fill(0, 100, [
                    'id_aset' => 123456,
                    'kd_brg' => '2010104026',
                    'nama' => 'Test Asset',
                    'kd_kondisi' => '1',
                    'rph_aset' => 1000000,
                ]),
            ];

            $preview = $service->getPreview($data);

            expect($preview)->toHaveCount(50);
        });

        it('returns metadata correctly', function () {
            $service = app(AssetImportService::class);
            $data = [
                'metadata' => [
                    'generated_at' => '2026-01-10T15:02:42.556Z',
                    'total_records' => 350,
                    'fields' => ['id_aset', 'kd_brg', 'nama'],
                ],
                'data' => [],
            ];

            $metadata = $service->getMetadata($data);

            expect($metadata['generated_at'])->toBe('2026-01-10T15:02:42.556Z');
            expect($metadata['total_records'])->toBe(350);
            expect($metadata['fields'])->toBe(['id_aset', 'kd_brg', 'nama']);
        });
    });

    describe('AssetController Import', function () {
        it('displays import page to authenticated users', function () {
            $user = User::factory()->create([
                'email_verified_at' => now(),
            ]);

            $response = $this->actingAs($user)
                ->get(route('assets.import'));

            $response->assertStatus(200);
        });

        it('requires authentication for import page', function () {
            $response = $this->get(route('assets.import'));

            $response->assertRedirect(route('login'));
        });

        it('processes valid json file and returns preview', function () {
            $user = User::factory()->create([
                'email_verified_at' => now(),
            ]);
            $fileContent = json_encode([
                'metadata' => ['generated_at' => now(), 'total_records' => 2],
                'data' => [
                    [
                        'id_aset' => 123456,
                        'kd_brg' => '2010104026',
                        'nama' => 'Test Asset 1',
                        'kd_kondisi' => '1',
                        'rph_aset' => 1000000,
                    ],
                    [
                        'id_aset' => 123457,
                        'kd_brg' => '2010104027',
                        'nama' => 'Test Asset 2',
                        'kd_kondisi' => '2',
                        'rph_aset' => 2000000,
                    ],
                ],
            ]);

            $file = UploadedFile::fake()->createWithContent('assets.json', $fileContent);

            $response = $this->actingAs($user)
                ->from(route('assets.import'))
                ->post(route('assets.import.process'), [
                    'json_file' => $file,
                ]);

            $response->assertRedirect(route('assets.import'));
            $response->assertSessionHas('preview');
            $response->assertSessionHas('metadata');
            $response->assertSessionHas('success');
        });

        it('returns error for invalid json file', function () {
            $user = User::factory()->create([
                'email_verified_at' => now(),
            ]);
            $file = UploadedFile::fake()->createWithContent('assets.json', 'invalid json');

            $response = $this->actingAs($user)
                ->post(route('assets.import.process'), [
                    'json_file' => $file,
                ]);

            $response->assertSessionHasErrors('json_file');
        });
    });

    describe('AssetController Update Location', function () {
        it('updates asset location and creates history', function () {
            $user = User::factory()->create();
            $oldLocation = Location::factory()->create();
            $newLocation = Location::factory()->create();
            $asset = Asset::factory()->create(['lokasi_id' => $oldLocation->id]);

            $response = $this->actingAs($user)
                ->post(route('assets.update-location', $asset->id), [
                    'lokasi_id' => $newLocation->id,
                    'keterangan' => 'Pindah lokasi',
                ]);

            $response->assertSessionHas('success');

            $asset->refresh();
            expect($asset->lokasi_id)->toBe($newLocation->id);

            $this->assertDatabaseHas('asset_histories', [
                'asset_id' => $asset->id,
                'lokasi_id_lama' => $oldLocation->id,
                'lokasi_id_baru' => $newLocation->id,
                'user_id' => $user->id,
                'keterangan' => 'Pindah lokasi',
            ]);
        });

        it('validates lokasi_id is required', function () {
            $user = User::factory()->create();
            $asset = Asset::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('assets.update-location', $asset->id), [
                    'keterangan' => 'Pindah lokasi',
                ]);

            $response->assertSessionHasErrors('lokasi_id');
        });

        it('validates lokasi_id exists', function () {
            $user = User::factory()->create();
            $asset = Asset::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('assets.update-location', $asset->id), [
                    'lokasi_id' => 'non-existent-id',
                    'keterangan' => 'Pindah lokasi',
                ]);

            $response->assertSessionHasErrors('lokasi_id');
        });
    });
});
