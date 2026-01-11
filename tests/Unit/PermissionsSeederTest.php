<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles and permissions before each test
    $this->seed(\Database\Seeders\RolesSeeder::class);
    $this->seed(\Database\Seeders\PermissionsSeeder::class);
});

describe('PermissionsSeeder', function () {
    describe('Permission Creation', function () {
        it('creates all expected permissions', function () {
            $totalPermissions = Permission::count();

            expect($totalPermissions)->toBeGreaterThanOrEqual(50);
        });

        it('creates assets module permissions', function () {
            $assetPermissions = Permission::where('name', 'like', 'assets.%')->get();

            expect($assetPermissions)->not->toBeEmpty();

            $expectedPermissions = [
                'assets.view',
                'assets.create',
                'assets.edit',
                'assets.delete',
                'assets.import',
                'assets.export',
                'assets.photos.view',
                'assets.photos.upload',
                'assets.photos.delete',
                'assets.maintenance.view',
                'assets.maintenance.create',
                'assets.maintenance.edit',
                'assets.maintenance.delete',
                'assets.reports.view',
                'assets.reports.export',
            ];

            foreach ($expectedPermissions as $permissionName) {
                expect($assetPermissions->pluck('name'))->toContain($permissionName);
            }
        });

        it('creates atk module permissions', function () {
            $atkPermissions = Permission::where('name', 'like', 'atk.%')->get();

            expect($atkPermissions)->not->toBeEmpty();

            $expectedPermissions = [
                'atk.view',
                'atk.stock.view',
                'atk.items.create',
                'atk.items.edit',
                'atk.items.delete',
                'atk.purchases.view',
                'atk.purchases.create',
                'atk.purchases.approve',
                'atk.requests.view',
                'atk.requests.create',
                'atk.requests.approve',
                'atk.requests.reject',
                'atk.requests.distribute',
                'atk.reports.view',
                'atk.reports.export',
            ];

            foreach ($expectedPermissions as $permissionName) {
                expect($atkPermissions->pluck('name'))->toContain($permissionName);
            }
        });

        it('creates office module permissions', function () {
            $officePermissions = Permission::where('name', 'like', 'office.%')->get();

            expect($officePermissions)->not->toBeEmpty();

            $expectedPermissions = [
                'office.view',
                'office.items.create',
                'office.items.edit',
                'office.items.delete',
                'office.stock.view',
                'office.usage.view',
                'office.usage.create',
                'office.mutations.view',
                'office.requests.view',
                'office.requests.create',
                'office.requests.approve',
                'office.requests.reject',
                'office.reports.view',
                'office.reports.export',
            ];

            foreach ($expectedPermissions as $permissionName) {
                expect($officePermissions->pluck('name'))->toContain($permissionName);
            }
        });

        it('creates stock_opnames module permissions', function () {
            $stockOpnamePermissions = Permission::where('name', 'like', 'stock_opnames.%')->get();

            expect($stockOpnamePermissions)->not->toBeEmpty();

            $expectedPermissions = [
                'stock_opnames.view',
                'stock_opnames.create',
                'stock_opnames.edit',
                'stock_opnames.delete',
                'stock_opnames.approve',
            ];

            foreach ($expectedPermissions as $permissionName) {
                expect($stockOpnamePermissions->pluck('name'))->toContain($permissionName);
            }
        });

        it('creates users module permissions', function () {
            $userPermissions = Permission::where('name', 'like', 'users.%')->get();

            expect($userPermissions)->not->toBeEmpty();

            $expectedPermissions = [
                'users.view',
                'users.create',
                'users.edit',
                'users.delete',
                'users.activate',
                'users.deactivate',
            ];

            foreach ($expectedPermissions as $permissionName) {
                expect($userPermissions->pluck('name'))->toContain($permissionName);
            }
        });

        it('creates roles module permissions', function () {
            $rolePermissions = Permission::where('name', 'like', 'roles.%')->get();

            expect($rolePermissions)->not->toBeEmpty();

            expect($rolePermissions->pluck('name'))->toContain('roles.view');
            expect($rolePermissions->pluck('name'))->toContain('roles.manage');
        });

        it('creates permissions module permissions', function () {
            $permissionPermissions = Permission::where('name', 'like', 'permissions.%')->get();

            expect($permissionPermissions)->not->toBeEmpty();

            expect($permissionPermissions->pluck('name'))->toContain('permissions.view');
            expect($permissionPermissions->pluck('name'))->toContain('permissions.manage');
        });

        it('creates settings module permissions', function () {
            $settingsPermissions = Permission::where('name', 'like', 'settings.%')->get();

            expect($settingsPermissions)->not->toBeEmpty();

            expect($settingsPermissions->pluck('name'))->toContain('settings.whatsapp');
            expect($settingsPermissions->pluck('name'))->toContain('settings.general');
        });
    });

    describe('Role-Permission Mappings', function () {
        it('assigns all permissions to super_admin role', function () {
            $superAdminRole = Role::where('name', 'super_admin')->first();
            $totalPermissions = Permission::count();

            expect($superAdminRole)->not->toBeNull();
            expect($superAdminRole->permissions->count())->toBe($totalPermissions);
        });

        it('assigns correct permissions to kpa role', function () {
            $kpaRole = Role::where('name', 'kpa')->first();

            expect($kpaRole)->not->toBeNull();

            // KPA should have all *.view permissions
            $viewPermissions = $kpaRole->permissions->filter(function ($permission) {
                return str_ends_with($permission->name, '.view');
            });

            expect($viewPermissions)->not->toBeEmpty();

            // KPA should have approval permissions
            expect($kpaRole->permissions->pluck('name'))->toContain('atk.requests.approve');
            expect($kpaRole->permissions->pluck('name'))->toContain('office.requests.approve');
        });

        it('assigns correct permissions to kasubag_umum role', function () {
            $kasubagRole = Role::where('name', 'kasubag_umum')->first();

            expect($kasubagRole)->not->toBeNull();

            // Kasubag should have all assets.* permissions
            $assetPermissions = $kasubagRole->permissions->filter(function ($permission) {
                return str_starts_with($permission->name, 'assets.');
            });

            expect($assetPermissions->count())->toBeGreaterThan(0);

            // Kasubag should have all atk.* permissions
            $atkPermissions = $kasubagRole->permissions->filter(function ($permission) {
                return str_starts_with($permission->name, 'atk.');
            });

            expect($atkPermissions->count())->toBeGreaterThan(0);

            // Kasubag should have all office.* permissions
            $officePermissions = $kasubagRole->permissions->filter(function ($permission) {
                return str_starts_with($permission->name, 'office.');
            });

            expect($officePermissions->count())->toBeGreaterThan(0);

            // Kasubag should have users.view and roles.manage
            expect($kasubagRole->permissions->pluck('name'))->toContain('users.view');
            expect($kasubagRole->permissions->pluck('name'))->toContain('roles.manage');
            expect($kasubagRole->permissions->pluck('name'))->toContain('settings.whatsapp');
        });

        it('assigns correct permissions to operator_bmn role', function () {
            $operatorBmnRole = Role::where('name', 'operator_bmn')->first();

            expect($operatorBmnRole)->not->toBeNull();

            // Operator BMN should have all assets.* permissions
            $assetPermissions = $operatorBmnRole->permissions->filter(function ($permission) {
                return str_starts_with($permission->name, 'assets.');
            });

            expect($assetPermissions->count())->toBeGreaterThan(0);

            // Operator BMN should have limited atk permissions
            expect($operatorBmnRole->permissions->pluck('name'))->toContain('atk.view');
            expect($operatorBmnRole->permissions->pluck('name'))->toContain('atk.stock.view');

            // Operator BMN should have office.view only
            expect($operatorBmnRole->permissions->pluck('name'))->toContain('office.view');
        });

        it('assigns correct permissions to operator_persediaan role', function () {
            $operatorPersediaanRole = Role::where('name', 'operator_persediaan')->first();

            expect($operatorPersediaanRole)->not->toBeNull();

            // Operator persediaan should have all atk.* permissions
            $atkPermissions = $operatorPersediaanRole->permissions->filter(function ($permission) {
                return str_starts_with($permission->name, 'atk.');
            });

            expect($atkPermissions->count())->toBeGreaterThan(0);

            // Operator persediaan should have all office.* permissions
            $officePermissions = $operatorPersediaanRole->permissions->filter(function ($permission) {
                return str_starts_with($permission->name, 'office.');
            });

            expect($officePermissions->count())->toBeGreaterThan(0);

            // Operator persediaan should have assets.view only
            expect($operatorPersediaanRole->permissions->pluck('name'))->toContain('assets.view');

            // Operator persediaan should have atk.requests.approve (level 1)
            expect($operatorPersediaanRole->permissions->pluck('name'))->toContain('atk.requests.approve');
        });

        it('assigns correct permissions to pegawai role', function () {
            $pegawaiRole = Role::where('name', 'pegawai')->first();

            expect($pegawaiRole)->not->toBeNull();

            // Pegawai should have limited view permissions
            expect($pegawaiRole->permissions->pluck('name'))->toContain('assets.view');
            expect($pegawaiRole->permissions->pluck('name'))->toContain('atk.view');
            expect($pegawaiRole->permissions->pluck('name'))->toContain('atk.stock.view');
            expect($pegawaiRole->permissions->pluck('name'))->toContain('office.view');

            // Pegawai should have create request permissions
            expect($pegawaiRole->permissions->pluck('name'))->toContain('atk.requests.create');
            expect($pegawaiRole->permissions->pluck('name'))->toContain('office.requests.create');

            // Pegawai should not have delete permissions
            $deletePermissions = $pegawaiRole->permissions->filter(function ($permission) {
                return str_contains($permission->name, '.delete');
            });

            expect($deletePermissions)->toBeEmpty();
        });
    });

    describe('Wildcard Expansion', function () {
        it('correctly expands *.view wildcard', function () {
            $kpaRole = Role::where('name', 'kpa')->first();

            // All modules should have .view permissions for KPA
            $modules = ['assets', 'atk', 'office', 'stock_opnames', 'users', 'roles', 'permissions', 'settings'];

            foreach ($modules as $module) {
                $viewPermission = "{$module}.view";
                expect($kpaRole->permissions->pluck('name'))->toContain($viewPermission);
            }
        });

        it('correctly expands *.reports.view wildcard', function () {
            $kpaRole = Role::where('name', 'kpa')->first();

            // All report view permissions should be assigned
            expect($kpaRole->permissions->pluck('name'))->toContain('assets.reports.view');
            expect($kpaRole->permissions->pluck('name'))->toContain('atk.reports.view');
            expect($kpaRole->permissions->pluck('name'))->toContain('office.reports.view');
        });

        it('correctly expands assets.* wildcard', function () {
            $kasubagRole = Role::where('name', 'kasubag_umum')->first();
            $allAssetPermissions = Permission::where('name', 'like', 'assets.%')->pluck('name');

            foreach ($allAssetPermissions as $permission) {
                expect($kasubagRole->permissions->pluck('name'))->toContain($permission);
            }
        });

        it('correctly expands atk.* wildcard', function () {
            $kasubagRole = Role::where('name', 'kasubag_umum')->first();
            $allAtkPermissions = Permission::where('name', 'like', 'atk.%')->pluck('name');

            foreach ($allAtkPermissions as $permission) {
                expect($kasubagRole->permissions->pluck('name'))->toContain($permission);
            }
        });

        it('correctly expands office.* wildcard', function () {
            $kasubagRole = Role::where('name', 'kasubag_umum')->first();
            $allOfficePermissions = Permission::where('name', 'like', 'office.%')->pluck('name');

            foreach ($allOfficePermissions as $permission) {
                expect($kasubagRole->permissions->pluck('name'))->toContain($permission);
            }
        });
    });

    describe('Idempotency', function () {
        it('can be run multiple times without duplicating permissions', function () {
            $initialCount = Permission::count();

            // Run seeder again
            $this->seed(\Database\Seeders\PermissionsSeeder::class);

            $finalCount = Permission::count();

            expect($finalCount)->toBe($initialCount);
        });

        it('can be run multiple times without duplicating role permissions', function () {
            $superAdminRole = Role::where('name', 'super_admin')->first();
            $initialCount = $superAdminRole->permissions->count();

            // Run seeder again
            $this->seed(\Database\Seeders\PermissionsSeeder::class);

            $superAdminRole->refresh();
            $finalCount = $superAdminRole->permissions->count();

            expect($finalCount)->toBe($initialCount);
        });
    });
});
