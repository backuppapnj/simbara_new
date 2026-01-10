<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('StockOpname Model', function () {
    it('can be instantiated', function () {
        $stockOpname = new \App\Models\StockOpname;

        expect($stockOpname)->not->toBeNull();
    });

    it('has correct table name', function () {
        $stockOpname = new \App\Models\StockOpname;

        expect($stockOpname->getTable())->toBe('stock_opnames');
    });

    it('has fillable attributes', function () {
        $stockOpname = new \App\Models\StockOpname;

        expect($stockOpname->getFillable())->toContain('no_so');
        expect($stockOpname->getFillable())->toContain('tanggal');
        expect($stockOpname->getFillable())->toContain('periode_bulan');
        expect($stockOpname->getFillable())->toContain('periode_tahun');
        expect($stockOpname->getFillable())->toContain('status');
        expect($stockOpname->getFillable())->toContain('approved_by');
        expect($stockOpname->getFillable())->toContain('approved_at');
        expect($stockOpname->getFillable())->toContain('keterangan');
    });

    it('has timestamps', function () {
        $stockOpname = new \App\Models\StockOpname;

        expect($stockOpname->timestamps)->toBeTrue();
    });

    it('uses soft deletes', function () {
        $stockOpname = new \App\Models\StockOpname;

        expect(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($stockOpname)))->toBeTrue();
    });

    it('has casts method', function () {
        $stockOpname = new \App\Models\StockOpname;

        expect(method_exists($stockOpname, 'casts'))->toBeTrue();
    });

    it('generates ULID on creation', function () {
        $stockOpname = \App\Models\StockOpname::factory()->create();

        expect($stockOpname->id)->not->toBeEmpty();
        expect(strlen($stockOpname->id))->toBe(26);
    });

    it('has stockOpnameDetails relationship', function () {
        $stockOpname = new \App\Models\StockOpname;

        expect(method_exists($stockOpname, 'stockOpnameDetails'))->toBeTrue();
    });

    it('has approver relationship', function () {
        $stockOpname = new \App\Models\StockOpname;

        expect(method_exists($stockOpname, 'approver'))->toBeTrue();
    });

    it('has correct status values', function () {
        $draft = \App\Models\StockOpname::factory()->draft()->create();
        $completed = \App\Models\StockOpname::factory()->completed()->create();
        $approved = \App\Models\StockOpname::factory()->approved()->create();

        expect($draft->status)->toBe('draft');
        expect($completed->status)->toBe('completed');
        expect($approved->status)->toBe('approved');
    });
});
