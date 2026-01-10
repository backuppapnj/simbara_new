<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Office Model Relationships', function () {
    describe('OfficeSupply Relationships', function () {
        it('has many mutations', function () {
            $supply = \App\Models\OfficeSupply::factory()->create();
            \App\Models\OfficeMutation::factory()->count(3)->create(['supply_id' => $supply->id]);

            expect($supply->mutations)->toHaveCount(3);
        });

        it('has many request details', function () {
            $supply = \App\Models\OfficeSupply::factory()->create();
            \App\Models\OfficeRequestDetail::factory()->count(2)->create(['supply_id' => $supply->id]);

            expect($supply->requestDetails)->toHaveCount(2);
        });

        it('has many usages', function () {
            $supply = \App\Models\OfficeSupply::factory()->create();
            \App\Models\OfficeUsage::factory()->count(2)->create(['supply_id' => $supply->id]);

            expect($supply->usages)->toHaveCount(2);
        });

        it('checks if stock is below reorder point', function () {
            $supply = \App\Models\OfficeSupply::factory()->create([
                'stok' => 5,
                'stok_minimal' => 10,
            ]);

            expect($supply->isBelowReorderPoint())->toBeTrue();
        });
    });

    describe('OfficeMutation Relationships', function () {
        it('belongs to supply', function () {
            $supply = \App\Models\OfficeSupply::factory()->create();
            $mutation = \App\Models\OfficeMutation::factory()->create(['supply_id' => $supply->id]);

            expect($mutation->supply->id)->toBe($supply->id);
        });

        it('belongs to user', function () {
            $user = \App\Models\User::factory()->create();
            $mutation = \App\Models\OfficeMutation::factory()->create(['user_id' => $user->id]);

            expect($mutation->user->id)->toBe($user->id);
        });

        it('can have null user', function () {
            $mutation = \App\Models\OfficeMutation::factory()->create(['user_id' => null]);

            expect($mutation->user)->toBeNull();
        });
    });

    describe('OfficePurchase Relationships', function () {
        it('has many details', function () {
            $purchase = \App\Models\OfficePurchase::factory()->create();
            \App\Models\OfficePurchaseDetail::factory()->count(3)->create(['purchase_id' => $purchase->id]);

            expect($purchase->details)->toHaveCount(3);
        });

        it('auto-generates purchase number', function () {
            $purchase = \App\Models\OfficePurchase::factory()->create(['no_pembelian' => null]);

            expect($purchase->no_pembelian)->not->toBeNull();
            expect(str_starts_with($purchase->no_pembelian, 'PO-'))->toBeTrue();
        });
    });

    describe('OfficePurchaseDetail Relationships', function () {
        it('belongs to purchase', function () {
            $purchase = \App\Models\OfficePurchase::factory()->create();
            $detail = \App\Models\OfficePurchaseDetail::factory()->create(['purchase_id' => $purchase->id]);

            expect($detail->purchase->id)->toBe($purchase->id);
        });

        it('belongs to supply', function () {
            $supply = \App\Models\OfficeSupply::factory()->create();
            $detail = \App\Models\OfficePurchaseDetail::factory()->create(['supply_id' => $supply->id]);

            expect($detail->supply->id)->toBe($supply->id);
        });
    });

    describe('OfficeRequest Relationships', function () {
        it('has many details', function () {
            $request = \App\Models\OfficeRequest::factory()->create();
            \App\Models\OfficeRequestDetail::factory()->count(3)->create(['request_id' => $request->id]);

            expect($request->details)->toHaveCount(3);
        });

        it('belongs to user', function () {
            $user = \App\Models\User::factory()->create();
            $request = \App\Models\OfficeRequest::factory()->create(['user_id' => $user->id]);

            expect($request->user->id)->toBe($user->id);
        });

        it('belongs to department', function () {
            $department = \App\Models\Department::factory()->create();
            $request = \App\Models\OfficeRequest::factory()->create(['department_id' => $department->id]);

            expect($request->department->id)->toBe($department->id);
        });

        it('belongs to approvedBy user', function () {
            $approver = \App\Models\User::factory()->create();
            $request = \App\Models\OfficeRequest::factory()->create(['approved_by' => $approver->id]);

            expect($request->approvedBy->id)->toBe($approver->id);
        });

        it('can have null approvedBy', function () {
            $request = \App\Models\OfficeRequest::factory()->create(['approved_by' => null]);

            expect($request->approvedBy)->toBeNull();
        });

        it('auto-generates request number', function () {
            $request = \App\Models\OfficeRequest::factory()->create(['no_permintaan' => null]);

            expect($request->no_permintaan)->not->toBeNull();
            expect(str_starts_with($request->no_permintaan, 'REQ-'))->toBeTrue();
        });
    });

    describe('OfficeRequestDetail Relationships', function () {
        it('belongs to request', function () {
            $request = \App\Models\OfficeRequest::factory()->create();
            $detail = \App\Models\OfficeRequestDetail::factory()->create(['request_id' => $request->id]);

            expect($detail->request->id)->toBe($request->id);
        });

        it('belongs to supply', function () {
            $supply = \App\Models\OfficeSupply::factory()->create();
            $detail = \App\Models\OfficeRequestDetail::factory()->create(['supply_id' => $supply->id]);

            expect($detail->supply->id)->toBe($supply->id);
        });
    });

    describe('OfficeUsage Relationships', function () {
        it('belongs to supply', function () {
            $supply = \App\Models\OfficeSupply::factory()->create();
            $usage = \App\Models\OfficeUsage::factory()->create(['supply_id' => $supply->id]);

            expect($usage->supply->id)->toBe($supply->id);
        });

        it('belongs to user', function () {
            $user = \App\Models\User::factory()->create();
            $usage = \App\Models\OfficeUsage::factory()->create(['user_id' => $user->id]);

            expect($usage->user->id)->toBe($user->id);
        });
    });
});
