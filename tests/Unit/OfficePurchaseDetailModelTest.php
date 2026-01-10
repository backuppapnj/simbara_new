<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('OfficePurchaseDetail Model', function () {
    it('can be instantiated', function () {
        $detail = new \App\Models\OfficePurchaseDetail;

        expect($detail)->not->toBeNull();
    });

    it('has correct table name', function () {
        $detail = new \App\Models\OfficePurchaseDetail;

        expect($detail->getTable())->toBe('office_purchase_details');
    });

    it('has fillable attributes', function () {
        $detail = new \App\Models\OfficePurchaseDetail;

        expect($detail->getFillable())->toContain('purchase_id');
        expect($detail->getFillable())->toContain('supply_id');
        expect($detail->getFillable())->toContain('jumlah');
        expect($detail->getFillable())->toContain('subtotal');
    });

    it('generates ULID on creation', function () {
        $detail = \App\Models\OfficePurchaseDetail::factory()->create();

        expect($detail->id)->not->toBeEmpty();
        expect(strlen($detail->id))->toBe(26);
    });

    it('has purchase relationship', function () {
        $detail = \App\Models\OfficePurchaseDetail::factory()->create();

        expect(method_exists($detail, 'purchase'))->toBeTrue();
    });

    it('has supply relationship', function () {
        $detail = \App\Models\OfficePurchaseDetail::factory()->create();

        expect(method_exists($detail, 'supply'))->toBeTrue();
    });

    it('correctly relates to purchase', function () {
        $purchase = \App\Models\OfficePurchase::factory()->create();
        $detail = \App\Models\OfficePurchaseDetail::factory()->create([
            'purchase_id' => $purchase->id,
        ]);

        expect($detail->purchase->id)->toBe($purchase->id);
    });

    it('correctly relates to supply', function () {
        $supply = \App\Models\OfficeSupply::factory()->create();
        $detail = \App\Models\OfficePurchaseDetail::factory()->create([
            'supply_id' => $supply->id,
        ]);

        expect($detail->supply->id)->toBe($supply->id);
    });

    it('has casts method', function () {
        $detail = new \App\Models\OfficePurchaseDetail;

        expect(method_exists($detail, 'casts'))->toBeTrue();
    });

    it('casts subtotal to decimal', function () {
        $detail = \App\Models\OfficePurchaseDetail::factory()->create([
            'subtotal' => 50000.75,
        ]);

        expect($detail->subtotal)->toBe('50000.75');
    });
});
