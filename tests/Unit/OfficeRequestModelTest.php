<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('OfficeRequest Model', function () {
    it('can be instantiated', function () {
        $request = new \App\Models\OfficeRequest;

        expect($request)->not->toBeNull();
    });

    it('has correct table name', function () {
        $request = new \App\Models\OfficeRequest;

        expect($request->getTable())->toBe('office_requests');
    });

    it('has fillable attributes', function () {
        $request = new \App\Models\OfficeRequest;

        expect($request->getFillable())->toContain('no_permintaan');
        expect($request->getFillable())->toContain('user_id');
        expect($request->getFillable())->toContain('department_id');
        expect($request->getFillable())->toContain('tanggal');
        expect($request->getFillable())->toContain('status');
        expect($request->getFillable())->toContain('approved_by');
        expect($request->getFillable())->toContain('approved_at');
        expect($request->getFillable())->toContain('completed_at');
        expect($request->getFillable())->toContain('keterangan');
        expect($request->getFillable())->toContain('alasan_penolakan');
    });

    it('has timestamps', function () {
        $request = new \App\Models\OfficeRequest;

        expect($request->timestamps)->toBeTrue();
    });

    it('uses soft deletes', function () {
        $request = new \App\Models\OfficeRequest;

        expect(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($request)))->toBeTrue();
    });

    it('generates ULID on creation', function () {
        $request = \App\Models\OfficeRequest::factory()->create();

        expect($request->id)->not->toBeEmpty();
        expect(strlen($request->id))->toBe(26);
    });

    it('has details relationship', function () {
        $request = \App\Models\OfficeRequest::factory()->create();

        expect(method_exists($request, 'details'))->toBeTrue();
    });

    it('has user relationship', function () {
        $request = \App\Models\OfficeRequest::factory()->create();

        expect(method_exists($request, 'user'))->toBeTrue();
    });

    it('has department relationship', function () {
        $request = \App\Models\OfficeRequest::factory()->create();

        expect(method_exists($request, 'department'))->toBeTrue();
    });

    it('has approvedBy relationship', function () {
        $request = \App\Models\OfficeRequest::factory()->create();

        expect(method_exists($request, 'approvedBy'))->toBeTrue();
    });

    it('has casts method', function () {
        $request = new \App\Models\OfficeRequest;

        expect(method_exists($request, 'casts'))->toBeTrue();
    });

    it('correctly relates to user', function () {
        $user = \App\Models\User::factory()->create();
        $request = \App\Models\OfficeRequest::factory()->create([
            'user_id' => $user->id,
        ]);

        expect($request->user->id)->toBe($user->id);
    });
});
