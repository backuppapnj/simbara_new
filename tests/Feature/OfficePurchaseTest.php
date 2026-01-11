<?php

use App\Models\OfficeMutation;
use App\Models\OfficePurchase;
use App\Models\OfficeSupply;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;

uses(RefreshDatabase::class);

// Helper function to create a user with specific permissions
function createOfficePurchaseUserWithPermissions(array $permissions): User
{
    $user = User::factory()->create();
    foreach ($permissions as $permission) {
        Permission::firstOrCreate(['name' => $permission]);
        $user->givePermissionTo($permission);
    }

    return $user;
}

describe('OfficePurchase Management', function () {
    describe('POST /office-purchases (Store)', function () {
        it('requires authentication', function () {
            $supply = OfficeSupply::factory()->create();

            $response = $this->postJson('/office-purchases', [
                'tanggal' => now()->toDateString(),
                'supplier' => 'Toko ABC',
                'keterangan' => 'Pembelian bulanan',
                'items' => [
                    [
                        'supply_id' => $supply->id,
                        'jumlah' => 10,
                    ],
                ],
            ]);

            $response->assertUnauthorized();
        });

        it('creates a new purchase with valid data and auto-updates stock', function () {
            $user = createOfficePurchaseUserWithPermissions(['office.purchases']);
            $supply1 = OfficeSupply::factory()->create(['stok' => 20]);
            $supply2 = OfficeSupply::factory()->create(['stok' => 15]);

            $response = $this->actingAs($user)
                ->postJson('/office-purchases', [
                    'tanggal' => now()->toDateString(),
                    'supplier' => 'Toko ABC',
                    'keterangan' => 'Pembelian bulanan',
                    'items' => [
                        [
                            'supply_id' => $supply1->id,
                            'jumlah' => 10,
                            'subtotal' => 50000,
                        ],
                        [
                            'supply_id' => $supply2->id,
                            'jumlah' => 5,
                            'subtotal' => 25000,
                        ],
                    ],
                ]);

            $response->assertCreated();

            $response->assertJsonStructure([
                'data' => [
                    'id',
                    'no_pembelian',
                    'tanggal',
                    'supplier',
                    'total_nilai',
                    'keterangan',
                ],
            ]);

            $this->assertDatabaseHas('office_purchases', [
                'supplier' => 'Toko ABC',
                'total_nilai' => 75000,
                'keterangan' => 'Pembelian bulanan',
            ]);

            $purchase = OfficePurchase::where('supplier', 'Toko ABC')->first();
            expect($purchase->details)->toHaveCount(2);

            $this->assertDatabaseHas('office_purchase_details', [
                'purchase_id' => $purchase->id,
                'supply_id' => $supply1->id,
                'jumlah' => 10,
                'subtotal' => 50000,
            ]);

            $this->assertDatabaseHas('office_purchase_details', [
                'purchase_id' => $purchase->id,
                'supply_id' => $supply2->id,
                'jumlah' => 5,
                'subtotal' => 25000,
            ]);

            // Verify stock was updated
            $supply1->refresh();
            $supply2->refresh();
            expect($supply1->stok)->toBe(30); // 20 + 10
            expect($supply2->stok)->toBe(20); // 15 + 5

            // Verify mutations were created
            $this->assertDatabaseHas('office_mutations', [
                'supply_id' => $supply1->id,
                'jenis_mutasi' => 'masuk',
                'jumlah' => 10,
                'stok_sebelum' => 20,
                'stok_sesudah' => 30,
                'tipe' => 'pembelian',
                'referensi_id' => $purchase->id,
                'user_id' => $user->id,
            ]);

            $this->assertDatabaseHas('office_mutations', [
                'supply_id' => $supply2->id,
                'jenis_mutasi' => 'masuk',
                'jumlah' => 5,
                'stok_sebelum' => 15,
                'stok_sesudah' => 20,
                'tipe' => 'pembelian',
                'referensi_id' => $purchase->id,
                'user_id' => $user->id,
            ]);
        });

        it('validates required fields', function () {
            $user = createOfficePurchaseUserWithPermissions(['office.purchases']);

            $response = $this->actingAs($user)
                ->postJson('/office-purchases', []);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['tanggal', 'supplier', 'items']);
        });

        it('validates items is an array', function () {
            $user = createOfficePurchaseUserWithPermissions(['office.purchases']);

            $response = $this->actingAs($user)
                ->postJson('/office-purchases', [
                    'tanggal' => now()->toDateString(),
                    'supplier' => 'Toko ABC',
                    'items' => 'not an array',
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items']);
        });

        it('validates items array is not empty', function () {
            $user = createOfficePurchaseUserWithPermissions(['office.purchases']);

            $response = $this->actingAs($user)
                ->postJson('/office-purchases', [
                    'tanggal' => now()->toDateString(),
                    'supplier' => 'Toko ABC',
                    'items' => [],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items']);
        });

        it('validates each item has supply_id and jumlah', function () {
            $user = createOfficePurchaseUserWithPermissions(['office.purchases']);

            $response = $this->actingAs($user)
                ->postJson('/office-purchases', [
                    'tanggal' => now()->toDateString(),
                    'supplier' => 'Toko ABC',
                    'items' => [
                        ['supply_id' => OfficeSupply::factory()->create()->id],
                        ['jumlah' => 5],
                    ],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items.0.jumlah', 'items.1.supply_id']);
        });

        it('validates supply_id exists in office_supplies table', function () {
            $user = createOfficePurchaseUserWithPermissions(['office.purchases']);

            $response = $this->actingAs($user)
                ->postJson('/office-purchases', [
                    'tanggal' => now()->toDateString(),
                    'supplier' => 'Toko ABC',
                    'items' => [
                        [
                            'supply_id' => (string) Str::ulid(),
                            'jumlah' => 5,
                        ],
                    ],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items.0.supply_id']);
        });

        it('validates jumlah is at least 1', function () {
            $user = createOfficePurchaseUserWithPermissions(['office.purchases']);
            $supply = OfficeSupply::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/office-purchases', [
                    'tanggal' => now()->toDateString(),
                    'supplier' => 'Toko ABC',
                    'items' => [
                        [
                            'supply_id' => $supply->id,
                            'jumlah' => 0,
                        ],
                    ],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items.0.jumlah']);
        });

        it('auto-generates PO number', function () {
            $user = createOfficePurchaseUserWithPermissions(['office.purchases']);
            $supply = OfficeSupply::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/office-purchases', [
                    'tanggal' => now()->toDateString(),
                    'supplier' => 'Toko ABC',
                    'items' => [
                        [
                            'supply_id' => $supply->id,
                            'jumlah' => 10,
                        ],
                    ],
                ]);

            $noPembelian = $response->json('data.no_pembelian');

            expect($noPembelian)->toStartWith('PO-');
            expect($noPembelian)->toHaveLength(18); // PO-YYYYMMDD-XXXXXX
        });

        it('calculates total_nilai from item subtotals', function () {
            $user = createOfficePurchaseUserWithPermissions(['office.purchases']);
            $supply = OfficeSupply::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/office-purchases', [
                    'tanggal' => now()->toDateString(),
                    'supplier' => 'Toko ABC',
                    'items' => [
                        [
                            'supply_id' => $supply->id,
                            'jumlah' => 10,
                            'subtotal' => 50000,
                        ],
                        [
                            'supply_id' => $supply->id,
                            'jumlah' => 5,
                            'subtotal' => 25000,
                        ],
                    ],
                ]);

            $response->assertCreated()
                ->assertJsonPath('data.total_nilai', '75000.00');
        });

        it('handles transaction rollback on failure', function () {
            $user = createOfficePurchaseUserWithPermissions(['office.purchases']);
            $supply = OfficeSupply::factory()->create(['stok' => 20]);

            // Mock a failure by using invalid data that will cause an error
            DB::shouldReceive('transaction')->andThrow(new \Exception('Test error'));

            $this->expectException(\Exception::class);

            try {
                $this->actingAs($user)
                    ->postJson('/office-purchases', [
                        'tanggal' => now()->toDateString(),
                        'supplier' => 'Toko ABC',
                        'items' => [
                            [
                                'supply_id' => $supply->id,
                                'jumlah' => 10,
                            ],
                        ],
                    ]);
            } finally {
                // Verify no purchase was created
                $this->assertDatabaseMissing('office_purchases', [
                    'supplier' => 'Toko ABC',
                ]);

                // Verify stock was not updated
                $supply->refresh();
                expect($supply->stok)->toBe(20);

                // Verify no mutations were created
                $this->assertDatabaseMissing('office_mutations', [
                    'supply_id' => $supply->id,
                    'tipe' => 'pembelian',
                ]);
            }
        });

        it('allows duplicate items in a single purchase', function () {
            $user = createOfficePurchaseUserWithPermissions(['office.purchases']);
            $supply = OfficeSupply::factory()->create(['stok' => 20]);

            $response = $this->actingAs($user)
                ->postJson('/office-purchases', [
                    'tanggal' => now()->toDateString(),
                    'supplier' => 'Toko ABC',
                    'items' => [
                        [
                            'supply_id' => $supply->id,
                            'jumlah' => 10,
                            'subtotal' => 50000,
                        ],
                        [
                            'supply_id' => $supply->id,
                            'jumlah' => 5,
                            'subtotal' => 25000,
                        ],
                    ],
                ]);

            $response->assertCreated();

            $purchase = OfficePurchase::where('supplier', 'Toko ABC')->first();
            expect($purchase->details)->toHaveCount(2);

            // Verify stock was updated correctly (20 + 10 + 5 = 35)
            $supply->refresh();
            expect($supply->stok)->toBe(35);

            // Verify two mutations were created
            $mutations = OfficeMutation::where('referensi_id', $purchase->id)->get();
            expect($mutations)->toHaveCount(2);
        });
    });

    describe('GET /office-purchases (Index)', function () {
        it('requires authentication', function () {
            $response = $this->getJson('/office-purchases');

            $response->assertUnauthorized();
        });

        it('returns list of purchases', function () {
            $user = createOfficePurchaseUserWithPermissions(['office.view']);

            OfficePurchase::factory()->count(3)->create();

            $response = $this->actingAs($user)
                ->getJson('/office-purchases');

            $response->assertOk()
                ->assertJsonCount(3, 'data');
        });

        it('filters by date range', function () {
            $user = createOfficePurchaseUserWithPermissions(['office.view']);

            OfficePurchase::factory()->create(['tanggal' => '2024-01-01']);
            OfficePurchase::factory()->create(['tanggal' => '2024-01-15']);
            OfficePurchase::factory()->create(['tanggal' => '2024-02-01']);

            $response = $this->actingAs($user)
                ->getJson('/office-purchases?tanggal_from=2024-01-01&tanggal_to=2024-01-31');

            $response->assertOk()
                ->assertJsonCount(2, 'data');
        });
    });

    describe('GET /office-purchases/{id} (Show)', function () {
        it('requires authentication', function () {
            $purchase = OfficePurchase::factory()->create();

            $response = $this->getJson("/office-purchases/{$purchase->id}");

            $response->assertUnauthorized();
        });

        it('returns purchase details with items', function () {
            $user = createOfficePurchaseUserWithPermissions(['office.view']);
            $purchase = OfficePurchase::factory()->create();

            \App\Models\OfficePurchaseDetail::factory()->count(2)->create(['purchase_id' => $purchase->id]);

            $response = $this->actingAs($user)
                ->getJson("/office-purchases/{$purchase->id}");

            $response->assertOk()
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'no_pembelian',
                        'tanggal',
                        'supplier',
                        'total_nilai',
                        'keterangan',
                        'details',
                    ],
                ])
                ->assertJsonCount(2, 'data.details');
        });
    });
});
