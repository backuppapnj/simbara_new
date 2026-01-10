<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('StockOpnameDetail Model', function () {
    it('can be instantiated', function () {
        $detail = new \App\Models\StockOpnameDetail;

        expect($detail)->not->toBeNull();
    });

    it('has correct table name', function () {
        $detail = new \App\Models\StockOpnameDetail;

        expect($detail->getTable())->toBe('stock_opname_details');
    });

    it('has fillable attributes', function () {
        $detail = new \App\Models\StockOpnameDetail;

        expect($detail->getFillable())->toContain('stock_opname_id');
        expect($detail->getFillable())->toContain('item_id');
        expect($detail->getFillable())->toContain('stok_sistem');
        expect($detail->getFillable())->toContain('stok_fisik');
        expect($detail->getFillable())->toContain('selisih');
        expect($detail->getFillable())->toContain('keterangan');
    });

    it('has timestamps', function () {
        $detail = new \App\Models\StockOpnameDetail;

        expect($detail->timestamps)->toBeTrue();
    });

    it('uses soft deletes', function () {
        $detail = new \App\Models\StockOpnameDetail;

        expect(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($detail)))->toBeTrue();
    });

    it('has casts method', function () {
        $detail = new \App\Models\StockOpnameDetail;

        expect(method_exists($detail, 'casts'))->toBeTrue();
    });

    it('generates ULID on creation', function () {
        $detail = \App\Models\StockOpnameDetail::factory()->create();

        expect($detail->id)->not->toBeEmpty();
        expect(strlen($detail->id))->toBe(26);
    });

    it('belongs to a stock opname', function () {
        $stockOpname = \App\Models\StockOpname::factory()->create();
        $detail = \App\Models\StockOpnameDetail::factory()->create(['stock_opname_id' => $stockOpname->id]);

        expect($detail->stockOpname)->toBeInstanceOf(\App\Models\StockOpname::class);
        expect($detail->stockOpname->id)->toBe($stockOpname->id);
    });

    it('belongs to an item', function () {
        $item = \App\Models\Item::factory()->create();
        $detail = \App\Models\StockOpnameDetail::factory()->create(['item_id' => $item->id]);

        expect($detail->item)->toBeInstanceOf(\App\Models\Item::class);
        expect($detail->item->id)->toBe($item->id);
    });

    it('calculates selisih correctly', function () {
        $item = \App\Models\Item::factory()->create(['stok' => 100]);
        $detail = \App\Models\StockOpnameDetail::create([
            'item_id' => $item->id,
            'stock_opname_id' => \App\Models\StockOpname::factory()->create()->id,
            'stok_sistem' => 100,
            'stok_fisik' => 95,
        ]);

        expect($detail->selisih)->toBe(-5);
    });
});
