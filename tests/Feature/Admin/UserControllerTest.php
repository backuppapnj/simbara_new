<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
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

    // Create permissions
    Permission::firstOrCreate(['name' => 'users.view']);
    Permission::firstOrCreate(['name' => 'users.create']);
    Permission::firstOrCreate(['name' => 'users.edit']);
    Permission::firstOrCreate(['name' => 'users.delete']);
});

describe('UserController Index', function () {
    describe('GET /admin/users - Authorization Tests', function () {
        it('requires authentication', function () {
            $response = $this->getJson('/admin/users');

            $response->assertUnauthorized();
        });

        it('requires users.view permission', function () {
            $user = User::factory()->create();
            $user->assignRole('pegawai');

            $response = $this->actingAs($user)
                ->getJson('/admin/users');

            $response->assertForbidden();
        });

        it('allows users with users.view permission', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('users.view');

            $response = $this->actingAs($user)
                ->getJson('/admin/users');

            $response->assertSuccessful();
        });

        it('allows super_admin to access', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $response = $this->actingAs($superAdmin)
                ->getJson('/admin/users');

            $response->assertSuccessful();
        });
    });

    describe('GET /admin/users - Functionality Tests', function () {
        beforeEach(function () {
            // Create test users with different attributes
            User::factory()->create([
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'nip' => '12345',
                'is_active' => true,
            ]);

            User::factory()->create([
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'nip' => '67890',
                'is_active' => false,
            ]);

            User::factory()->create([
                'name' => 'Bob Johnson',
                'email' => 'bob@example.com',
                'nip' => '54321',
                'is_active' => true,
            ]);
        });

        it('returns paginated list of users', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('users.view');

            $response = $this->actingAs($user)
                ->getJson('/admin/users');

            $response->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'email',
                        'nip',
                        'phone',
                        'position',
                        'is_active',
                        'roles',
                    ],
                ],
                'links',
                'meta',
            ]);
        });

        it('includes user roles in response', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('users.view');

            $testUser = User::factory()->create();
            $testUser->assignRole('pegawai');

            $response = $this->actingAs($user)
                ->getJson('/admin/users');

            $userData = collect($response->json('data'))->firstWhere('id', $testUser->id);
            expect($userData)->toHaveKey('roles');
            expect($userData['roles'])->toBeArray();
        });

        it('filters users by search term (name)', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('users.view');

            $response = $this->actingAs($user)
                ->getJson('/admin/users?search=John');

            $names = collect($response->json('data'))->pluck('name');
            expect($names)->toContain('John Doe');
            expect($names)->not->toContain('Jane Smith');
            expect($names)->not->toContain('Bob Johnson');
        });

        it('filters users by search term (email)', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('users.view');

            $response = $this->actingAs($user)
                ->getJson('/admin/users?search=jane@example.com');

            $names = collect($response->json('data'))->pluck('name');
            expect($names)->toContain('Jane Smith');
            expect($names)->not->toContain('John Doe');
            expect($names)->not->toContain('Bob Johnson');
        });

        it('filters users by search term (NIP)', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('users.view');

            $response = $this->actingAs($user)
                ->getJson('/admin/users?search=54321');

            $names = collect($response->json('data'))->pluck('name');
            expect($names)->toContain('Bob Johnson');
            expect($names)->not->toContain('John Doe');
            expect($names)->not->toContain('Jane Smith');
        });

        it('filters users by is_active status (true)', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('users.view');

            $response = $this->actingAs($user)
                ->getJson('/admin/users?is_active=true');

            $users = $response->json('data');
            foreach ($users as $user) {
                expect($user['is_active'])->toBeTrue();
            }
        });

        it('filters users by is_active status (false)', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('users.view');

            $response = $this->actingAs($user)
                ->getJson('/admin/users?is_active=false');

            $users = $response->json('data');
            foreach ($users as $user) {
                expect($user['is_active'])->toBeFalse();
            }
        });

        it('filters users by role', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('users.view');

            $pegawaiRole = Role::where('name', 'pegawai')->first();

            // Create a user with pegawai role
            $pegawaiUser = User::factory()->create();
            $pegawaiUser->assignRole('pegawai');

            // Create a user with different role
            $kpaUser = User::factory()->create();
            $kpaUser->assignRole('kpa');

            $response = $this->actingAs($user)
                ->getJson("/admin/users?role={$pegawaiRole->id}");

            $userIds = collect($response->json('data'))->pluck('id');
            expect($userIds)->toContain($pegawaiUser->id);
            expect($userIds)->not->toContain($kpaUser->id);
        });

        it('paginates results correctly', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('users.view');

            User::factory()->count(25)->create();

            $response = $this->actingAs($user)
                ->getJson('/admin/users?per_page=10');

            $response->assertJsonPath('meta.per_page', 10);
            expect(count($response->json('data')))->toBeLessThanOrEqual(10);
        });

        it('sorts users by name by default', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('users.view');

            $response = $this->actingAs($user)
                ->getJson('/admin/users');

            $names = collect($response->json('data'))->pluck('name');
            $sortedNames = $names->sort()->values();
            expect($names->toArray())->toBe($sortedNames->toArray());
        });

        it('handles multiple filters simultaneously', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('users.view');

            $response = $this->actingAs($user)
                ->getJson('/admin/users?search=John&is_active=true');

            $users = $response->json('data');
            foreach ($users as $user) {
                expect(str_contains($user['name'], 'John') || str_contains($user['email'], 'John'))->toBeTrue();
                expect($user['is_active'])->toBeTrue();
            }
        });

        it('returns empty data when no users match filters', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('users.view');

            $response = $this->actingAs($user)
                ->getJson('/admin/users?search=NonExistentUser');

            expect($response->json('data'))->toBeEmpty();
        });
    });
});
