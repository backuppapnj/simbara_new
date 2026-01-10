<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('OfficeMutation Model', function () {
    it('can be instantiated', function () {
        $mutation = new \App\Models\OfficeMutation;

        expect($mutation)->not->toBeNull();
    });

    it('has correct table name', function () {
        $mutation = new \App\Models\OfficeMutation;

        expect($mutation->getTable())->toBe('office_mutations');
    });

    it('has fillable attributes', function () {
        $mutation = new \App\Models\OfficeMutation;

        expect($mutation->getFillable())->toContain('supply_id');
        expect($mutation->getFillable())->toContain('jenis_mutasi');
        expect($mutation->getFillable())->toContain('jumlah');
        expect($mutation->getFillable())->toContain('stok_sebelum');
        expect($mutation->getFillable())->toContain('stok_sesudah');
        expect($mutation->getFillable())->toContain('tipe');
        expect($mutation->getFillable())->toContain('referensi_id');
        expect($mutation->getFillable())->toContain('user_id');
        expect($mutation->getFillable())->toContain('keterangan');
    });

    it('has timestamps', function () {
        $mutation = new \App\Models\OfficeMutation;

        expect($mutation->timestamps)->toBeTrue();
    });

    it('uses soft deletes', function () {
        $mutation = new \App\Models\OfficeMutation;

        expect(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($mutation)))->toBeTrue();
    });

    it('generates ULID on creation', function () {
        $mutation = \App\Models\OfficeMutation::factory()->create();

        expect($mutation->id)->not->toBeEmpty();
        expect(strlen($mutation->id))->toBe(26);
    });

    it('has supply relationship', function () {
        $mutation = \App\Models\OfficeMutation::factory()->create();

        expect(method_exists($mutation, 'supply'))->toBeTrue();
    });

    it('has user relationship', function () {
        $mutation = \App\Models\OfficeMutation::factory()->create();

        expect(method_exists($mutation, 'user'))->toBeTrue();
    });

    it('correctly relates to supply', function () {
        $supply = \App\Models\OfficeSupply::factory()->create();
        $mutation = \App\Models\OfficeMutation::factory()->create([
            'supply_id' => $supply->id,
        ]);

        expect($mutation->supply->id)->toBe($supply->id);
    });

    it('correctly relates to user', function () {
        $user = \App\Models\User::factory()->create();
        $mutation = \App\Models\OfficeMutation::factory()->create([
            'user_id' => $user->id,
        ]);

        expect($mutation->user->id)->toBe($user->id);
    });

    it('has casts method', function () {
        $mutation = new \App\Models\OfficeMutation;

        expect(method_exists($mutation, 'casts'))->toBeTrue();
    });
});
