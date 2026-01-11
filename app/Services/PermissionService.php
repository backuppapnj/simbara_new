<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionService
{
    /**
     * Cache TTL in seconds (24 hours).
     */
    private const CACHE_TTL = 86400;

    /**
     * Cache key prefix.
     */
    private const CACHE_PREFIX = 'permissions:';

    /**
     * Check if a user has super admin role with caching.
     *
     * @param  \App\Models\User  $user  The user to check
     * @return bool True if user is super admin
     */
    public function isSuperAdmin($user): bool
    {
        $cacheKey = self::CACHE_PREFIX."super_admin:{$user->id}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($user) {
            return $user->hasRole('super_admin');
        });
    }

    /**
     * Get all permissions for a user with caching.
     *
     * @param  \App\Models\User  $user  The user to get permissions for
     * @return \Illuminate\Support\Collection Collection of permissions
     */
    public function getUserPermissions($user)
    {
        $cacheKey = self::CACHE_PREFIX."user:{$user->id}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($user) {
            // Super admin has all permissions
            if ($user->hasRole('super_admin')) {
                return Permission::all()->pluck('name');
            }

            return $user->getAllPermissions()->pluck('name');
        });
    }

    /**
     * Get all roles for a user with caching.
     *
     * @param  \App\Models\User  $user  The user to get roles for
     * @return \Illuminate\Support\Collection Collection of role names
     */
    public function getUserRoles($user)
    {
        $cacheKey = self::CACHE_PREFIX."roles:{$user->id}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($user) {
            return $user->roles->pluck('name');
        });
    }

    /**
     * Check if a user has a specific permission with caching.
     *
     * @param  \App\Models\User  $user  The user to check
     * @param  string  $permission  The permission to check
     * @return bool True if user has permission
     */
    public function userHasPermission($user, string $permission): bool
    {
        $cacheKey = self::CACHE_PREFIX."has_permission:{$user->id}:{$permission}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($user, $permission) {
            // Super admin has all permissions
            if ($user->hasRole('super_admin')) {
                return true;
            }

            return $user->hasPermissionTo($permission);
        });
    }

    /**
     * Check if a user has a specific role with caching.
     *
     * @param  \App\Models\User  $user  The user to check
     * @param  string  $role  The role to check
     * @return bool True if user has role
     */
    public function userHasRole($user, string $role): bool
    {
        $cacheKey = self::CACHE_PREFIX."has_role:{$user->id}:{$role}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($user, $role) {
            return $user->hasRole($role);
        });
    }

    /**
     * Get all roles with user counts (optimized with eager loading).
     *
     * @return \Illuminate\Support\Collection Collection of roles with user counts
     */
    public function getAllRolesWithUserCount()
    {
        $cacheKey = self::CACHE_PREFIX.'roles_with_counts';

        return Cache::remember($cacheKey, self::CACHE_TTL, function () {
            return Role::withCount('users')
                ->orderBy('name')
                ->get()
                ->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'users_count' => $role->users_count,
                    ];
                });
        });
    }

    /**
     * Invalidate permission cache for a specific user.
     *
     * @param  int  $userId  The user ID to invalidate cache for
     */
    public function invalidateUserCache(int $userId): void
    {
        $patterns = [
            self::CACHE_PREFIX."super_admin:{$userId}",
            self::CACHE_PREFIX."user:{$userId}",
            self::CACHE_PREFIX."roles:{$userId}",
            self::CACHE_PREFIX."has_permission:{$userId}:*",
            self::CACHE_PREFIX."has_role:{$userId}:*",
        ];

        foreach ($patterns as $pattern) {
            if (str_contains($pattern, '*')) {
                // Handle wildcard patterns
                Cache::forget($pattern);
            } else {
                Cache::forget($pattern);
            }
        }

        // Also flush all permission-related caches for this user
        Cache::forget(self::CACHE_PREFIX."super_admin:{$userId}");
        Cache::forget(self::CACHE_PREFIX."user:{$userId}");
        Cache::forget(self::CACHE_PREFIX."roles:{$userId}");
    }

    /**
     * Invalidate all permission caches.
     */
    public function invalidateAllCaches(): void
    {
        // Flush all permission-related caches
        Cache::forget(self::CACHE_PREFIX.'roles_with_counts');
        Cache::forget(self::CACHE_PREFIX.'all_permissions');
    }

    /**
     * Invalidate cache for a specific role.
     *
     * @param  int  $roleId  The role ID to invalidate cache for
     */
    public function invalidateRoleCache(int $roleId): void
    {
        $this->invalidateAllCaches();
    }

    /**
     * Get all permissions with caching.
     *
     * @return \Illuminate\Support\Collection Collection of all permissions
     */
    public function getAllPermissions()
    {
        $cacheKey = self::CACHE_PREFIX.'all_permissions';

        return Cache::remember($cacheKey, self::CACHE_TTL, function () {
            return Permission::all();
        });
    }

    /**
     * Warm up cache for a user.
     *
     * @param  \App\Models\User  $user  The user to warm up cache for
     */
    public function warmUpUserCache($user): void
    {
        $this->isSuperAdmin($user);
        $this->getUserPermissions($user);
        $this->getUserRoles($user);
    }

    /**
     * Get role with users and eager load relationships.
     *
     * @param  \Spatie\Permission\Models\Role  $role  The role to load
     * @return array Role data with user information
     */
    public function getRoleWithUsers(Role $role): array
    {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'users_count' => $role->users()->count(),
        ];
    }

    /**
     * Get users for a role with optimized queries.
     *
     * @param  \Spatie\Permission\Models\Role  $role  The role to get users for
     * @param  array  $filters  Filters to apply (search, is_active)
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator Paginated users
     */
    public function getRoleUsers(Role $role, array $filters = [])
    {
        $query = \App\Models\User::query()
            ->leftJoin('model_has_roles', function ($join) use ($role) {
                $join->on('users.id', '=', 'model_has_roles.model_id')
                    ->where('model_has_roles.model_type', '=', \App\Models\User::class)
                    ->where('model_has_roles.role_id', '=', $role->id);
            })
            ->select('users.*', 'model_has_roles.role_id as has_role');

        // Apply search filter
        if (! empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('email', 'like', "%{$searchTerm}%")
                    ->orWhere('nip', 'like', "%{$searchTerm}%");
            });
        }

        // Apply active status filter
        if (isset($filters['is_active']) && $filters['is_active'] !== null) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderBy('name')->paginate(20);
    }

    /**
     * Sync users to a role with cache invalidation.
     *
     * @param  \Spatie\Permission\Models\Role  $role  The role to sync users to
     * @param  array  $userIds  Array of user IDs to sync
     */
    public function syncRoleUsers(Role $role, array $userIds): void
    {
        // Sync users to role
        $role->users()->sync($userIds);

        // Invalidate caches for all affected users
        foreach ($userIds as $userId) {
            $this->invalidateUserCache($userId);
        }

        // Invalidate role cache
        $this->invalidateRoleCache($role->id);
    }

    /**
     * Assign role to user with cache invalidation.
     *
     * @param  \App\Models\User  $user  The user to assign role to
     * @param  string  $roleName  The role name to assign
     */
    public function assignRoleToUser($user, string $roleName): void
    {
        $user->assignRole($roleName);
        $this->invalidateUserCache($user->id);
    }

    /**
     * Remove role from user with cache invalidation.
     *
     * @param  \App\Models\User  $user  The user to remove role from
     * @param  string  $roleName  The role name to remove
     */
    public function removeRoleFromUser($user, string $roleName): void
    {
        $user->removeRole($roleName);
        $this->invalidateUserCache($user->id);
    }

    /**
     * Sync all roles for a user with cache invalidation.
     *
     * @param  \App\Models\User  $user  The user to sync roles for
     * @param  array  $roleIds  Array of role IDs to sync
     */
    public function syncUserRoles($user, array $roleIds): void
    {
        $user->roles()->sync($roleIds);
        $this->invalidateUserCache($user->id);
    }
}
