<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('OfficePurchase Model', function () {
    it('can be instantiated', function () {
        $purchase = new \App\Models\OfficePurchase;

        expect($purchase)->not->toBeNull();
    });

    it('has correct table name', function () {
        $purchase = new \App\Models\OfficePurchase;

        expect($purchase->getTable())->toBe('office_purchases');
    });

    it('has fillable attributes', function () {
        $purchase = new \App\Models\OfficePurchase;

        expect($purchase->getFillable())->toContain('no_pembelian');
        expect($purchase->getFillable())->toContain('tanggal');
        expect($purchase->getFillable())->toContain('supplier');
        expect($purchase->getFillable())->toContain('total_nilai');
        expect($purchase->getFillable())->toContain('keterangan');
    });

    it('has timestamps', function () {
        $purchase = new \App\Models\OfficePurchase;

        expect($purchase->timestamps)->toBeTrue();
    });

    it('uses soft deletes', function () {
        $purchase = new \App\Models\OfficePurchase;

        expect(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($purchase)))->toBeTrue();
    });

    it('generates ULID on creation', function () {
        $purchase = \App\Models\OfficePurchase::factory()->create();

        expect($purchase->id)->not->toBeEmpty();
        expect(strlen($purchase->id))->toBe(26);
    });

    it('has details relationship', function () {
        $purchase = \App\Models\OfficePurchase::factory()->create();

        expect(method_exists($purchase, 'details'))->toBeTrue();
    });

    it('correctly relates to details', function () {
        $purchase = \App\Models\OfficePurchase::factory()->create();
        $detail = \App\Models\OfficePurchaseDetail::factory()->create([
            'purchase_id' => $purchase->id,
        ]);

        expect($purchase->details->first()->id)->toBe($detail->id);
    });

    it('has casts method', function () {
        $purchase = new \App\Models\OfficePurchase;

        expect(method_exists($purchase, 'casts'))->toBeTrue();
    });

    it('casts total_nilai to decimal', function () {
        $purchase = \App\Models\OfficePurchase::factory()->create([
            'total_nilai' => 150000.50,
        ]);

        expect($purchase->total_nilai)->toBe('150000.50');
    });
});
