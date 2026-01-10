<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Purchase Model', function () {
    it('can be instantiated', function () {
        $purchase = new \App\Models\Purchase;

        expect($purchase)->not->toBeNull();
    });

    it('has correct table name', function () {
        $purchase = new \App\Models\Purchase;

        expect($purchase->getTable())->toBe('purchases');
    });

    it('has fillable attributes', function () {
        $purchase = new \App\Models\Purchase;

        expect($purchase->getFillable())->toContain('no_pembelian');
        expect($purchase->getFillable())->toContain('tanggal');
        expect($purchase->getFillable())->toContain('supplier');
        expect($purchase->getFillable())->toContain('total_nilai');
        expect($purchase->getFillable())->toContain('status');
        expect($purchase->getFillable())->toContain('keterangan');
    });

    it('has timestamps', function () {
        $purchase = new \App\Models\Purchase;

        expect($purchase->timestamps)->toBeTrue();
    });

    it('uses soft deletes', function () {
        $purchase = new \App\Models\Purchase;

        expect(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($purchase)))->toBeTrue();
    });

    it('has casts method', function () {
        $purchase = new \App\Models\Purchase;

        expect(method_exists($purchase, 'casts'))->toBeTrue();
    });

    it('generates ULID on creation', function () {
        $purchase = \App\Models\Purchase::factory()->create();

        expect($purchase->id)->not->toBeEmpty();
        expect(strlen($purchase->id))->toBe(26);
    });

    it('has purchaseDetails relationship', function () {
        $purchase = new \App\Models\Purchase;

        expect(method_exists($purchase, 'purchaseDetails'))->toBeTrue();
    });

    it('has correct status values', function () {
        $draft = \App\Models\Purchase::factory()->draft()->create();
        $received = \App\Models\Purchase::factory()->received()->create();
        $completed = \App\Models\Purchase::factory()->completed()->create();

        expect($draft->status)->toBe('draft');
        expect($received->status)->toBe('received');
        expect($completed->status)->toBe('completed');
    });
});
