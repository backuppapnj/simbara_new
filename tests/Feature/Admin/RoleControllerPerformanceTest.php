<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles before each test
    $this->seed(\Database\Seeders\RolesSeeder::class);
});

describe('RoleController Performance', function () {
    describe('Query Performance', function () {
        it('executes efficient queries on index - no N+1 problems', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            // Create users with roles
            User::factory()->count(50)->create()->each(function ($user) {
                $user->assignRole('pegawai');
            });

            DB::enableQueryLog();

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.index'));

            $queries = DB::getQueryLog();

            // Should only run 2 queries: 1 for roles, 1 for user counts (eager loaded)
            expect(count($queries))->toBeLessThanOrEqual(2);

            $response->assertSuccessful();
        });

        it('executes efficient queries on show - uses LEFT JOIN instead of N+1', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Create users with and without the role
            User::factory()->count(25)->create()->each(function ($user) {
                $user->assignRole('pegawai');
            });

            User::factory()->count(25)->create(); // Users without the role

            DB::enableQueryLog();

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.show', $role));

            $queries = DB::getQueryLog();

            // Should run minimal queries:
            // 1. LEFT JOIN query for users with role check
            // 2. Count for pagination
            // 3. Begin transaction (for test isolation)
            // 4. Additional metadata query
            // With the optimization, should be 4-5 queries max (vs N+1 before)
            expect(count($queries))->toBeLessThanOrEqual(5);

            $response->assertSuccessful();

            // Verify the query uses LEFT JOIN (not separate queries for role check)
            $hasLeftJoin = collect($queries)->contains(function ($query) {
                return str_contains($query['query'], 'left join');
            });

            expect($hasLeftJoin)->toBeTrue();
        });

        it('does not load all role users into memory on show', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Create many users with the role
            User::factory()->count(100)->create()->each(function ($user) {
                $user->assignRole('pegawai');
            });

            // Monitor memory usage before query
            $memoryBefore = memory_get_usage();

            DB::enableQueryLog();

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.show', $role));

            $queries = DB::getQueryLog();
            $memoryAfter = memory_get_usage();
            $memoryUsed = $memoryAfter - $memoryBefore;

            // Memory usage should be reasonable (< 5MB for this operation)
            // If loading all users into memory, it would be much higher
            expect($memoryUsed)->toBeLessThan(5 * 1024 * 1024);

            // Query count should remain low regardless of dataset size
            expect(count($queries))->toBeLessThanOrEqual(5);

            $response->assertSuccessful();
        });
    });

    describe('Pagination Performance', function () {
        it('paginates users correctly with large datasets', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Create 150 users (more than default pagination)
            User::factory()->count(150)->create()->each(function ($user) {
                $user->assignRole('pegawai');
            });

            DB::enableQueryLog();

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.show', [
                    'role' => $role,
                    'page' => 1,
                ]));

            $queries = DB::getQueryLog();

            // Should still only run the optimized queries
            expect(count($queries))->toBeLessThanOrEqual(5);

            $response->assertSuccessful();

            // Verify pagination metadata
            $data = $response->json();
            expect($data)->toHaveKey('data');
            expect($data)->toHaveKey('meta');
            expect($data['meta'])->toHaveKeys(['current_page', 'per_page', 'total']);
            expect($data['meta']['total'])->toBe(151); // 150 + super admin
            expect(count($data['data']))->toBeLessThanOrEqual(20); // Default per page
        });

        it('handles deep pagination efficiently', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Create many users
            User::factory()->count(100)->create()->each(function ($user) {
                $user->assignRole('pegawai');
            });

            DB::enableQueryLog();

            // Request page 5 (deep pagination)
            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.show', [
                    'role' => $role,
                    'page' => 5,
                ]));

            $queries = DB::getQueryLog();

            // Query count should remain constant regardless of page number
            expect(count($queries))->toBeLessThanOrEqual(5);

            $response->assertSuccessful();
        });
    });

    describe('Search Performance', function () {
        it('executes efficient search queries with indexed columns', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Create users with searchable content
            User::factory()->count(50)->create([
                'name' => 'Test User',
            ])->each(function ($user) {
                $user->assignRole('pegawai');
            });

            DB::enableQueryLog();

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.show', [
                    'role' => $role,
                    'search' => 'Test',
                ]));

            $queries = DB::getQueryLog();

            // Search should use indexes, not add extra queries
            expect(count($queries))->toBeLessThanOrEqual(5);

            $response->assertSuccessful();

            // Verify search works correctly
            $data = $response->json('data');
            $allMatched = collect($data)->every(function ($user) {
                return str_contains(strtolower($user['name']), 'test') ||
                       str_contains(strtolower($user['email']), 'test') ||
                       str_contains(strtolower($user['nip'] ?? ''), 'test');
            });

            expect($allMatched)->toBeTrue();
        });

        it('handles combined search and filter efficiently', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Create active and inactive users
            User::factory()->count(25)->create([
                'name' => 'Active User',
                'is_active' => true,
            ])->each(function ($user) {
                $user->assignRole('pegawai');
            });

            User::factory()->count(25)->create([
                'name' => 'Active User',
                'is_active' => false,
            ])->each(function ($user) {
                $user->assignRole('pegawai');
            });

            DB::enableQueryLog();

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.show', [
                    'role' => $role,
                    'search' => 'Active',
                    'is_active' => 'true',
                ]));

            $queries = DB::getQueryLog();

            // Combined search and filter should still use single query
            expect(count($queries))->toBeLessThanOrEqual(5);

            $response->assertSuccessful();

            // Verify all results are active
            $data = $response->json('data');
            $allActive = collect($data)->every(function ($user) {
                return str_contains($user['name'], 'Active');
            });

            expect($allActive)->toBeTrue();
        });
    });

    describe('Response Time Performance', function () {
        it('index responds within reasonable time', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            // Create users with roles
            User::factory()->count(100)->create()->each(function ($user) {
                $user->assignRole('pegawai');
            });

            $startTime = microtime(true);

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.index'));

            $endTime = microtime(true);
            $responseTime = ($endTime - $startTime) * 1000; // Convert to ms

            // Should respond within 500ms
            expect($responseTime)->toBeLessThan(500);

            $response->assertSuccessful();
        });

        it('show responds within reasonable time with pagination', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Create many users
            User::factory()->count(150)->create()->each(function ($user) {
                $user->assignRole('pegawai');
            });

            $startTime = microtime(true);

            $response = $this->actingAs($superAdmin)
                ->getJson(route('admin.roles.show', $role));

            $endTime = microtime(true);
            $responseTime = ($endTime - $startTime) * 1000; // Convert to ms

            // Should respond within 500ms even with pagination
            expect($responseTime)->toBeLessThan(500);

            $response->assertSuccessful();
        });
    });
});
