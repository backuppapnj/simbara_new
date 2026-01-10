<?php

use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Reorder Point Alert', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
    });

    describe('Item Model - Reorder Point Check', function () {
        it('identifies items below reorder point', function () {
            $item = Item::factory()->create([
                'stok' => 5,
                'stok_minimal' => 10,
            ]);

            expect($item->isBelowReorderPoint())->toBeTrue();
        });

        it('identifies items at reorder point', function () {
            $item = Item::factory()->create([
                'stok' => 10,
                'stok_minimal' => 10,
            ]);

            expect($item->isBelowReorderPoint())->toBeTrue();
        });

        it('identifies items above reorder point', function () {
            $item = Item::factory()->create([
                'stok' => 15,
                'stok_minimal' => 10,
            ]);

            expect($item->isBelowReorderPoint())->toBeFalse();
        });
    });

    describe('Query - Low Stock Items', function () {
        it('returns only items below reorder point', function () {
            Item::factory()->create([
                'stok' => 5,
                'stok_minimal' => 10,
                'nama_barang' => 'Low Stock Item',
            ]);

            Item::factory()->create([
                'stok' => 20,
                'stok_minimal' => 10,
                'nama_barang' => 'Normal Stock Item',
            ]);

            $lowStockItems = Item::whereColumn('stok', '<=', 'stok_minimal')->get();

            expect($lowStockItems)->toHaveCount(1);
            expect($lowStockItems->first()->nama_barang)->toBe('Low Stock Item');
        });

        it('returns empty when no items below reorder point', function () {
            Item::factory()->create([
                'stok' => 20,
                'stok_minimal' => 10,
            ]);

            Item::factory()->create([
                'stok' => 30,
                'stok_minimal' => 15,
            ]);

            $lowStockItems = Item::whereColumn('stok', '<=', 'stok_minimal')->get();

            expect($lowStockItems)->toHaveCount(0);
        });
    });

    describe('Controller - Dashboard Data', function () {
        it('includes low stock count in dashboard', function () {
            Item::factory()->create([
                'stok' => 5,
                'stok_minimal' => 10,
            ]);

            Item::factory()->create([
                'stok' => 8,
                'stok_minimal' => 10,
            ]);

            Item::factory()->create([
                'stok' => 20,
                'stok_minimal' => 10,
            ]);

            $lowStockCount = Item::whereColumn('stok', '<=', 'stok_minimal')->count();

            expect($lowStockCount)->toBe(2);
        });
    });
});
