<?php

use Database\Seeders\DepartmentsSeeder;
use Database\Seeders\LocationsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('LocationsSeeder and DepartmentsSeeder', function (): void {
    it('can instantiate LocationsSeeder', function (): void {
        $seeder = new LocationsSeeder;
        expect($seeder)->toBeInstanceOf(LocationsSeeder::class);
    });

    it('can instantiate DepartmentsSeeder', function (): void {
        $seeder = new DepartmentsSeeder;
        expect($seeder)->toBeInstanceOf(DepartmentsSeeder::class);
    });

    it('can run LocationsSeeder and create locations', function (): void {
        $this->seed(LocationsSeeder::class);

        $location = \App\Models\Location::first();
        expect($location)->not->toBeNull();
        expect($location->nama_ruangan)->not->toBeEmpty();
    });

    it('can run DepartmentsSeeder and create departments', function (): void {
        $this->seed(DepartmentsSeeder::class);

        $department = \App\Models\Department::first();
        expect($department)->not->toBeNull();
        expect($department->nama_unit)->not->toBeEmpty();
    });

    it('LocationsSeeder creates multiple locations', function (): void {
        $this->seed(LocationsSeeder::class);

        $count = \App\Models\Location::count();
        expect($count)->toBeGreaterThanOrEqual(5);
    });

    it('DepartmentsSeeder creates multiple departments', function (): void {
        $this->seed(DepartmentsSeeder::class);

        $count = \App\Models\Department::count();
        expect($count)->toBeGreaterThanOrEqual(5);
    });
});
