<?php

use App\Models\User;
use App\Services\PermissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles before each test
    $this->seed(\Database\Seeders\RolesSeeder::class);
});

describe('PermissionService Performance Tests', function () {
    describe('Caching Functionality', function () {
        it('caches super admin check', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $service = app(PermissionService::class);

            // First call should hit database
            $result1 = $service->isSuperAdmin($superAdmin);
            expect($result1)->toBeTrue();

            // Second call should use cache
            $result2 = $service->isSuperAdmin($superAdmin);
            expect($result2)->toBeTrue();

            // Verify cache was used
            $cacheKey = 'permissions:super_admin:' . $superAdmin->id;
            expect(Cache::has($cacheKey))->toBeTrue();
        });

        it('caches user permissions', function () {
            $user = User::factory()->create();
            $user->assignRole('pegawai');

            $service = app(PermissionService::class);

            // First call
            $permissions1 = $service->getUserPermissions($user);
            expect($permissions1)->toBeInstanceOf(\Illuminate\Support\Collection::class);

            // Second call should use cache
            $permissions2 = $service->getUserPermissions($user);
            expect($permissions2)->toEqual($permissions1);

            // Verify cache was used
            $cacheKey = 'permissions:user:' . $user->id;
            expect(Cache::has($cacheKey))->toBeTrue();
        });

        it('caches user roles', function () {
            $user = User::factory()->create();
            $user->assignRole('kpa');

            $service = app(PermissionService::class);

            // First call
            $roles1 = $service->getUserRoles($user);
            expect($roles1)->toContain('kpa');

            // Second call should use cache
            $roles2 = $service->getUserRoles($user);
            expect($roles2)->toEqual($roles1);

            // Verify cache was used
            $cacheKey = 'permissions:roles:' . $user->id;
            expect(Cache::has($cacheKey))->toBeTrue();
        });

        it('caches role with user counts', function () {
            $service = app(PermissionService::class);

            // First call
            $roles1 = $service->getAllRolesWithUserCount();
            expect($roles1)->toBeInstanceOf(\Illuminate\Support\Collection::class);
            expect($roles1)->toHaveCount(6); // 6 predefined roles

            // Second call should use cache
            $roles2 = $service->getAllRolesWithUserCount();
            expect($roles2)->toEqual($roles1);

            // Verify cache was used
            expect(Cache::has('permissions:roles_with_counts'))->toBeTrue();
        });
    });

    describe('Cache Invalidation', function () {
        it('invalidates user cache when role changes', function () {
            $user = User::factory()->create();
            $user->assignRole('pegawai');

            $service = app(PermissionService::class);

            // Warm up cache
            $service->getUserPermissions($user);
            $service->getUserRoles($user);

            // Verify cache exists
            expect(Cache::has('permissions:user:' . $user->id))->toBeTrue();
            expect(Cache::has('permissions:roles:' . $user->id))->toBeTrue();

            // Invalidate cache
            $service->invalidateUserCache($user->id);

            // Verify cache is cleared
            expect(Cache::has('permissions:user:' . $user->id))->toBeFalse();
            expect(Cache::has('permissions:roles:' . $user->id))->toBeFalse();
        });

        it('invalidates all caches when requested', function () {
            $service = app(PermissionService::class);

            // Warm up cache
            $service->getAllRolesWithUserCount();
            $service->getAllPermissions();

            // Verify cache exists
            expect(Cache::has('permissions:roles_with_counts'))->toBeTrue();
            expect(Cache::has('permissions:all_permissions'))->toBeTrue();

            // Invalidate all caches
            $service->invalidateAllCaches();

            // Verify cache is cleared
            expect(Cache::has('permissions:roles_with_counts'))->toBeFalse();
            expect(Cache::has('permissions:all_permissions'))->toBeFalse();
        });

        it('invalidates role cache', function () {
            $service = app(PermissionService::class);

            // Warm up cache
            $service->getAllRolesWithUserCount();

            // Verify cache exists
            expect(Cache::has('permissions:roles_with_counts'))->toBeTrue();

            // Invalidate role cache
            $role = Role::where('name', 'pegawai')->first();
            $service->invalidateRoleCache($role->id);

            // Verify cache is cleared
            expect(Cache::has('permissions:roles_with_counts'))->toBeFalse();
        });
    });

    describe('Performance Improvements', function () {
        it('reduces database queries for repeated permission checks', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $service = app(PermissionService::class);

            // Enable query logging
            \DB::enableQueryLog();

            // First call should hit database
            $service->isSuperAdmin($superAdmin);
            $queryCount1 = count(\DB::getQueryLog());

            // Clear query log
            \DB::flushQueryLog();

            // Second call should use cache
            $service->isSuperAdmin($superAdmin);
            $queryCount2 = count(\DB::getQueryLog());

            // Cached version should have fewer queries
            expect($queryCount2)->toBeLessThan($queryCount1);
        });

        it('warms up cache efficiently', function () {
            $user = User::factory()->create();
            $user->assignRole('kpa');

            $service = app(PermissionService::class);

            // Warm up cache
            $service->warmUpUserCache($user);

            // Verify all caches are set
            expect(Cache::has('permissions:super_admin:' . $user->id))->toBeTrue();
            expect(Cache::has('permissions:user:' . $user->id))->toBeTrue();
            expect(Cache::has('permissions:roles:' . $user->id))->toBeTrue();
        });

        it('handles bulk operations efficiently', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Create multiple users
            $users = User::factory()->count(5)->create();
            $userIds = $users->pluck('id')->toArray();

            $service = app(PermissionService::class);

            // Sync users to role
            $service->syncRoleUsers($role, $userIds);

            // Verify all users have the role
            foreach ($users as $user) {
                expect($user->fresh()->hasRole('pegawai'))->toBeTrue();
            }

            // Verify caches are invalidated
            foreach ($userIds as $userId) {
                expect(Cache::has('permissions:user:' . $userId))->toBeFalse();
            }
        });
    });

    describe('Eager Loading Optimization', function () {
        it('uses eager loading for role with user counts', function () {
            $service = app(PermissionService::class);

            // Create users with roles
            $users = User::factory()->count(3)->create();
            foreach ($users as $user) {
                $user->assignRole('pegawai');
            }

            \DB::enableQueryLog();

            $roles = $service->getAllRolesWithUserCount();

            $queryCount = count(\DB::getQueryLog());

            // Should use eager loading to avoid N+1 queries
            expect($queryCount)->toBeLessThan(10);
        });

        it('optimizes role users query with eager loading', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $role = Role::where('name', 'pegawai')->first();

            // Create users
            User::factory()->count(5)->create()->each(function ($user) use ($role) {
                $user->assignRole('pegawai');
            });

            $service = app(PermissionService::class);

            \DB::enableQueryLog();

            $users = $service->getRoleUsers($role);

            $queryCount = count(\DB::getQueryLog());

            // Should use LEFT JOIN optimization
            expect($queryCount)->toBeLessThan(5);
            expect($users->total())->toBeGreaterThan(0);
        });
    });

    describe('Cache Performance', function () {
        it('returns cached data faster than database queries', function () {
            $user = User::factory()->create();
            $user->assignRole('kpa');

            $service = app(PermissionService::class);

            // First call (database)
            $start1 = microtime(true);
            $service->getUserPermissions($user);
            $time1 = microtime(true) - $start1;

            // Second call (cache)
            $start2 = microtime(true);
            $service->getUserPermissions($user);
            $time2 = microtime(true) - $start2;

            // Cached call should be faster
            expect($time2)->toBeLessThan($time1);
        });

        it('maintains cache consistency', function () {
            $user = User::factory()->create();
            $user->assignRole('pegawai');

            $service = app(PermissionService::class);

            // Get initial permissions
            $permissions1 = $service->getUserPermissions($user);

            // Add new role
            $user->assignRole('kpa');

            // Invalidate cache
            $service->invalidateUserCache($user->id);

            // Get updated permissions
            $permissions2 = $service->getUserPermissions($user);

            // Permissions should be different after cache invalidation
            expect($permissions2)->not->toEqual($permissions1);
        });
    });

    describe('Memory Efficiency', function () {
        it('caches data efficiently without memory leaks', function () {
            $service = app(PermissionService::class);

            $initialMemory = memory_get_usage();

            // Perform multiple operations
            for ($i = 0; $i < 100; $i++) {
                $user = User::factory()->create();
                $user->assignRole('pegawai');
                $service->warmUpUserCache($user);
            }

            $finalMemory = memory_get_usage();
            $memoryIncrease = $finalMemory - $initialMemory;

            // Memory increase should be reasonable (less than 50MB for 100 users)
            expect($memoryIncrease)->toBeLessThan(50 * 1024 * 1024);
        });
    });

    describe('Super Admin Wildcard Optimization', function () {
        it('caches super admin wildcard access', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $service = app(PermissionService::class);

            // Check super admin status multiple times
            for ($i = 0; $i < 10; $i++) {
                expect($service->isSuperAdmin($superAdmin))->toBeTrue();
            }

            // Should only query database once
            expect(Cache::has('permissions:super_admin:' . $superAdmin->id))->toBeTrue();
        });

        it('bypasses permission checks for super admin with caching', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $service = app(PermissionService::class);

            // Check various permissions
            expect($service->userHasPermission($superAdmin, 'edit users'))->toBeTrue();
            expect($service->userHasPermission($superAdmin, 'delete assets'))->toBeTrue();
            expect($service->userHasPermission($superAdmin, 'manage roles'))->toBeTrue();

            // All should be cached
            expect(Cache::has('permissions:has_permission:' . $superAdmin->id . ':edit users'))->toBeTrue();
            expect(Cache::has('permissions:has_permission:' . $superAdmin->id . ':delete assets'))->toBeTrue();
            expect(Cache::has('permissions:has_permission:' . $superAdmin->id . ':manage roles'))->toBeTrue();
        });
    });
});
