<?php

use App\Models\Location;

describe('Location Model', function () {
    describe('model creation', function () {
        test('can be instantiated', function () {
            $location = new Location;
            expect($location)->not->toBeNull();
        });
    });

    describe('table name', function () {
        test('uses locations table', function () {
            $location = new Location;
            expect($location->getTable())->toBe('locations');
        });
    });

    describe('fillable attributes', function () {
        test('nama_ruangan field is fillable', function () {
            $location = new Location;
            expect(in_array('nama_ruangan', $location->getFillable()))->toBeTrue();
        });

        test('gedung field is fillable', function () {
            $location = new Location;
            expect(in_array('gedung', $location->getFillable()))->toBeTrue();
        });

        test('lantai field is fillable', function () {
            $location = new Location;
            expect(in_array('lantai', $location->getFillable()))->toBeTrue();
        });

        test('kapasitas field is fillable', function () {
            $location = new Location;
            expect(in_array('kapasitas', $location->getFillable()))->toBeTrue();
        });

        test('keterangan field is fillable', function () {
            $location = new Location;
            expect(in_array('keterangan', $location->getFillable()))->toBeTrue();
        });
    });

    describe('casts configuration', function () {
        test('lantai should be cast to integer', function () {
            $location = new Location;
            $casts = $location->getCasts();
            expect($casts['lantai'])->toBe('integer');
        });

        test('kapasitas should be cast to integer', function () {
            $location = new Location;
            $casts = $location->getCasts();
            expect($casts['kapasitas'])->toBe('integer');
        });
    });
});
