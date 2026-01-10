<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('OfficeRequestDetail Model', function () {
    it('can be instantiated', function () {
        $detail = new \App\Models\OfficeRequestDetail;

        expect($detail)->not->toBeNull();
    });

    it('has correct table name', function () {
        $detail = new \App\Models\OfficeRequestDetail;

        expect($detail->getTable())->toBe('office_request_details');
    });

    it('has fillable attributes', function () {
        $detail = new \App\Models\OfficeRequestDetail;

        expect($detail->getFillable())->toContain('request_id');
        expect($detail->getFillable())->toContain('supply_id');
        expect($detail->getFillable())->toContain('jumlah');
        expect($detail->getFillable())->toContain('jumlah_diberikan');
    });

    it('generates ULID on creation', function () {
        $detail = \App\Models\OfficeRequestDetail::factory()->create();

        expect($detail->id)->not->toBeEmpty();
        expect(strlen($detail->id))->toBe(26);
    });

    it('has request relationship', function () {
        $detail = \App\Models\OfficeRequestDetail::factory()->create();

        expect(method_exists($detail, 'request'))->toBeTrue();
    });

    it('has supply relationship', function () {
        $detail = \App\Models\OfficeRequestDetail::factory()->create();

        expect(method_exists($detail, 'supply'))->toBeTrue();
    });

    it('correctly relates to request', function () {
        $request = \App\Models\OfficeRequest::factory()->create();
        $detail = \App\Models\OfficeRequestDetail::factory()->create([
            'request_id' => $request->id,
        ]);

        expect($detail->request->id)->toBe($request->id);
    });

    it('correctly relates to supply', function () {
        $supply = \App\Models\OfficeSupply::factory()->create();
        $detail = \App\Models\OfficeRequestDetail::factory()->create([
            'supply_id' => $supply->id,
        ]);

        expect($detail->supply->id)->toBe($supply->id);
    });

    it('has casts method', function () {
        $detail = new \App\Models\OfficeRequestDetail;

        expect(method_exists($detail, 'casts'))->toBeTrue();
    });
});
