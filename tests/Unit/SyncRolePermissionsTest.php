<?php

use App\Actions\SyncRolePermissions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles before each test
    $this->seed(\Database\Seeders\RolesSeeder::class);
});

describe('SyncRolePermissions', function () {
    describe('Super Admin Wildcard Permission', function () {
        it('assigns wildcard permission to super_admin role', function () {
            $superAdminRole = Role::where('name', 'super_admin')->first();
            $action = new SyncRolePermissions;

            $action->handle($superAdminRole, []);

            // Verify wildcard permission is assigned
            expect($superAdminRole->permissions)->toHaveCount(1);
            expect($superAdminRole->permissions->first()->name)->toBe('*');
        });

        it('creates wildcard permission if it does not exist', function () {
            $superAdminRole = Role::where('name', 'super_admin')->first();
            $action = new SyncRolePermissions;

            // Ensure wildcard doesn't exist
            Permission::where('name', '*')->delete();

            $action->handle($superAdminRole, []);

            // Verify wildcard permission was created and assigned
            $wildcard = Permission::where('name', '*')->first();
            expect($wildcard)->not->toBeNull();
            expect($superAdminRole->permissions->first()->id)->toBe($wildcard->id);
        });

        it('ignores provided permission_ids for super_admin role', function () {
            $superAdminRole = Role::where('name', 'super_admin')->first();
            $action = new SyncRolePermissions;

            // Create some test permissions
            $permission1 = Permission::create(['name' => 'test.view', 'guard_name' => 'web']);
            $permission2 = Permission::create(['name' => 'test.create', 'guard_name' => 'web']);

            // Try to sync these permissions to super_admin
            $action->handle($superAdminRole, [$permission1->id, $permission2->id]);

            // Verify only wildcard is assigned, not the individual permissions
            expect($superAdminRole->permissions)->toHaveCount(1);
            expect($superAdminRole->permissions->first()->name)->toBe('*');
        });

        it('replaces all permissions with wildcard for super_admin', function () {
            $superAdminRole = Role::where('name', 'super_admin')->first();
            $action = new SyncRolePermissions;

            // Manually assign some permissions first
            $permission1 = Permission::create(['name' => 'test.view', 'guard_name' => 'web']);
            $permission2 = Permission::create(['name' => 'test.create', 'guard_name' => 'web']);
            $superAdminRole->givePermissionTo([$permission1, $permission2]);

            expect($superAdminRole->permissions)->toHaveCount(2);

            // Sync should replace all with wildcard
            $action->handle($superAdminRole, []);

            expect($superAdminRole->permissions)->toHaveCount(1);
            expect($superAdminRole->permissions->first()->name)->toBe('*');
        });
    });

    describe('Regular Role Permission Sync', function () {
        it('syncs permissions to non-super_admin role', function () {
            $kpaRole = Role::where('name', 'kpa')->first();
            $action = new SyncRolePermissions;

            // Create test permissions
            $permission1 = Permission::create(['name' => 'assets.view', 'guard_name' => 'web']);
            $permission2 = Permission::create(['name' => 'atk.view', 'guard_name' => 'web']);

            $action->handle($kpaRole, [$permission1->id, $permission2->id]);

            // Verify permissions are assigned
            expect($kpaRole->permissions)->toHaveCount(2);
            expect($kpaRole->hasPermissionTo('assets.view'))->toBeTrue();
            expect($kpaRole->hasPermissionTo('atk.view'))->toBeTrue();
        });

        it('replaces existing permissions with new ones', function () {
            $kpaRole = Role::where('name', 'kpa')->first();
            $action = new SyncRolePermissions;

            // Create test permissions
            $permission1 = Permission::create(['name' => 'assets.view', 'guard_name' => 'web']);
            $permission2 = Permission::create(['name' => 'atk.view', 'guard_name' => 'web']);
            $permission3 = Permission::create(['name' => 'office.view', 'guard_name' => 'web']);

            // Assign first two permissions
            $action->handle($kpaRole, [$permission1->id, $permission2->id]);
            expect($kpaRole->permissions)->toHaveCount(2);

            // Replace with different permission
            $action->handle($kpaRole, [$permission3->id]);

            // Verify only new permission is assigned
            expect($kpaRole->permissions)->toHaveCount(1);
            expect($kpaRole->hasPermissionTo('office.view'))->toBeTrue();
            expect($kpaRole->hasPermissionTo('assets.view'))->toBeFalse();
        });

        it('removes all permissions when empty array is provided', function () {
            $kpaRole = Role::where('name', 'kpa')->first();
            $action = new SyncRolePermissions;

            // Create and assign permissions
            $permission1 = Permission::create(['name' => 'assets.view', 'guard_name' => 'web']);
            $permission2 = Permission::create(['name' => 'atk.view', 'guard_name' => 'web']);
            $kpaRole->givePermissionTo([$permission1, $permission2]);

            expect($kpaRole->permissions)->toHaveCount(2);

            // Sync with empty array should remove all
            $action->handle($kpaRole, []);

            expect($kpaRole->permissions)->toHaveCount(0);
        });

        it('ignores invalid permission ids', function () {
            $kpaRole = Role::where('name', 'kpa')->first();
            $action = new SyncRolePermissions;

            // Create valid permission
            $permission1 = Permission::create(['name' => 'assets.view', 'guard_name' => 'web']);

            // Mix valid and invalid IDs
            $action->handle($kpaRole, [$permission1->id, 99999, 88888]);

            // Verify only valid permission is assigned
            expect($kpaRole->permissions)->toHaveCount(1);
            expect($kpaRole->hasPermissionTo('assets.view'))->toBeTrue();
        });
    });

    describe('Deduplication Logic', function () {
        it('prevents duplicate permission names in sync', function () {
            $kpaRole = Role::where('name', 'kpa')->first();
            $action = new SyncRolePermissions;

            // Create test permissions
            $permission1 = Permission::create(['name' => 'assets.view', 'guard_name' => 'web']);
            $permission2 = Permission::create(['name' => 'atk.view', 'guard_name' => 'web']);

            // Pass same permission ID multiple times
            $action->handle($kpaRole, [$permission1->id, $permission1->id, $permission2->id]);

            // Verify only unique permissions are assigned
            expect($kpaRole->permissions)->toHaveCount(2);
            expect($kpaRole->hasPermissionTo('assets.view'))->toBeTrue();
            expect($kpaRole->hasPermissionTo('atk.view'))->toBeTrue();
        });

        it('uses syncPermissions which handles duplicates automatically', function () {
            $kpaRole = Role::where('name', 'kpa')->first();
            $action = new SyncRolePermissions;

            // Create test permissions
            $permission1 = Permission::create(['name' => 'assets.view', 'guard_name' => 'web']);
            $permission2 = Permission::create(['name' => 'atk.view', 'guard_name' => 'web']);

            // Sync permissions first time
            $action->handle($kpaRole, [$permission1->id, $permission2->id]);
            expect($kpaRole->permissions)->toHaveCount(2);

            // Sync again with same permissions (should not create duplicates)
            $action->handle($kpaRole, [$permission1->id, $permission2->id]);

            // Verify still only 2 permissions (no duplicates)
            expect($kpaRole->permissions)->toHaveCount(2);

            // Verify database has no duplicate entries
            $count = \DB::table('role_has_permissions')
                ->where('role_id', $kpaRole->id)
                ->count();
            expect($count)->toBe(2);
        });
    });

    describe('Edge Cases', function () {
        it('handles role with no initial permissions', function () {
            $pegawaiRole = Role::where('name', 'pegawai')->first();
            $action = new SyncRolePermissions;

            // Verify no permissions initially
            expect($pegawaiRole->permissions)->toHaveCount(0);

            // Sync permissions
            $permission1 = Permission::create(['name' => 'assets.view', 'guard_name' => 'web']);
            $action->handle($pegawaiRole, [$permission1->id]);

            expect($pegawaiRole->permissions)->toHaveCount(1);
        });

        it('preserves role after permission sync', function () {
            $kpaRole = Role::where('name', 'kpa')->first();
            $originalRoleId = $kpaRole->id;
            $originalRoleName = $kpaRole->name;
            $action = new SyncRolePermissions;

            $permission1 = Permission::create(['name' => 'assets.view', 'guard_name' => 'web']);
            $action->handle($kpaRole, [$permission1->id]);

            // Verify role is preserved
            $kpaRole->refresh();
            expect($kpaRole->id)->toBe($originalRoleId);
            expect($kpaRole->name)->toBe($originalRoleName);
        });
    });
});
