<?php

use Database\Seeders\RolesSeeder;
use Spatie\Permission\Models\Role;

describe('RolesSeeder', function (): void {
    beforeEach(function (): void {
        Role::query()->delete();
    });

    it('can be instantiated', function (): void {
        $seeder = new RolesSeeder;

        expect($seeder)->toBeInstanceOf(RolesSeeder::class);
    });

    it('creates all 6 required roles', function (): void {
        $seeder = new RolesSeeder;
        $seeder->run();

        $expectedRoles = [
            'super_admin',
            'kpa',
            'kasubag_umum',
            'operator_bmn',
            'operator_persediaan',
            'pegawai',
        ];

        $createdRoles = Role::pluck('name')->toArray();

        foreach ($expectedRoles as $role) {
            expect($createdRoles)->toContain($role);
        }

        expect(Role::count())->toBe(6);
    });

    it('creates roles with correct guard name', function (): void {
        $seeder = new RolesSeeder;
        $seeder->run();

        $roles = Role::all();

        foreach ($roles as $role) {
            expect($role->guard_name)->toBe('web');
        }
    });

    it('does not duplicate roles when run multiple times', function (): void {
        $seeder = new RolesSeeder;

        $seeder->run();
        $seeder->run();

        expect(Role::count())->toBe(6);
    });
});
