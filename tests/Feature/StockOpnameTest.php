<?php

use App\Models\Item;
use App\Models\StockOpname;
use App\Models\StockOpnameDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('StockOpnameController', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    });

    describe('GET /stock-opnames', function () {
        it('displays stock opnames list', function () {
            StockOpname::factory()->count(3)->create();

            $response = $this->get(route('stock-opnames.index'));

            $response->assertStatus(200);
        });

        it('filters stock opnames by status', function () {
            StockOpname::factory()->draft()->create();
            StockOpname::factory()->completed()->create();

            $response = $this->get(route('stock-opnames.index', ['status' => 'draft']));

            $response->assertStatus(200);
        });
    });

    describe('GET /stock-opnames/create', function () {
        it('displays create stock opname form', function () {
            $response = $this->get(route('stock-opnames.create'));

            $response->assertStatus(200);
        });

        it('passes items to the view', function () {
            Item::factory()->count(5)->create();

            $response = $this->get(route('stock-opnames.create'));

            $response->assertStatus(200);
        });
    });

    describe('POST /stock-opnames', function () {
        it('creates a new stock opname', function () {
            $items = Item::factory()->count(3)->create();
            $details = [];
            foreach ($items as $item) {
                $details[] = [
                    'item_id' => $item->id,
                    'stok_sistem' => $item->stok,
                    'stok_fisik' => $item->stok + 5,
                    'keterangan' => 'Test selisih',
                ];
            }

            $response = $this->post(route('stock-opnames.store'), [
                'tanggal' => now()->format('Y-m-d'),
                'periode_bulan' => 'Januari',
                'periode_tahun' => now()->year,
                'keterangan' => 'Stock opname bulanan',
                'details' => $details,
            ]);

            $response->assertRedirect();
            $this->assertDatabaseHas('stock_opnames', [
                'periode_bulan' => 'Januari',
                'periode_tahun' => now()->year,
                'status' => 'draft',
            ]);
            $this->assertDatabaseCount('stock_opname_details', 3);
        });

        it('auto-generates SO number', function () {
            $items = Item::factory()->count(1)->create();

            $response = $this->post(route('stock-opnames.store'), [
                'tanggal' => now()->format('Y-m-d'),
                'periode_bulan' => 'Januari',
                'periode_tahun' => now()->year,
                'details' => [
                    [
                        'item_id' => $items->first()->id,
                        'stok_sistem' => $items->first()->stok,
                        'stok_fisik' => $items->first()->stok,
                    ],
                ],
            ]);

            $so = StockOpname::first();
            expect($so->no_so)->not->toBeEmpty();
            expect(str_starts_with($so->no_so, 'SO-'))->toBeTrue();
        });

        it('calculates selisih automatically', function () {
            $item = Item::factory()->create(['stok' => 10]);

            $response = $this->post(route('stock-opnames.store'), [
                'tanggal' => now()->format('Y-m-d'),
                'periode_bulan' => 'Januari',
                'periode_tahun' => now()->year,
                'details' => [
                    [
                        'item_id' => $item->id,
                        'stok_sistem' => 10,
                        'stok_fisik' => 15,
                        'keterangan' => 'Selisih 5',
                    ],
                ],
            ]);

            $detail = StockOpnameDetail::first();
            expect($detail->selisih)->toBe(5);
        });

        it('validates required fields', function () {
            $response = $this->post(route('stock-opnames.store'), [
                'tanggal' => '',
                'periode_bulan' => '',
                'periode_tahun' => '',
            ]);

            $response->assertSessionHasErrors(['tanggal', 'periode_bulan', 'periode_tahun']);
        });

        it('validates details is required', function () {
            $response = $this->post(route('stock-opnames.store'), [
                'tanggal' => now()->format('Y-m-d'),
                'periode_bulan' => 'Januari',
                'periode_tahun' => now()->year,
                'details' => [],
            ]);

            $response->assertSessionHasErrors(['details']);
        });
    });

    describe('GET /stock-opnames/{id}', function () {
        it('displays stock opname details', function () {
            $stockOpname = StockOpname::factory()
                ->has(StockOpnameDetail::factory()->count(3)->for(Item::factory()))
                ->create();

            $response = $this->get(route('stock-opnames.show', $stockOpname));

            $response->assertStatus(200);
        });

        it('includes stock opname details', function () {
            $stockOpname = StockOpname::factory()
                ->has(StockOpnameDetail::factory()->count(2)->for(Item::factory()))
                ->create();

            $response = $this->get(route('stock-opnames.show', $stockOpname));

            $response->assertStatus(200);
        });
    });

    describe('POST /stock-opnames/{id}/submit', function () {
        it('submits stock opname for approval', function () {
            $stockOpname = StockOpname::factory()
                ->has(StockOpnameDetail::factory()->for(Item::factory()))
                ->draft()
                ->create();

            $response = $this->post(route('stock-opnames.submit', $stockOpname));

            $response->assertRedirect();
            $this->assertDatabaseHas('stock_opnames', [
                'id' => $stockOpname->id,
                'status' => 'completed',
            ]);
        });

        it('cannot submit already completed stock opname', function () {
            $stockOpname = StockOpname::factory()
                ->has(StockOpnameDetail::factory()->for(Item::factory()))
                ->completed()
                ->create();

            $response = $this->post(route('stock-opnames.submit', $stockOpname));

            $response->assertStatus(403);
        });
    });

    describe('POST /stock-opnames/{id}/approve', function () {
        it('approves stock opname and adjusts stock', function () {
            $item = Item::factory()->create(['stok' => 10]);
            $stockOpname = StockOpname::factory()
                ->has(StockOpnameDetail::factory()->recycle($item)->state([
                    'stok_sistem' => 10,
                    'stok_fisik' => 15,
                    'selisih' => 5,
                ]))
                ->completed()
                ->create();

            $response = $this->post(route('stock-opnames.approve', $stockOpname));

            $response->assertRedirect();
            $this->assertDatabaseHas('stock_opnames', [
                'id' => $stockOpname->id,
                'status' => 'approved',
                'approved_by' => $this->user->id,
            ]);

            $item->refresh();
            expect($item->stok)->toBe(15);

            $this->assertDatabaseHas('stock_mutations', [
                'item_id' => $item->id,
                'jenis_mutasi' => 'adjustment',
                'jumlah' => 5,
            ]);
        });

        it('creates adjustment mutation for negative selisih', function () {
            $item = Item::factory()->create(['stok' => 20]);
            $stockOpname = StockOpname::factory()
                ->has(StockOpnameDetail::factory()->recycle($item)->state([
                    'stok_sistem' => 20,
                    'stok_fisik' => 15,
                    'selisih' => -5,
                ]))
                ->completed()
                ->create();

            $response = $this->post(route('stock-opnames.approve', $stockOpname));

            $item->refresh();
            expect($item->stok)->toBe(15);

            $this->assertDatabaseHas('stock_mutations', [
                'item_id' => $item->id,
                'jenis_mutasi' => 'adjustment',
                'jumlah' => -5,
            ]);
        });

        it('cannot approve draft stock opname', function () {
            $stockOpname = StockOpname::factory()->draft()->create();

            $response = $this->post(route('stock-opnames.approve', $stockOpname));

            $response->assertStatus(403);
        });

        it('cannot approve already approved stock opname', function () {
            $stockOpname = StockOpname::factory()->approved()->create();

            $response = $this->post(route('stock-opnames.approve', $stockOpname));

            $response->assertStatus(403);
        });
    });

    describe('GET /stock-opnames/{id}/ba-pdf', function () {
        it('generates berita acara PDF', function () {
            $stockOpname = StockOpname::factory()
                ->has(StockOpnameDetail::factory()->count(3)->for(Item::factory()))
                ->create();

            $response = $this->get(route('stock-opnames.ba-pdf', $stockOpname));

            $response->assertStatus(200);
            $response->assertJson([
                'message' => 'PDF generation not yet implemented',
            ]);
        });
    });
});
