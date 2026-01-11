<?php

use App\Models\OfficeSupply;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    // Create required permissions
    $permissions = [
        'office.view',
    ];

    foreach ($permissions as $permission) {
        Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
    }
});

describe('OfficeSupply JSON API', function () {
    describe('GET /office-supplies (JSON)', function () {
        it('returns JSON response when Accept header is application/json', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            $user->givePermissionTo('office.view');
            OfficeSupply::factory()->count(3)->create();

            $response = $this->actingAs($user)
                ->getJson(route('office-supplies.index'));

            $response->assertStatus(200)
                ->assertJsonStructure([
                    'data',
                    'links',
                    'current_page',
                    'from',
                    'last_page',
                    'per_page',
                    'to',
                    'total',
                ])
                ->assertJsonCount(3, 'data');
        });

        it('returns Inertia response for web requests', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            $user->givePermissionTo('office.view');
            OfficeSupply::factory()->count(3)->create();

            $response = $this->actingAs($user)
                ->get(route('office-supplies.index'));

            $response->assertStatus(200);
            $this->assertNotEmpty($response->getContent());
        });

        it('filters search results in JSON response', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            $user->givePermissionTo('office.view');
            OfficeSupply::factory()->create(['nama_barang' => 'Gula Pasir']);
            OfficeSupply::factory()->create(['nama_barang' => 'Teh Hitam']);

            $response = $this->actingAs($user)
                ->getJson(route('office-supplies.index', ['search' => 'Gula']));

            $response->assertStatus(200)
                ->assertJsonCount(1, 'data');
        });

        it('filters by category in JSON response', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            $user->givePermissionTo('office.view');
            OfficeSupply::factory()->create(['kategori' => 'Consumables']);
            OfficeSupply::factory()->create(['kategori' => 'Cleaning Supplies']);

            $response = $this->actingAs($user)
                ->getJson(route('office-supplies.index', ['kategori' => 'Consumables']));

            $response->assertStatus(200)
                ->assertJsonCount(1, 'data');
        });
    });

    describe('GET /office-supplies/{id}/mutations (JSON)', function () {
        it('returns JSON response when Accept header is application/json', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            $user->givePermissionTo('office.view');
            $supply = OfficeSupply::factory()->create();

            $response = $this->actingAs($user)
                ->getJson(route('office-supplies.mutations', $supply));

            $response->assertStatus(200)
                ->assertJsonStructure([
                    'data',
                    'links',
                    'current_page',
                    'from',
                    'last_page',
                    'per_page',
                    'to',
                    'total',
                ]);
        });

        it('returns Inertia response for web requests', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            $user->givePermissionTo('office.view');
            $supply = OfficeSupply::factory()->create();

            $response = $this->actingAs($user)
                ->get(route('office-supplies.mutations', $supply));

            $response->assertStatus(200);
            $this->assertNotEmpty($response->getContent());
        });

        it('filters by jenis_mutasi in JSON response', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            $user->givePermissionTo('office.view');
            $supply = OfficeSupply::factory()->create();
            $supply->mutations()->createMany([
                [
                    'jenis_mutasi' => 'masuk',
                    'jumlah' => 10,
                    'stok_sebelum' => 0,
                    'stok_sesudah' => 10,
                    'tipe' => 'manual',
                    'user_id' => $user->id,
                    'keterangan' => 'Stock awal',
                ],
                [
                    'jenis_mutasi' => 'keluar',
                    'jumlah' => 5,
                    'stok_sebelum' => 10,
                    'stok_sesudah' => 5,
                    'tipe' => 'manual',
                    'user_id' => $user->id,
                    'keterangan' => 'Digunakan',
                ],
            ]);

            $response = $this->actingAs($user)
                ->getJson(route('office-supplies.mutations', [$supply, 'jenis' => 'masuk']));

            $response->assertStatus(200)
                ->assertJsonCount(1, 'data');
        });
    });
});
