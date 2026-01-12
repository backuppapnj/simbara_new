<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles before each test
    $this->seed(\Database\Seeders\RolesSeeder::class);
});

describe('UserController - syncRoles', function () {
    describe('Authentication & Authorization', function () {
        it('requires authentication', function () {
            $user = User::factory()->create();

            $response = $this->putJson(route('admin.users.sync-roles', $user), [
                'role_ids' => [],
            ]);

            $response->assertUnauthorized();
        });

        it('allows super_admin to sync user roles', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $user = User::factory()->create();
            $role = Role::where('name', 'pegawai')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.users.sync-roles', $user), [
                    'role_ids' => [$role->id],
                ]);

            $response->assertSuccessful();
        });

        it('forbids non super_admin from syncing user roles', function () {
            $kpaUser = User::factory()->create();
            $kpaUser->assignRole('kpa');

            $user = User::factory()->create();
            $role = Role::where('name', 'pegawai')->first();

            $response = $this->actingAs($kpaUser)
                ->putJson(route('admin.users.sync-roles', $user), [
                    'role_ids' => [$role->id],
                ]);

            $response->assertForbidden();
        });
    });

    describe('Validation', function () {
        it('validates role_ids is an array', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $user = User::factory()->create();

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.users.sync-roles', $user), [
                    'role_ids' => 'not-an-array',
                ]);

            $response->assertStatus(422);
            $response->assertJsonValidationErrors(['role_ids']);
        });

        it('validates role_ids contains valid role ids', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $user = User::factory()->create();

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.users.sync-roles', $user), [
                    'role_ids' => [99999, 88888],
                ]);

            $response->assertStatus(422);
            $response->assertJsonValidationErrors(['role_ids.0', 'role_ids.1']);
        });
    });

    describe('Functionality', function () {
        it('syncs roles to user successfully', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $user = User::factory()->create();
            $role1 = Role::where('name', 'pegawai')->first();
            $role2 = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.users.sync-roles', $user), [
                    'role_ids' => [$role1->id, $role2->id],
                ]);

            $response->assertSuccessful();

            // Verify roles are assigned
            expect($user->fresh()->hasRole('pegawai'))->toBeTrue();
            expect($user->fresh()->hasRole('kpa'))->toBeTrue();
        });

        it('replaces existing roles with new ones', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $user = User::factory()->create();
            $role1 = Role::where('name', 'pegawai')->first();
            $role2 = Role::where('name', 'kpa')->first();
            $role3 = Role::where('name', 'kasubag_umum')->first();

            // Assign initial roles
            $user->assignRole($role1);
            $user->assignRole($role2);

            expect($user->hasRole('pegawai'))->toBeTrue();
            expect($user->hasRole('kpa'))->toBeTrue();

            // Sync with new roles
            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.users.sync-roles', $user), [
                    'role_ids' => [$role3->id],
                ]);

            $response->assertSuccessful();

            // Verify only new role is assigned
            expect($user->fresh()->hasRole('pegawai'))->toBeFalse();
            expect($user->fresh()->hasRole('kpa'))->toBeFalse();
            expect($user->fresh()->hasRole('kasubag_umum'))->toBeTrue();
        });

        it('removes all roles when empty array is provided', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $user = User::factory()->create();
            $role = Role::where('name', 'pegawai')->first();
            $user->assignRole($role);

            expect($user->hasRole('pegawai'))->toBeTrue();

            // Sync with empty array
            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.users.sync-roles', $user), [
                    'role_ids' => [],
                ]);

            $response->assertSuccessful();

            // Verify all roles removed
            expect($user->fresh()->roles)->toHaveCount(0);
        });

        it('handles super_admin exclusivity - removes other roles when super_admin assigned', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $user = User::factory()->create();
            $superAdminRole = Role::where('name', 'super_admin')->first();
            $kpaRole = Role::where('name', 'kpa')->first();
            $pegawaiRole = Role::where('name', 'pegawai')->first();

            // User has multiple roles initially
            $user->assignRole($kpaRole);
            $user->assignRole($pegawaiRole);

            // Assign super_admin
            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.users.sync-roles', $user), [
                    'role_ids' => [$superAdminRole->id],
                ]);

            $response->assertSuccessful();

            // Verify only super_admin is assigned
            $user->refresh();
            expect($user->roles)->toHaveCount(1);
            expect($user->hasRole('super_admin'))->toBeTrue();
            expect($user->hasRole('kpa'))->toBeFalse();
            expect($user->hasRole('pegawai'))->toBeFalse();
        });

        it('allows multiple non-super_admin roles', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $user = User::factory()->create();
            $role1 = Role::where('name', 'kpa')->first();
            $role2 = Role::where('name', 'pegawai')->first();
            $role3 = Role::where('name', 'kasubag_umum')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.users.sync-roles', $user), [
                    'role_ids' => [$role1->id, $role2->id, $role3->id],
                ]);

            $response->assertSuccessful();

            // Verify all roles are assigned
            expect($user->fresh()->roles)->toHaveCount(3);
            expect($user->fresh()->hasRole('kpa'))->toBeTrue();
            expect($user->fresh()->hasRole('pegawai'))->toBeTrue();
            expect($user->fresh()->hasRole('kasubag_umum'))->toBeTrue();
        });

        it('returns updated user info with roles', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $user = User::factory()->create();
            $role = Role::where('name', 'pegawai')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.users.sync-roles', $user), [
                    'role_ids' => [$role->id],
                ]);

            $response->assertSuccessful();

            $data = $response->json('data');
            expect($data)->toHaveKey('user');
            expect($data['user'])->toHaveKey('id', $user->id);
        });
    });
});
