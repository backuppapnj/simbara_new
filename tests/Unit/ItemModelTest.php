<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Item Model', function () {
    it('can be instantiated', function () {
        $item = new \App\Models\Item;

        expect($item)->not->toBeNull();
    });

    it('has correct table name', function () {
        $item = new \App\Models\Item;

        expect($item->getTable())->toBe('items');
    });

    it('has fillable attributes', function () {
        $item = new \App\Models\Item;

        expect($item->getFillable())->toContain('kode_barang');
        expect($item->getFillable())->toContain('nama_barang');
        expect($item->getFillable())->toContain('satuan');
        expect($item->getFillable())->toContain('kategori');
        expect($item->getFillable())->toContain('stok');
        expect($item->getFillable())->toContain('stok_minimal');
        expect($item->getFillable())->toContain('stok_maksimal');
        expect($item->getFillable())->toContain('harga_beli_terakhir');
        expect($item->getFillable())->toContain('harga_rata_rata');
        expect($item->getFillable())->toContain('harga_jual');
    });

    it('has timestamps', function () {
        $item = new \App\Models\Item;

        expect($item->timestamps)->toBeTrue();
    });

    it('uses soft deletes', function () {
        $item = new \App\Models\Item;

        expect(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($item)))->toBeTrue();
    });

    it('has casts method', function () {
        $item = new \App\Models\Item;

        expect(method_exists($item, 'casts'))->toBeTrue();
    });

    it('casts decimal fields correctly', function () {
        $item = \App\Models\Item::factory()->create([
            'harga_beli_terakhir' => 10000.50,
            'harga_rata_rata' => 9500.75,
            'harga_jual' => 12000.00,
        ]);

        expect($item->harga_beli_terakhir)->toBe('10000.50');
        expect($item->harga_rata_rata)->toBe('9500.75');
        expect($item->harga_jual)->toBe('12000.00');
    });

    it('generates ULID on creation', function () {
        $item = \App\Models\Item::factory()->create();

        expect($item->id)->not->toBeEmpty();
        expect(strlen($item->id))->toBe(26);
    });

    it('has stock_mutations relationship', function () {
        $item = \App\Models\Item::factory()->create();

        expect(method_exists($item, 'stockMutations'))->toBeTrue();
    });

    it('checks if stock is below reorder point', function () {
        $item = \App\Models\Item::factory()->create([
            'stok' => 5,
            'stok_minimal' => 10,
        ]);

        expect($item->isBelowReorderPoint())->toBeTrue();
    });

    it('checks if stock is not below reorder point', function () {
        $item = \App\Models\Item::factory()->create([
            'stok' => 15,
            'stok_minimal' => 10,
        ]);

        expect($item->isBelowReorderPoint())->toBeFalse();
    });
});
