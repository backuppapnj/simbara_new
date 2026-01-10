<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('PurchaseDetail Model', function () {
    it('can be instantiated', function () {
        $detail = new \App\Models\PurchaseDetail;

        expect($detail)->not->toBeNull();
    });

    it('has correct table name', function () {
        $detail = new \App\Models\PurchaseDetail;

        expect($detail->getTable())->toBe('purchase_details');
    });

    it('has fillable attributes', function () {
        $detail = new \App\Models\PurchaseDetail;

        expect($detail->getFillable())->toContain('purchase_id');
        expect($detail->getFillable())->toContain('item_id');
        expect($detail->getFillable())->toContain('jumlah');
        expect($detail->getFillable())->toContain('harga_satuan');
        expect($detail->getFillable())->toContain('subtotal');
    });

    it('has timestamps', function () {
        $detail = new \App\Models\PurchaseDetail;

        expect($detail->timestamps)->toBeTrue();
    });

    it('uses soft deletes', function () {
        $detail = new \App\Models\PurchaseDetail;

        expect(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($detail)))->toBeTrue();
    });

    it('has casts method', function () {
        $detail = new \App\Models\PurchaseDetail;

        expect(method_exists($detail, 'casts'))->toBeTrue();
    });

    it('generates ULID on creation', function () {
        $detail = \App\Models\PurchaseDetail::factory()->create();

        expect($detail->id)->not->toBeEmpty();
        expect(strlen($detail->id))->toBe(26);
    });

    it('belongs to a purchase', function () {
        $purchase = \App\Models\Purchase::factory()->create();
        $detail = \App\Models\PurchaseDetail::factory()->create(['purchase_id' => $purchase->id]);

        expect($detail->purchase)->toBeInstanceOf(\App\Models\Purchase::class);
        expect($detail->purchase->id)->toBe($purchase->id);
    });

    it('belongs to an item', function () {
        $item = \App\Models\Item::factory()->create();
        $detail = \App\Models\PurchaseDetail::factory()->create(['item_id' => $item->id]);

        expect($detail->item)->toBeInstanceOf(\App\Models\Item::class);
        expect($detail->item->id)->toBe($item->id);
    });
});
