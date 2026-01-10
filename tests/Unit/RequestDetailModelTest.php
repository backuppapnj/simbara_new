<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('RequestDetail Model', function () {
    it('can be instantiated', function () {
        $detail = new \App\Models\RequestDetail;

        expect($detail)->not->toBeNull();
    });

    it('has correct table name', function () {
        $detail = new \App\Models\RequestDetail;

        expect($detail->getTable())->toBe('request_details');
    });

    it('has fillable attributes', function () {
        $detail = new \App\Models\RequestDetail;

        expect($detail->getFillable())->toContain('request_id');
        expect($detail->getFillable())->toContain('item_id');
        expect($detail->getFillable())->toContain('jumlah_diminta');
        expect($detail->getFillable())->toContain('jumlah_disetujui');
        expect($detail->getFillable())->toContain('jumlah_diberikan');
    });

    it('has timestamps', function () {
        $detail = new \App\Models\RequestDetail;

        expect($detail->timestamps)->toBeTrue();
    });

    it('uses soft deletes', function () {
        $detail = new \App\Models\RequestDetail;

        expect(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($detail)))->toBeTrue();
    });

    it('has casts method', function () {
        $detail = new \App\Models\RequestDetail;

        expect(method_exists($detail, 'casts'))->toBeTrue();
    });

    it('generates ULID on creation', function () {
        $detail = \App\Models\RequestDetail::factory()->create();

        expect($detail->id)->not->toBeEmpty();
        expect(strlen($detail->id))->toBe(26);
    });

    it('belongs to a request', function () {
        $request = \App\Models\AtkRequest::factory()->create();
        $detail = \App\Models\RequestDetail::factory()->create(['request_id' => $request->id]);

        expect($detail->request)->toBeInstanceOf(\App\Models\AtkRequest::class);
        expect($detail->request->id)->toBe($request->id);
    });

    it('belongs to an item', function () {
        $item = \App\Models\Item::factory()->create();
        $detail = \App\Models\RequestDetail::factory()->create(['item_id' => $item->id]);

        expect($detail->item)->toBeInstanceOf(\App\Models\Item::class);
        expect($detail->item->id)->toBe($item->id);
    });
});
