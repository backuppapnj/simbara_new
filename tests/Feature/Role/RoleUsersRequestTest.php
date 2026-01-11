<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create roles for testing
    Role::firstOrCreate(['name' => 'super_admin']);
    Role::firstOrCreate(['name' => 'kpa']);
    Role::firstOrCreate(['name' => 'kasubag_umum']);
    Role::firstOrCreate(['name' => 'operator_bmn']);
    Role::firstOrCreate(['name' => 'operator_persediaan']);
    Role::firstOrCreate(['name' => 'pegawai']);
});

describe('RoleUsersRequest Validation', function () {
    describe('PUT /admin/roles/{role}/users - Validation Tests', function () {
        it('accepts missing user_ids field and converts to empty array', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson("/admin/roles/{$role->id}/users", [
                    // user_ids is missing
                ]);

            // Should succeed and convert to empty array
            $response->assertSuccessful();
        });

        it('accepts empty user_ids array', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson("/admin/roles/{$role->id}/users", []);

            $response->assertSuccessful();
        });

        it('validates user_ids must be an array', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson("/admin/roles/{$role->id}/users", [
                    'user_ids' => 'not-an-array',
                ]);

            $response->assertInvalid(['user_ids']);
        });

        it('validates user_ids must be an array (integer test)', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson("/admin/roles/{$role->id}/users", [
                    'user_ids' => 123,
                ]);

            $response->assertInvalid(['user_ids']);
        });

        it('allows empty array to remove all users from role', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson("/admin/roles/{$role->id}/users", [
                    'user_ids' => [],
                ]);

            $response->assertSuccessful();
        });

        it('validates each user_id must exist in users table', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson("/admin/roles/{$role->id}/users", [
                    'user_ids' => [999, 1000], // Non-existent user IDs
                ]);

            $response->assertInvalid(['user_ids.0', 'user_ids.1']);
        });

        it('validates user_ids contains valid user ids (single invalid id)', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $validUser = User::factory()->create();

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$validUser->id, 999], // Mix of valid and invalid
                ]);

            $response->assertInvalid(['user_ids.1']);
        });

        it('validates each user_id must exist in users table (string ulid test)', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson("/admin/roles/{$role->id}/users", [
                    'user_ids' => ['01J2X9K1M2N3P4Q5R6S7T8U9V0W', '01J2X9K1M2N3P4Q5R6S7T8U9V1X'],
                ]);

            $response->assertInvalid(['user_ids.0', 'user_ids.1']);
        });

        it('passes validation with valid user_ids', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $user1 = User::factory()->create();
            $user2 = User::factory()->create();
            $user3 = User::factory()->create();

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$user1->id, $user2->id, $user3->id],
                ]);

            $response->assertOk();
        });

        it('passes validation with single valid user_id', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $user = User::factory()->create();

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$user->id],
                ]);

            $response->assertOk();
        });

        it('returns custom Indonesian error message for array validation', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson("/admin/roles/{$role->id}/users", [
                    'user_ids' => 'not-an-array',
                ]);

            $response->assertJson([
                'message' => 'Format pengguna tidak valid.',
                'errors' => [
                    'user_ids' => [
                        'Format pengguna tidak valid.',
                    ],
                ],
            ]);
        });

        it('returns custom Indonesian error message for exists validation', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson("/admin/roles/{$role->id}/users", [
                    'user_ids' => [999],
                ]);

            $response->assertJson([
                'message' => 'Pengguna tidak ditemukan.',
                'errors' => [
                    'user_ids.0' => [
                        'Pengguna tidak ditemukan.',
                    ],
                ],
            ]);
        });

        it('handles multiple validation errors simultaneously', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson("/admin/roles/{$role->id}/users", [
                    'user_ids' => [999, 1000, 1001], // All invalid
                ]);

            $response->assertInvalid(['user_ids.0', 'user_ids.1', 'user_ids.2']);
        });
    });

    describe('Authorization Tests', function () {
        it('requires authentication', function () {
            $role = Role::where('name', 'kpa')->first();

            $response = $this->putJson("/admin/roles/{$role->id}/users", [
                'user_ids' => [],
            ]);

            $response->assertUnauthorized();
        });

        it('requires super_admin role', function () {
            $regularUser = User::factory()->create();
            $regularUser->assignRole('pegawai');

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($regularUser)
                ->putJson("/admin/roles/{$role->id}/users", [
                    'user_ids' => [],
                ]);

            $response->assertForbidden();
        });

        it('allows super_admin to access endpoint', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $user = User::factory()->create();

            $role = Role::where('name', 'kpa')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson("/admin/roles/{$role->id}/users", [
                    'user_ids' => [$user->id],
                ]);

            $response->assertOk();
        });
    });
});
