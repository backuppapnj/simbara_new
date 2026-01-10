<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('StockMutation Model', function () {
    it('can be instantiated', function () {
        $mutation = new \App\Models\StockMutation;

        expect($mutation)->not->toBeNull();
    });

    it('has correct table name', function () {
        $mutation = new \App\Models\StockMutation;

        expect($mutation->getTable())->toBe('stock_mutations');
    });

    it('has fillable attributes', function () {
        $mutation = new \App\Models\StockMutation;

        expect($mutation->getFillable())->toContain('item_id');
        expect($mutation->getFillable())->toContain('jenis_mutasi');
        expect($mutation->getFillable())->toContain('jumlah');
        expect($mutation->getFillable())->toContain('stok_sebelum');
        expect($mutation->getFillable())->toContain('stok_sesudah');
        expect($mutation->getFillable())->toContain('referensi_id');
        expect($mutation->getFillable())->toContain('referensi_tipe');
        expect($mutation->getFillable())->toContain('keterangan');
    });

    it('has timestamps', function () {
        $mutation = new \App\Models\StockMutation;

        expect($mutation->timestamps)->toBeTrue();
    });

    it('uses soft deletes', function () {
        $mutation = new \App\Models\StockMutation;

        expect(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($mutation)))->toBeTrue();
    });

    it('has casts method', function () {
        $mutation = new \App\Models\StockMutation;

        expect(method_exists($mutation, 'casts'))->toBeTrue();
    });

    it('generates ULID on creation', function () {
        $mutation = \App\Models\StockMutation::factory()->create();

        expect($mutation->id)->not->toBeEmpty();
        expect(strlen($mutation->id))->toBe(26);
    });

    it('belongs to an item', function () {
        $item = \App\Models\Item::factory()->create();
        $mutation = \App\Models\StockMutation::factory()->create(['item_id' => $item->id]);

        expect($mutation->item)->toBeInstanceOf(\App\Models\Item::class);
        expect($mutation->item->id)->toBe($item->id);
    });

    it('has correct jenis_mutasi values', function () {
        $item = \App\Models\Item::factory()->create();

        $masuk = \App\Models\StockMutation::factory()->masuk()->create(['item_id' => $item->id]);
        $keluar = \App\Models\StockMutation::factory()->keluar()->create(['item_id' => $item->id]);
        $adjustment = \App\Models\StockMutation::factory()->adjustment()->create(['item_id' => $item->id]);

        expect($masuk->jenis_mutasi)->toBe('masuk');
        expect($keluar->jenis_mutasi)->toBe('keluar');
        expect($adjustment->jenis_mutasi)->toBe('adjustment');
    });
});
