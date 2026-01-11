<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles and permissions before each test
    $this->seed(\Database\Seeders\RolesSeeder::class);
    $this->seed(\Database\Seeders\PermissionsSeeder::class);
});

describe('RolePermissionController', function () {
    describe('Index - Get Permissions by Role', function () {
        it('requires authentication', function () {
            $role = Role::where('name', 'pegawai')->first();

            $response = $this->get(route('admin.roles.permissions.index', $role));

            $response->assertRedirect(route('login'));
        });

        it('allows super admin to view role permissions', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.permissions.index', $role));

            $response->assertSuccessful();
        });

        it('returns all permissions grouped by module', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.permissions.index', $role));

            $response->assertSuccessful();

            $data = $response->json('data');
            expect($data)->toHaveKey('permissions');

            $permissions = $data['permissions'];
            expect($permissions)->toBeArray();

            $modules = collect($permissions)->pluck('module');
            expect($modules)->toContain('assets');
            expect($modules)->toContain('atk');
            expect($modules)->toContain('office');
        });

        it('returns role current permissions', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.permissions.index', $role));

            $response->assertSuccessful();

            $data = $response->json('data');
            expect($data)->toHaveKey('role_permission_names');

            $rolePermissionNames = $data['role_permission_names'];
            expect($rolePermissionNames)->toBeArray();
            expect($rolePermissionNames)->not->toBeEmpty();
        });

        it('returns role information', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kasubag_umum')->first();

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.permissions.index', $role));

            $response->assertSuccessful();

            $data = $response->json('data');
            expect($data)->toHaveKey('role');

            $roleData = $data['role'];
            expect($roleData['id'])->toBe($role->id);
            expect($roleData['name'])->toBe('kasubag_umum');
        });

        it('forbids non super admin from viewing role permissions', function () {
            $user = User::factory()->create();
            $user->assignRole('pegawai');

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($user)
                ->get(route('admin.roles.permissions.index', $role));

            $response->assertForbidden();
        });

        it('forbids users without roles.manage permission', function () {
            $user = User::factory()->create();
            $user->assignRole('operator_persediaan');

            $role = Role::where('name', 'pegawai')->first();

            $response = $this->actingAs($user)
                ->get(route('admin.roles.permissions.index', $role));

            $response->assertForbidden();
        });
    });

    describe('Update - Sync Permissions to Role', function () {
        it('requires authentication', function () {
            $role = Role::where('name', 'pegawai')->first();

            $response = $this->putJson(route('admin.roles.permissions.update', $role), [
                'permission_ids' => ['assets.view', 'atk.view'],
            ]);

            $response->assertUnauthorized();
        });

        it('allows super admin to sync role permissions', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.permissions.update', $role), [
                    'permission_ids' => ['assets.view', 'atk.view', 'office.view'],
                ]);

            $response->assertSuccessful();

            // Verify permissions were synced
            expect($role->fresh()->permissions->count())->toBe(3);
            expect($role->fresh()->hasPermissionTo('assets.view'))->toBeTrue();
            expect($role->fresh()->hasPermissionTo('atk.view'))->toBeTrue();
            expect($role->fresh()->hasPermissionTo('office.view'))->toBeTrue();
        });

        it('validates permission_ids is an array', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.permissions.update', $role), [
                    'permission_ids' => 'not-an-array',
                ]);

            $response->assertStatus(422);
            $response->assertJsonValidationErrors(['permission_ids']);
        });

        it('validates permission_ids contains valid permissions', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.permissions.update', $role), [
                    'permission_ids' => ['invalid.permission', 'another.invalid'],
                ]);

            $response->assertStatus(422);
            $response->assertJsonValidationErrors(['permission_ids.0', 'permission_ids.1']);
        });

        it('automatically assigns all permissions to super_admin role', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $superAdminRole = Role::where('name', 'super_admin')->first();
            $totalPermissions = Permission::count();

            // Try to assign only specific permissions to super_admin
            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.permissions.update', $superAdminRole), [
                    'permission_ids' => ['assets.view', 'atk.view'],
                ]);

            $response->assertSuccessful();

            // Verify ALL permissions were assigned (not just the ones provided)
            expect($superAdminRole->fresh()->permissions->count())->toBe($totalPermissions);
        });

        it('removes permissions when not in permission_ids array', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Get initial permission count
            $initialCount = $role->permissions->count();
            expect($initialCount)->toBeGreaterThan(2);

            // Sync to only 2 permissions
            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.permissions.update', $role), [
                    'permission_ids' => ['assets.view', 'atk.view'],
                ]);

            $response->assertSuccessful();

            // Verify only 2 permissions remain
            expect($role->fresh()->permissions->count())->toBe(2);
        });

        it('allows empty permission_ids array (removes all permissions)', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            // Verify role has permissions initially
            expect($role->permissions->count())->toBeGreaterThan(0);

            // Remove all permissions
            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.permissions.update', $role), [
                    'permission_ids' => [],
                ]);

            $response->assertSuccessful();

            // Verify all permissions were removed
            expect($role->fresh()->permissions->count())->toBe(0);
        });

        it('forbids non super admin from syncing role permissions', function () {
            $user = User::factory()->create();
            $user->assignRole('kasubag_umum');

            $role = Role::where('name', 'pegawai')->first();

            $response = $this->actingAs($user)
                ->putJson(route('admin.roles.permissions.update', $role), [
                    'permission_ids' => ['assets.view'],
                ]);

            $response->assertForbidden();
        });

        it('returns updated permission data after sync', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.permissions.update', $role), [
                    'permission_ids' => ['assets.view', 'atk.view', 'office.view'],
                ]);

            $response->assertSuccessful();

            $data = $response->json('data');
            expect($data)->toHaveKey('role');
            expect($data)->toHaveKey('permission_ids');

            expect($data['role']['name'])->toBe('pegawai');
            expect($data['permission_ids'])->toBe(['assets.view', 'atk.view', 'office.view']);
        });

        it('handles bulk permission assignment efficiently', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'operator_bmn')->first();

            // Assign many permissions at once
            $manyPermissions = Permission::where('name', 'like', 'assets.%')
                ->pluck('name')
                ->toArray();

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.permissions.update', $role), [
                    'permission_ids' => $manyPermissions,
                ]);

            $response->assertSuccessful();

            // Verify all permissions were assigned
            foreach ($manyPermissions as $permission) {
                expect($role->fresh()->hasPermissionTo($permission))->toBeTrue();
            }
        });
    });
});
