<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles and permissions before each test
    $this->seed(\Database\Seeders\RolesSeeder::class);
    $this->seed(\Database\Seeders\PermissionsSeeder::class);
});

describe('PermissionController', function () {
    describe('Index - List Permissions', function () {
        it('requires authentication', function () {
            $response = $this->get(route('admin.permissions.index'));

            $response->assertRedirect(route('login'));
        });

        it('allows super admin to list permissions', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.permissions.index'));

            $response->assertSuccessful();
        });

        it('returns permissions grouped by module', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.permissions.index'));

            $response->assertSuccessful();

            $data = $response->json('data');
            expect($data)->toBeArray();

            // Check that permissions are grouped by module
            $modules = collect($data)->pluck('module');
            expect($modules)->toContain('assets');
            expect($modules)->toContain('atk');
            expect($modules)->toContain('office');
        });

        it('includes permissions array for each module', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.permissions.index'));

            $response->assertSuccessful();

            $data = $response->json('data');
            $assetsModule = collect($data)->firstWhere('module', 'assets');

            expect($assetsModule)->toHaveKey('permissions');
            expect($assetsModule['permissions'])->toBeArray();
            expect($assetsModule['permissions'])->not->toBeEmpty();
        });

        it('forbids non super admin from accessing permissions list', function () {
            $user = User::factory()->create();
            $user->assignRole('pegawai');

            $response = $this->actingAs($user)
                ->get(route('admin.permissions.index'));

            $response->assertForbidden();
        });

        it('forbids users without permissions.manage permission', function () {
            $user = User::factory()->create();
            $user->assignRole('kasubag_umum'); // Has roles.manage but not permissions.manage

            $response = $this->actingAs($user)
                ->get(route('admin.permissions.index'));

            $response->assertForbidden();
        });
    });

    describe('Store - Create Permission', function () {
        it('requires authentication', function () {
            $response = $this->postJson(route('admin.permissions.store'), [
                'name' => 'test.permission',
            ]);

            $response->assertUnauthorized();
        });

        it('allows super admin to create permission', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $response = $this->actingAs($superAdmin)
                ->postJson(route('admin.permissions.store'), [
                    'name' => 'test.new_permission',
                ]);

            $response->assertSuccessful();

            $this->assertDatabaseHas('permissions', [
                'name' => 'test.new_permission',
            ]);
        });

        it('validates permission name format', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $response = $this->actingAs($superAdmin)
                ->postJson(route('admin.permissions.store'), [
                    'name' => 'invalid-format',
                ]);

            $response->assertStatus(422);
            $response->assertJsonValidationErrors(['name']);
        });

        it('validates permission name is required', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $response = $this->actingAs($superAdmin)
                ->postJson(route('admin.permissions.store'), []);

            $response->assertStatus(422);
            $response->assertJsonValidationErrors(['name']);
        });

        it('validates permission name is unique', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            // Create a permission first
            Permission::create(['name' => 'test.duplicate', 'guard_name' => 'web']);

            $response = $this->actingAs($superAdmin)
                ->postJson(route('admin.permissions.store'), [
                    'name' => 'test.duplicate',
                ]);

            $response->assertStatus(422);
            $response->assertJsonValidationErrors(['name']);
        });

        it('forbids non super admin from creating permission', function () {
            $user = User::factory()->create();
            $user->assignRole('kasubag_umum');

            $response = $this->actingAs($user)
                ->postJson(route('admin.permissions.store'), [
                    'name' => 'test.permission',
                ]);

            $response->assertForbidden();
        });

        it('returns created permission data', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $response = $this->actingAs($superAdmin)
                ->postJson(route('admin.permissions.store'), [
                    'name' => 'test.created',
                ]);

            $response->assertSuccessful();

            $data = $response->json('data');
            expect($data)->toHaveKey('id');
            expect($data)->toHaveKey('name');
            expect($data['name'])->toBe('test.created');
        });
    });

    describe('Update - Update Permission', function () {
        it('requires authentication', function () {
            $permission = Permission::create(['name' => 'test.update', 'guard_name' => 'web']);

            $response = $this->putJson(route('admin.permissions.update', $permission), [
                'name' => 'test.updated',
            ]);

            $response->assertUnauthorized();
        });

        it('allows super admin to update permission', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $permission = Permission::create(['name' => 'test.update', 'guard_name' => 'web']);

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.permissions.update', $permission), [
                    'name' => 'test.updated',
                ]);

            $response->assertSuccessful();

            expect($permission->fresh()->name)->toBe('test.updated');
        });

        it('validates permission name format on update', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $permission = Permission::create(['name' => 'test.format', 'guard_name' => 'web']);

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.permissions.update', $permission), [
                    'name' => 'invalid-format',
                ]);

            $response->assertStatus(422);
            $response->assertJsonValidationErrors(['name']);
        });

        it('forbids non super admin from updating permission', function () {
            $user = User::factory()->create();
            $user->assignRole('kasubag_umum');

            $permission = Permission::create(['name' => 'test.update', 'guard_name' => 'web']);

            $response = $this->actingAs($user)
                ->putJson(route('admin.permissions.update', $permission), [
                    'name' => 'test.updated',
                ]);

            $response->assertForbidden();
        });

        it('returns updated permission data', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $permission = Permission::create(['name' => 'test.before', 'guard_name' => 'web']);

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.permissions.update', $permission), [
                    'name' => 'test.after',
                ]);

            $response->assertSuccessful();

            $data = $response->json('data');
            expect($data)->toHaveKey('id');
            expect($data)->toHaveKey('name');
            expect($data['name'])->toBe('test.after');
        });
    });

    describe('Destroy - Delete Permission', function () {
        it('requires authentication', function () {
            $permission = Permission::create(['name' => 'test.delete', 'guard_name' => 'web']);

            $response = $this->deleteJson(route('admin.permissions.destroy', $permission));

            $response->assertUnauthorized();
        });

        it('allows super admin to delete permission', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $permission = Permission::create(['name' => 'test.delete', 'guard_name' => 'web']);

            $response = $this->actingAs($superAdmin)
                ->deleteJson(route('admin.permissions.destroy', $permission));

            $response->assertSuccessful();

            $this->assertDatabaseMissing('permissions', [
                'name' => 'test.delete',
            ]);
        });

        it('forbids non super admin from deleting permission', function () {
            $user = User::factory()->create();
            $user->assignRole('kasubag_umum');

            $permission = Permission::create(['name' => 'test.delete', 'guard_name' => 'web']);

            $response = $this->actingAs($user)
                ->deleteJson(route('admin.permissions.destroy', $permission));

            $response->assertForbidden();

            $this->assertDatabaseHas('permissions', [
                'name' => 'test.delete',
            ]);
        });

        it('returns success message after deletion', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $permission = Permission::create(['name' => 'test.delete', 'guard_name' => 'web']);

            $response = $this->actingAs($superAdmin)
                ->deleteJson(route('admin.permissions.destroy', $permission));

            $response->assertSuccessful();

            $data = $response->json('data');
            expect($data)->toHaveKey('message');
            expect($data)->toHaveKey('name');
            expect($data['name'])->toBe('test.delete');
        });
    });
});
