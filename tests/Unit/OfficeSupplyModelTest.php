<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('OfficeSupply Model', function () {
    it('can be instantiated', function () {
        $supply = new \App\Models\OfficeSupply;

        expect($supply)->not->toBeNull();
    });

    it('has correct table name', function () {
        $supply = new \App\Models\OfficeSupply;

        expect($supply->getTable())->toBe('office_supplies');
    });

    it('has fillable attributes', function () {
        $supply = new \App\Models\OfficeSupply;

        expect($supply->getFillable())->toContain('nama_barang');
        expect($supply->getFillable())->toContain('satuan');
        expect($supply->getFillable())->toContain('kategori');
        expect($supply->getFillable())->toContain('deskripsi');
        expect($supply->getFillable())->toContain('stok');
        expect($supply->getFillable())->toContain('stok_minimal');
    });

    it('has timestamps', function () {
        $supply = new \App\Models\OfficeSupply;

        expect($supply->timestamps)->toBeTrue();
    });

    it('uses soft deletes', function () {
        $supply = new \App\Models\OfficeSupply;

        expect(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($supply)))->toBeTrue();
    });

    it('has casts method', function () {
        $supply = new \App\Models\OfficeSupply;

        expect(method_exists($supply, 'casts'))->toBeTrue();
    });

    it('generates ULID on creation', function () {
        $supply = \App\Models\OfficeSupply::factory()->create();

        expect($supply->id)->not->toBeEmpty();
        expect(strlen($supply->id))->toBe(26);
    });

    it('has mutations relationship', function () {
        $supply = \App\Models\OfficeSupply::factory()->create();

        expect(method_exists($supply, 'mutations'))->toBeTrue();
    });

    it('checks if stock is below reorder point', function () {
        $supply = \App\Models\OfficeSupply::factory()->create([
            'stok' => 5,
            'stok_minimal' => 10,
        ]);

        expect($supply->isBelowReorderPoint())->toBeTrue();
    });

    it('checks if stock is not below reorder point', function () {
        $supply = \App\Models\OfficeSupply::factory()->create([
            'stok' => 15,
            'stok_minimal' => 10,
        ]);

        expect($supply->isBelowReorderPoint())->toBeFalse();
    });

    it('has requestDetails relationship', function () {
        $supply = \App\Models\OfficeSupply::factory()->create();

        expect(method_exists($supply, 'requestDetails'))->toBeTrue();
    });

    it('has usages relationship', function () {
        $supply = \App\Models\OfficeSupply::factory()->create();

        expect(method_exists($supply, 'usages'))->toBeTrue();
    });
});
