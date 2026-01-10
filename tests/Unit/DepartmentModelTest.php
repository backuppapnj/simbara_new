<?php

describe('Department Model', function () {
    it('can be instantiated', function () {
        $department = new \App\Models\Department;

        expect($department)->not->toBeNull();
    });

    it('has correct table name', function () {
        $department = new \App\Models\Department;

        expect($department->getTable())->toBe('departments');
    });

    it('has fillable attributes', function () {
        $department = new \App\Models\Department;

        expect($department->getFillable())->toContain('nama_unit');
        expect($department->getFillable())->toContain('singkat');
        expect($department->getFillable())->toContain('kepala_unit');
    });

    it('has timestamps', function () {
        $department = new \App\Models\Department;

        expect($department->timestamps)->toBeTrue();
    });
});
