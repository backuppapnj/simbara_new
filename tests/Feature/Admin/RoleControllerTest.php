<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles before each test
    $this->seed(\Database\Seeders\RolesSeeder::class);
});

describe('RoleController', function () {
    describe('Index - List Roles', function () {
        it('requires authentication', function () {
            $response = $this->get(route('admin.roles.index'));

            $response->assertRedirect(route('login'));
        });

        it('allows super admin to list roles', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $response = $this->actingAs($superAdmin)
                ->get(route('admin.roles.index'));

            $response->assertSuccessful();
        });

        it('returns all 6 pre-defined roles', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.index'));

            $response->assertSuccessful()
                ->assertJsonCount(6, 'data');
        });

        it('includes user count for each role', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            // Create users with different roles
            $kpaUser = User::factory()->create();
            $kpaUser->assignRole('kpa');

            $kasubagUser = User::factory()->create();
            $kasubagUser->assignRole('kasubag_umum');

            $pegawai1 = User::factory()->create();
            $pegawai1->assignRole('pegawai');

            $pegawai2 = User::factory()->create();
            $pegawai2->assignRole('pegawai');

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.index'));

            $response->assertSuccessful();

            // Verify role data structure includes user count
            $roles = $response->json('data');
            expect($roles)->toBeArray();

            $superAdminRole = collect($roles)->firstWhere('name', 'super_admin');
            expect($superAdminRole['users_count'])->toBe(1);

            $kpaRole = collect($roles)->firstWhere('name', 'kpa');
            expect($kpaRole['users_count'])->toBe(1);

            $pegawaiRole = collect($roles)->firstWhere('name', 'pegawai');
            expect($pegawaiRole['users_count'])->toBe(2);
        });

        it('forbids non super admin from accessing roles list', function () {
            $user = User::factory()->create();
            $user->assignRole('pegawai');

            $response = $this->actingAs($user)
                ->get(route('admin.roles.index'));

            $response->assertForbidden();
        });

        it('forbids unauthenticated users from accessing roles list', function () {
            $response = $this->get(route('admin.roles.index'));

            $response->assertRedirect(route('login'));
        });

        it('forbids users with other roles from accessing roles list', function () {
            $kpa = User::factory()->create();
            $kpa->assignRole('kpa');

            $response = $this->actingAs($kpa)
                ->get(route('admin.roles.index'));

            $response->assertForbidden();
        });
    });

    describe('Show - View Role Detail with Users', function () {
        it('requires authentication', function () {
            $role = Role::where('name', 'pegawai')->first();

            $response = $this->get(route('admin.roles.show', $role));

            $response->assertRedirect(route('login'));
        });

        it('allows super admin to view role detail', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $response = $this->actingAs($superAdmin)
                ->get(route('admin.roles.show', $role));

            $response->assertSuccessful();
        });

        it('shows all users with has_role flag for role detail', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Create users with this role
            $user1 = User::factory()->create(['name' => 'John Doe']);
            $user1->assignRole('pegawai');

            $user2 = User::factory()->create(['name' => 'Jane Smith']);
            $user2->assignRole('pegawai');

            // Create user without this role
            $user3 = User::factory()->create(['name' => 'Bob Johnson']);

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.show', $role));

            $response->assertSuccessful();

            // For JSON requests, users are in 'data' key
            $users = $response->json('data');
            expect($users)->toBeArray();

            // Check that all users are returned
            $userNames = collect($users)->pluck('name');
            expect($userNames)->toContain('John Doe', 'Jane Smith', 'Bob Johnson');

            // Check has_role flag
            $johnDoe = collect($users)->firstWhere('name', 'John Doe');
            $janeSmith = collect($users)->firstWhere('name', 'Jane Smith');
            $bobJohnson = collect($users)->firstWhere('name', 'Bob Johnson');

            expect($johnDoe['has_role'])->toBeTrue();
            expect($janeSmith['has_role'])->toBeTrue();
            expect($bobJohnson['has_role'])->toBeFalse();
        });

        it('returns all users including super_admin for role detail', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'operator_bmn')->first();

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.show', $role));

            $response->assertSuccessful();

            // Should return at least super_admin user
            $users = $response->json('data');
            expect($users)->toBeArray()
                ->and(count($users))->toBeGreaterThanOrEqual(1);

            // Super admin should not have operator_bmn role
            $superAdminUser = collect($users)->firstWhere('email', $superAdmin->email);
            expect($superAdminUser['has_role'])->toBeFalse();
        });

        it('forbids non super admin from viewing role detail', function () {
            $user = User::factory()->create();
            $user->assignRole('kpa');

            $role = Role::where('name', 'pegawai')->first();

            $response = $this->actingAs($user)
                ->get(route('admin.roles.show', $role));

            $response->assertForbidden();
        });

        it('paginates users in role detail', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Create many users with this role
            User::factory()->count(25)->create()->each(function ($user) {
                $user->assignRole('pegawai');
            });

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.show', ['role' => $role, 'per_page' => 15]));

            $response->assertSuccessful();
        });

        it('allows searching users by name in role detail', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Create users with specific names
            $user1 = User::factory()->create(['name' => 'Ahmad Karyawan']);
            $user1->assignRole('pegawai');

            $user2 = User::factory()->create(['name' => 'Budi Staff']);
            $user2->assignRole('pegawai');

            $user3 = User::factory()->create(['name' => 'Ahmad Manager']);
            $user3->assignRole('pegawai');

            $user4 = User::factory()->create(['name' => 'Charlie Without Role']);

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.show', ['role' => $role, 'search' => 'Ahmad']));

            $response->assertSuccessful();

            $users = $response->json('data');
            expect($users)->toBeArray();
            $userNames = collect($users)->pluck('name');
            expect($userNames)->toContain('Ahmad Karyawan', 'Ahmad Manager');
            expect($userNames)->not->toContain('Budi Staff', 'Charlie Without Role');
        });
    });

    describe('UpdateUsers - Assign/Remove Users from Role', function () {
        it('requires authentication', function () {
            $role = Role::where('name', 'pegawai')->first();

            $response = $this->putJson(route('admin.roles.update-users', $role), [
                'user_ids' => [],
            ]);

            $response->assertUnauthorized();
        });

        it('allows super admin to assign users to a role', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            $user1 = User::factory()->create();
            $user2 = User::factory()->create();

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.update-users', $role), [
                    'user_ids' => [$user1->id, $user2->id],
                ]);

            $response->assertSuccessful();

            // Verify users have the role
            expect($user1->fresh()->hasRole('kpa'))->toBeTrue();
            expect($user2->fresh()->hasRole('kpa'))->toBeTrue();
        });

        it('allows super admin to remove users from a role', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $user1 = User::factory()->create();
            $user1->assignRole('pegawai');

            $user2 = User::factory()->create();
            $user2->assignRole('pegawai');

            // Remove both users
            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.update-users', $role), [
                    'user_ids' => [],
                ]);

            $response->assertSuccessful();

            // Verify users no longer have the role
            expect($user1->fresh()->hasRole('pegawai'))->toBeFalse();
            expect($user2->fresh()->hasRole('pegawai'))->toBeFalse();
        });

        it('allows super admin to partially update users in a role', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kasubag_umum')->first();

            $user1 = User::factory()->create();
            $user1->assignRole('kasubag_umum');

            $user2 = User::factory()->create();
            $user2->assignRole('kasubag_umum');

            $user3 = User::factory()->create();

            // Keep user1, remove user2, add user3
            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.update-users', $role), [
                    'user_ids' => [$user1->id, $user3->id],
                ]);

            $response->assertSuccessful();

            expect($user1->fresh()->hasRole('kasubag_umum'))->toBeTrue();
            expect($user2->fresh()->hasRole('kasubag_umum'))->toBeFalse();
            expect($user3->fresh()->hasRole('kasubag_umum'))->toBeTrue();
        });

        it('enforces super_admin role exclusivity - removes other roles when super_admin assigned', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $superAdminRole = Role::where('name', 'super_admin')->first();
            $kpaRole = Role::where('name', 'kpa')->first();
            $pegawaiRole = Role::where('name', 'pegawai')->first();

            $user = User::factory()->create();
            $user->assignRole('kpa');
            $user->assignRole('pegawai');

            // Verify user has multiple roles
            expect($user->fresh()->hasRole('kpa'))->toBeTrue();
            expect($user->fresh()->hasRole('pegawai'))->toBeTrue();
            expect($user->fresh()->hasRole('super_admin'))->toBeFalse();

            // Assign super_admin role
            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.update-users', $superAdminRole), [
                    'user_ids' => [$user->id],
                ]);

            $response->assertSuccessful();

            // Verify other roles are removed
            expect($user->fresh()->hasRole('super_admin'))->toBeTrue();
            expect($user->fresh()->hasRole('kpa'))->toBeFalse();
            expect($user->fresh()->hasRole('pegawai'))->toBeFalse();
        });

        it('enforces super_admin role exclusivity - prevents other roles when super_admin exists', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $superAdminRole = Role::where('name', 'super_admin')->first();
            $kpaRole = Role::where('name', 'kpa')->first();

            $user = User::factory()->create();
            $user->assignRole('super_admin');

            // Try to add kpa role to super_admin user
            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.update-users', $kpaRole), [
                    'user_ids' => [$user->id],
                ]);

            $response->assertSuccessful();

            // Verify super_admin is removed and kpa is assigned
            $user->refresh();
            expect($user->hasRole('kpa'))->toBeTrue();
            expect($user->hasRole('super_admin'))->toBeFalse();
        });

        it('allows user to have multiple non-super_admin roles', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $kpaRole = Role::where('name', 'kpa')->first();
            $pegawaiRole = Role::where('name', 'pegawai')->first();

            $user = User::factory()->create();
            $user->assignRole('kpa');

            // Add pegawai role while keeping kpa
            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.update-users', $pegawaiRole), [
                    'user_ids' => [$user->id],
                ]);

            $response->assertSuccessful();

            // Verify user has both roles
            expect($user->fresh()->hasRole('kpa'))->toBeTrue();
            expect($user->fresh()->hasRole('pegawai'))->toBeTrue();
        });

        it('forbids non super admin from updating role users', function () {
            $kpaUser = User::factory()->create();
            $kpaUser->assignRole('kpa');

            $role = Role::where('name', 'pegawai')->first();

            $user1 = User::factory()->create();

            $response = $this->actingAs($kpaUser)
                ->putJson(route('admin.roles.update-users', $role), [
                    'user_ids' => [$user1->id],
                ]);

            $response->assertForbidden();
        });

        it('validates user_ids parameter is an array', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.update-users', $role), [
                    'user_ids' => 'not-an-array',
                ]);

            $response->assertStatus(422);
        });

        it('handles empty user_ids array - removes all users from role', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Create some users with the role
            $user1 = User::factory()->create();
            $user1->assignRole('pegawai');

            $user2 = User::factory()->create();
            $user2->assignRole('pegawai');

            // Remove all users by passing empty array
            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.update-users', $role), [
                    'user_ids' => [],
                ]);

            $response->assertSuccessful();

            // Verify all users removed from role
            expect($user1->fresh()->hasRole('pegawai'))->toBeFalse();
            expect($user2->fresh()->hasRole('pegawai'))->toBeFalse();
        });

        it('validates user_ids contains valid user ids - returns 422 for invalid ids', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            $nonExistentUserId = (string) \Illuminate\Support\Str::ulid();

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.update-users', $role), [
                    'user_ids' => [$nonExistentUserId],
                ]);

            // Should return validation error for non-existent user ID
            $response->assertStatus(422);
            $response->assertJsonValidationErrors(['user_ids.0']);
        });

        it('returns updated role info after successful update', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'kpa')->first();

            $user1 = User::factory()->create(['name' => 'User One']);
            $user2 = User::factory()->create(['name' => 'User Two']);

            $response = $this->actingAs($superAdmin)
                ->putJson(route('admin.roles.update-users', $role), [
                    'user_ids' => [$user1->id, $user2->id],
                ]);

            $response->assertSuccessful();

            // Verify the response contains role and user_ids
            $data = $response->json('data');
            expect($data)->toHaveKey('role');
            expect($data)->toHaveKey('user_ids');
            expect($data['user_ids'])->toBe([$user1->id, $user2->id]);
        });
    });
});
