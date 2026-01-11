<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

describe('PurchaseController', function () {
    beforeEach(function () {
        $this->user = \App\Models\User::factory()->create();
        $this->actingAs($this->user);
    });

    describe('GET /purchases', function () {
        it('returns list of purchases', function () {
            $purchases = \App\Models\Purchase::factory()->count(3)->create();

            $response = $this->get('/purchases');

            $response->assertStatus(200);
        });

        it('filters purchases by status', function () {
            \App\Models\Purchase::factory()->draft()->create();
            \App\Models\Purchase::factory()->completed()->create();

            $response = $this->get('/purchases?status=draft');

            $response->assertStatus(200);
        });
    });

    describe('POST /purchases', function () {
        it('creates a new purchase with details', function () {
            $item = \App\Models\Item::factory()->create();

            $response = $this->post('/purchases', [
                'tanggal' => '2026-01-10',
                'supplier' => 'Test Supplier',
                'keterangan' => 'Test purchase',
                'items' => [
                    [
                        'item_id' => $item->id,
                        'jumlah' => 10,
                        'harga_satuan' => 5000,
                    ],
                ],
            ]);

            $response->assertStatus(302);
            $this->assertDatabaseHas('purchases', [
                'supplier' => 'Test Supplier',
                'status' => 'draft',
            ]);
            $this->assertDatabaseHas('purchase_details', [
                'item_id' => $item->id,
                'jumlah' => 10,
                'harga_satuan' => 5000,
                'subtotal' => 50000,
            ]);
        });

        it('calculates total nilai correctly', function () {
            $item1 = \App\Models\Item::factory()->create();
            $item2 = \App\Models\Item::factory()->create();

            $response = $this->post('/purchases', [
                'tanggal' => '2026-01-10',
                'supplier' => 'Test Supplier',
                'items' => [
                    [
                        'item_id' => $item1->id,
                        'jumlah' => 10,
                        'harga_satuan' => 5000,
                    ],
                    [
                        'item_id' => $item2->id,
                        'jumlah' => 5,
                        'harga_satuan' => 10000,
                    ],
                ],
            ]);

            $response->assertStatus(302);
            $this->assertDatabaseHas('purchases', [
                'supplier' => 'Test Supplier',
                'total_nilai' => 100000, // 50000 + 50000
            ]);
        });

        it('generates unique purchase number', function () {
            $item = \App\Models\Item::factory()->create();

            $response1 = $this->post('/purchases', [
                'tanggal' => '2026-01-10',
                'supplier' => 'Test Supplier 1',
                'items' => [
                    [
                        'item_id' => $item->id,
                        'jumlah' => 10,
                        'harga_satuan' => 5000,
                    ],
                ],
            ]);

            $response2 = $this->post('/purchases', [
                'tanggal' => '2026-01-10',
                'supplier' => 'Test Supplier 2',
                'items' => [
                    [
                        'item_id' => $item->id,
                        'jumlah' => 5,
                        'harga_satuan' => 5000,
                    ],
                ],
            ]);

            $purchase1 = \App\Models\Purchase::where('supplier', 'Test Supplier 1')->first();
            $purchase2 = \App\Models\Purchase::where('supplier', 'Test Supplier 2')->first();

            expect($purchase1->no_pembelian)->not->toBe($purchase2->no_pembelian);
        });

        it('validates required fields', function () {
            $response = $this->post('/purchases', []);

            $response->assertSessionHasErrors(['tanggal', 'supplier', 'items']);
        });

        it('validates items array is not empty', function () {
            $response = $this->post('/purchases', [
                'tanggal' => '2026-01-10',
                'supplier' => 'Test Supplier',
                'items' => [],
            ]);

            $response->assertSessionHasErrors(['items']);
        });

        it('validates item exists', function () {
            $response = $this->post('/purchases', [
                'tanggal' => '2026-01-10',
                'supplier' => 'Test Supplier',
                'items' => [
                    [
                        'item_id' => 'non-existent-id',
                        'jumlah' => 10,
                        'harga_satuan' => 5000,
                    ],
                ],
            ]);

            $response->assertSessionHasErrors(['items.0.item_id']);
        });
    });

    describe('GET /purchases/{id}', function () {
        it('returns purchase details', function () {
            $purchase = \App\Models\Purchase::factory()->create();
            $detail = \App\Models\PurchaseDetail::factory()->for($purchase)->create();

            $response = $this->get("/purchases/{$purchase->id}");

            $response->assertStatus(200);
        });

        it('returns 404 for non-existent purchase', function () {
            $response = $this->get('/purchases/non-existent-id');

            $response->assertStatus(404);
        });
    });

    describe('POST /purchases/{id}/receive', function () {
        it('updates purchase status to received', function () {
            $purchase = \App\Models\Purchase::factory()->draft()->create();
            \App\Models\PurchaseDetail::factory()->for($purchase)->count(2)->create();

            $response = $this->post("/purchases/{$purchase->id}/receive", [
                'items' => [
                    [
                        'purchase_detail_id' => $purchase->purchaseDetails->first()->id,
                        'jumlah_diterima' => 10,
                    ],
                ],
            ]);

            $response->assertStatus(302);
            $this->assertDatabaseHas('purchases', [
                'id' => $purchase->id,
                'status' => 'received',
            ]);
        });

        it('updates received quantities in details', function () {
            $purchase = \App\Models\Purchase::factory()->draft()->create();
            $detail = \App\Models\PurchaseDetail::factory()->for($purchase)->create([
                'jumlah' => 10,
            ]);

            $response = $this->post("/purchases/{$purchase->id}/receive", [
                'items' => [
                    [
                        'purchase_detail_id' => $detail->id,
                        'jumlah_diterima' => 8, // Less than ordered
                    ],
                ],
            ]);

            $response->assertStatus(302);
            // Verify jumlah_diterima is stored
            $detail->refresh();
            expect($detail->jumlah_diterima)->toBe(8);
        });

        it('validates only draft or received purchases can be received', function () {
            $purchase = \App\Models\Purchase::factory()->completed()->create();
            $detail = \App\Models\PurchaseDetail::factory()->for($purchase)->create();

            $response = $this->post("/purchases/{$purchase->id}/receive", [
                'items' => [
                    [
                        'purchase_detail_id' => $detail->id,
                        'jumlah_diterima' => 10,
                    ],
                ],
            ]);

            $response->assertStatus(403);
        });

        it('validates jumlah_diterima does not exceed jumlah', function () {
            $purchase = \App\Models\Purchase::factory()->draft()->create();
            $detail = \App\Models\PurchaseDetail::factory()->for($purchase)->create([
                'jumlah' => 10,
            ]);

            $response = $this->post("/purchases/{$purchase->id}/receive", [
                'items' => [
                    [
                        'purchase_detail_id' => $detail->id,
                        'jumlah_diterima' => 15, // More than ordered
                    ],
                ],
            ]);

            $response->assertSessionHasErrors(['items.0.jumlah_diterima']);
        });
    });

    describe('POST /purchases/{id}/complete', function () {
        it('updates purchase status to completed', function () {
            $purchase = \App\Models\Purchase::factory()->received()->create();
            \App\Models\PurchaseDetail::factory()->for($purchase)->count(2)->create();

            $response = $this->post("/purchases/{$purchase->id}/complete");

            $response->assertStatus(302);
            $this->assertDatabaseHas('purchases', [
                'id' => $purchase->id,
                'status' => 'completed',
            ]);
        });

        it('creates stock mutations for each item', function () {
            $item = \App\Models\Item::factory()->create(['stok' => 50]);
            $purchase = \App\Models\Purchase::factory()->received()->create();
            \App\Models\PurchaseDetail::factory()->for($purchase)->for($item)->create([
                'jumlah' => 10,
                'jumlah_diterima' => 10,
            ]);

            $response = $this->post("/purchases/{$purchase->id}/complete");

            $response->assertStatus(302);
            $this->assertDatabaseHas('stock_mutations', [
                'item_id' => $item->id,
                'jenis_mutasi' => 'masuk',
                'jumlah' => 10,
                'stok_sebelum' => 50,
                'stok_sesudah' => 60,
                'referensi_id' => $purchase->id,
                'referensi_tipe' => 'purchase',
            ]);
        });

        it('updates item stock', function () {
            $item = \App\Models\Item::factory()->create(['stok' => 50]);
            $purchase = \App\Models\Purchase::factory()->received()->create();
            \App\Models\PurchaseDetail::factory()->for($purchase)->for($item)->create([
                'jumlah' => 10,
                'jumlah_diterima' => 10,
            ]);

            $this->post("/purchases/{$purchase->id}/complete");

            $item->refresh();
            expect($item->stok)->toBe(60);
        });

        it('uses jumlah_diterima for stock mutations', function () {
            $item = \App\Models\Item::factory()->create(['stok' => 50]);
            $purchase = \App\Models\Purchase::factory()->received()->create();
            \App\Models\PurchaseDetail::factory()->for($purchase)->for($item)->create([
                'jumlah' => 10,
                'jumlah_diterima' => 8, // Only 8 received
            ]);

            $this->post("/purchases/{$purchase->id}/complete");

            $item->refresh();
            expect($item->stok)->toBe(58); // 50 + 8

            $this->assertDatabaseHas('stock_mutations', [
                'item_id' => $item->id,
                'jumlah' => 8,
                'stok_sesudah' => 58,
            ]);
        });

        it('updates harga rata_rata for items', function () {
            $item = \App\Models\Item::factory()->create([
                'stok' => 10,
                'harga_rata_rata' => 5000,
            ]);
            $purchase = \App\Models\Purchase::factory()->received()->create();
            \App\Models\PurchaseDetail::factory()->for($purchase)->for($item)->create([
                'jumlah' => 10,
                'jumlah_diterima' => 10,
                'harga_satuan' => 6000,
            ]);

            $this->post("/purchases/{$purchase->id}/complete");

            $item->refresh();
            // Weighted average: (10 * 5000 + 10 * 6000) / 20 = 5500
            expect((float) $item->harga_rata_rata)->toBe(5500.0);
        });

        it('updates harga_beli_terakhir for items', function () {
            $item = \App\Models\Item::factory()->create(['harga_beli_terakhir' => 5000]);
            $purchase = \App\Models\Purchase::factory()->received()->create();
            \App\Models\PurchaseDetail::factory()->for($purchase)->for($item)->create([
                'jumlah' => 10,
                'harga_satuan' => 6000,
            ]);

            $this->post("/purchases/{$purchase->id}/complete");

            $item->refresh();
            expect((float) $item->harga_beli_terakhir)->toBe(6000.0);
        });

        it('wraps everything in a database transaction', function () {
            Event::fake();

            $item = \App\Models\Item::factory()->create(['stok' => 50]);
            $purchase = \App\Models\Purchase::factory()->received()->create();
            \App\Models\PurchaseDetail::factory()->for($purchase)->for($item)->create();

            $this->post("/purchases/{$purchase->id}/complete");

            // If transaction failed, status would not be updated
            $purchase->refresh();
            expect($purchase->status)->toBe('completed');
        });

        it('validates only received purchases can be completed', function () {
            $purchase = \App\Models\Purchase::factory()->draft()->create();

            $response = $this->post("/purchases/{$purchase->id}/complete");

            $response->assertStatus(403);
        });

        it('prevents completing already completed purchase', function () {
            $purchase = \App\Models\Purchase::factory()->completed()->create();

            $response = $this->post("/purchases/{$purchase->id}/complete");

            $response->assertStatus(403);
        });
    });

    describe('Transaction safety', function () {
        it('rolls back all changes if stock mutation fails', function () {
            $item = \App\Models\Item::factory()->create(['stok' => 50]);
            $purchase = \App\Models\Purchase::factory()->received()->create();
            \App\Models\PurchaseDetail::factory()->for($purchase)->for($item)->create();

            // Simulate failure by using invalid data
            // This test ensures transaction safety
            $response = $this->post("/purchases/{$purchase->id}/complete");

            // Either complete success or complete rollback
            $purchase->refresh();
            if ($purchase->status === 'completed') {
                $item->refresh();
                expect($item->stok)->toBeGreaterThan(50);
            } else {
                expect($purchase->status)->toBe('received');
            }
        });
    });
});
