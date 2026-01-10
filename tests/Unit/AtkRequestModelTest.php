<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('AtkRequest Model', function () {
    it('can be instantiated', function () {
        $request = new \App\Models\AtkRequest;

        expect($request)->not->toBeNull();
    });

    it('has correct table name', function () {
        $request = new \App\Models\AtkRequest;

        expect($request->getTable())->toBe('atk_requests');
    });

    it('has fillable attributes', function () {
        $request = new \App\Models\AtkRequest;

        expect($request->getFillable())->toContain('no_permintaan');
        expect($request->getFillable())->toContain('user_id');
        expect($request->getFillable())->toContain('department_id');
        expect($request->getFillable())->toContain('tanggal');
        expect($request->getFillable())->toContain('status');
        expect($request->getFillable())->toContain('level1_approval_by');
        expect($request->getFillable())->toContain('level1_approval_at');
        expect($request->getFillable())->toContain('level2_approval_by');
        expect($request->getFillable())->toContain('level2_approval_at');
        expect($request->getFillable())->toContain('level3_approval_by');
        expect($request->getFillable())->toContain('level3_approval_at');
        expect($request->getFillable())->toContain('keterangan');
        expect($request->getFillable())->toContain('alasan_penolakan');
    });

    it('has timestamps', function () {
        $request = new \App\Models\AtkRequest;

        expect($request->timestamps)->toBeTrue();
    });

    it('uses soft deletes', function () {
        $request = new \App\Models\AtkRequest;

        expect(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($request)))->toBeTrue();
    });

    it('has casts method', function () {
        $request = new \App\Models\AtkRequest;

        expect(method_exists($request, 'casts'))->toBeTrue();
    });

    it('generates ULID on creation', function () {
        $request = \App\Models\AtkRequest::factory()->create();

        expect($request->id)->not->toBeEmpty();
        expect(strlen($request->id))->toBe(26);
    });

    it('has requestDetails relationship', function () {
        $request = new \App\Models\AtkRequest;

        expect(method_exists($request, 'requestDetails'))->toBeTrue();
    });

    it('has user relationship', function () {
        $request = new \App\Models\AtkRequest;

        expect(method_exists($request, 'user'))->toBeTrue();
    });

    it('has department relationship', function () {
        $request = new \App\Models\AtkRequest;

        expect(method_exists($request, 'department'))->toBeTrue();
    });

    it('has level1Approver relationship', function () {
        $request = new \App\Models\AtkRequest;

        expect(method_exists($request, 'level1Approver'))->toBeTrue();
    });

    it('has level2Approver relationship', function () {
        $request = new \App\Models\AtkRequest;

        expect(method_exists($request, 'level2Approver'))->toBeTrue();
    });

    it('has level3Approver relationship', function () {
        $request = new \App\Models\AtkRequest;

        expect(method_exists($request, 'level3Approver'))->toBeTrue();
    });

    it('has correct status values', function () {
        $pending = \App\Models\AtkRequest::factory()->pending()->create();
        $level1Approved = \App\Models\AtkRequest::factory()->level1Approved()->create();
        $level2Approved = \App\Models\AtkRequest::factory()->level2Approved()->create();
        $level3Approved = \App\Models\AtkRequest::factory()->level3Approved()->create();
        $rejected = \App\Models\AtkRequest::factory()->rejected()->create();

        expect($pending->status)->toBe('pending');
        expect($level1Approved->status)->toBe('level1_approved');
        expect($level2Approved->status)->toBe('level2_approved');
        expect($level3Approved->status)->toBe('level3_approved');
        expect($rejected->status)->toBe('rejected');
    });
});
