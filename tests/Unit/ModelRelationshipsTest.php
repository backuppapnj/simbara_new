<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Model Relationships', function () {
    it('Item has many purchaseDetails', function () {
        $item = \App\Models\Item::factory()->create();
        \App\Models\PurchaseDetail::factory()->create(['item_id' => $item->id]);
        \App\Models\PurchaseDetail::factory()->create(['item_id' => $item->id]);

        expect($item->purchaseDetails)->toHaveCount(2);
        expect($item->purchaseDetails->first())->toBeInstanceOf(\App\Models\PurchaseDetail::class);
    });

    it('Item has many requestDetails', function () {
        $item = \App\Models\Item::factory()->create();
        \App\Models\RequestDetail::factory()->create(['item_id' => $item->id]);
        \App\Models\RequestDetail::factory()->create(['item_id' => $item->id]);

        expect($item->requestDetails)->toHaveCount(2);
        expect($item->requestDetails->first())->toBeInstanceOf(\App\Models\RequestDetail::class);
    });

    it('Item has many stockOpnameDetails', function () {
        $item = \App\Models\Item::factory()->create();
        \App\Models\StockOpnameDetail::factory()->create(['item_id' => $item->id]);
        \App\Models\StockOpnameDetail::factory()->create(['item_id' => $item->id]);

        expect($item->stockOpnameDetails)->toHaveCount(2);
        expect($item->stockOpnameDetails->first())->toBeInstanceOf(\App\Models\StockOpnameDetail::class);
    });

    it('Item has many stockMutations', function () {
        $item = \App\Models\Item::factory()->create();
        \App\Models\StockMutation::factory()->create(['item_id' => $item->id]);
        \App\Models\StockMutation::factory()->create(['item_id' => $item->id]);

        expect($item->stockMutations)->toHaveCount(2);
        expect($item->stockMutations->first())->toBeInstanceOf(\App\Models\StockMutation::class);
    });

    it('Purchase has many purchaseDetails', function () {
        $purchase = \App\Models\Purchase::factory()->create();
        \App\Models\PurchaseDetail::factory()->create(['purchase_id' => $purchase->id]);
        \App\Models\PurchaseDetail::factory()->create(['purchase_id' => $purchase->id]);

        expect($purchase->purchaseDetails)->toHaveCount(2);
        expect($purchase->purchaseDetails->first())->toBeInstanceOf(\App\Models\PurchaseDetail::class);
    });

    it('PurchaseDetail belongs to purchase', function () {
        $purchase = \App\Models\Purchase::factory()->create();
        $detail = \App\Models\PurchaseDetail::factory()->create(['purchase_id' => $purchase->id]);

        expect($detail->purchase->id)->toBe($purchase->id);
        expect($detail->purchase)->toBeInstanceOf(\App\Models\Purchase::class);
    });

    it('PurchaseDetail belongs to item', function () {
        $item = \App\Models\Item::factory()->create();
        $detail = \App\Models\PurchaseDetail::factory()->create(['item_id' => $item->id]);

        expect($detail->item->id)->toBe($item->id);
        expect($detail->item)->toBeInstanceOf(\App\Models\Item::class);
    });

    it('AtkRequest has many requestDetails', function () {
        $request = \App\Models\AtkRequest::factory()->create();
        \App\Models\RequestDetail::factory()->create(['request_id' => $request->id]);
        \App\Models\RequestDetail::factory()->create(['request_id' => $request->id]);

        expect($request->requestDetails)->toHaveCount(2);
        expect($request->requestDetails->first())->toBeInstanceOf(\App\Models\RequestDetail::class);
    });

    it('AtkRequest belongs to user', function () {
        $user = \App\Models\User::factory()->create();
        $request = \App\Models\AtkRequest::factory()->create(['user_id' => $user->id]);

        expect($request->user->id)->toBe($user->id);
        expect($request->user)->toBeInstanceOf(\App\Models\User::class);
    });

    it('AtkRequest belongs to department', function () {
        $department = \App\Models\Department::factory()->create();
        $request = \App\Models\AtkRequest::factory()->create(['department_id' => $department->id]);

        expect($request->department->id)->toBe($department->id);
        expect($request->department)->toBeInstanceOf(\App\Models\Department::class);
    });

    it('RequestDetail belongs to request', function () {
        $request = \App\Models\AtkRequest::factory()->create();
        $detail = \App\Models\RequestDetail::factory()->create(['request_id' => $request->id]);

        expect($detail->request->id)->toBe($request->id);
        expect($detail->request)->toBeInstanceOf(\App\Models\AtkRequest::class);
    });

    it('RequestDetail belongs to item', function () {
        $item = \App\Models\Item::factory()->create();
        $detail = \App\Models\RequestDetail::factory()->create(['item_id' => $item->id]);

        expect($detail->item->id)->toBe($item->id);
        expect($detail->item)->toBeInstanceOf(\App\Models\Item::class);
    });

    it('StockOpname has many stockOpnameDetails', function () {
        $stockOpname = \App\Models\StockOpname::factory()->create();
        \App\Models\StockOpnameDetail::factory()->create(['stock_opname_id' => $stockOpname->id]);
        \App\Models\StockOpnameDetail::factory()->create(['stock_opname_id' => $stockOpname->id]);

        expect($stockOpname->stockOpnameDetails)->toHaveCount(2);
        expect($stockOpname->stockOpnameDetails->first())->toBeInstanceOf(\App\Models\StockOpnameDetail::class);
    });

    it('StockOpname belongs to approver', function () {
        $user = \App\Models\User::factory()->create();
        $stockOpname = \App\Models\StockOpname::factory()->create(['approved_by' => $user->id]);

        expect($stockOpname->approver->id)->toBe($user->id);
        expect($stockOpname->approver)->toBeInstanceOf(\App\Models\User::class);
    });

    it('StockOpnameDetail belongs to stockOpname', function () {
        $stockOpname = \App\Models\StockOpname::factory()->create();
        $detail = \App\Models\StockOpnameDetail::factory()->create(['stock_opname_id' => $stockOpname->id]);

        expect($detail->stockOpname->id)->toBe($stockOpname->id);
        expect($detail->stockOpname)->toBeInstanceOf(\App\Models\StockOpname::class);
    });

    it('StockOpnameDetail belongs to item', function () {
        $item = \App\Models\Item::factory()->create();
        $detail = \App\Models\StockOpnameDetail::factory()->create(['item_id' => $item->id]);

        expect($detail->item->id)->toBe($item->id);
        expect($detail->item)->toBeInstanceOf(\App\Models\Item::class);
    });

    it('StockMutation belongs to item', function () {
        $item = \App\Models\Item::factory()->create();
        $mutation = \App\Models\StockMutation::factory()->create(['item_id' => $item->id]);

        expect($mutation->item->id)->toBe($item->id);
        expect($mutation->item)->toBeInstanceOf(\App\Models\Item::class);
    });
});
