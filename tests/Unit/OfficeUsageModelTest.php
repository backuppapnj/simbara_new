<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('OfficeUsage Model', function () {
    it('can be instantiated', function () {
        $usage = new \App\Models\OfficeUsage;

        expect($usage)->not->toBeNull();
    });

    it('has correct table name', function () {
        $usage = new \App\Models\OfficeUsage;

        expect($usage->getTable())->toBe('office_usages');
    });

    it('has fillable attributes', function () {
        $usage = new \App\Models\OfficeUsage;

        expect($usage->getFillable())->toContain('supply_id');
        expect($usage->getFillable())->toContain('jumlah');
        expect($usage->getFillable())->toContain('tanggal');
        expect($usage->getFillable())->toContain('keperluan');
        expect($usage->getFillable())->toContain('user_id');
    });

    it('has timestamps', function () {
        $usage = new \App\Models\OfficeUsage;

        expect($usage->timestamps)->toBeTrue();
    });

    it('generates ULID on creation', function () {
        $usage = \App\Models\OfficeUsage::factory()->create();

        expect($usage->id)->not->toBeEmpty();
        expect(strlen($usage->id))->toBe(26);
    });

    it('has supply relationship', function () {
        $usage = \App\Models\OfficeUsage::factory()->create();

        expect(method_exists($usage, 'supply'))->toBeTrue();
    });

    it('has user relationship', function () {
        $usage = \App\Models\OfficeUsage::factory()->create();

        expect(method_exists($usage, 'user'))->toBeTrue();
    });

    it('correctly relates to supply', function () {
        $supply = \App\Models\OfficeSupply::factory()->create();
        $usage = \App\Models\OfficeUsage::factory()->create([
            'supply_id' => $supply->id,
        ]);

        expect($usage->supply->id)->toBe($supply->id);
    });

    it('correctly relates to user', function () {
        $user = \App\Models\User::factory()->create();
        $usage = \App\Models\OfficeUsage::factory()->create([
            'user_id' => $user->id,
        ]);

        expect($usage->user->id)->toBe($user->id);
    });

    it('has casts method', function () {
        $usage = new \App\Models\OfficeUsage;

        expect(method_exists($usage, 'casts'))->toBeTrue();
    });

    it('casts tanggal to date', function () {
        $usage = \App\Models\OfficeUsage::factory()->create([
            'tanggal' => '2026-01-10',
        ]);

        expect($usage->tanggal)->toBeInstanceOf(\Illuminate\Support\Carbon::class);
    });
});
