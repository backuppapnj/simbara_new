<?php

namespace App\Actions;

use Illuminate\Support\Collection;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class SyncRolePermissions
{
    /**
     * Sync permissions to a role with super_admin wildcard handling.
     *
     * The super_admin role has a wildcard permission (*) which grants access to all permissions.
     * When syncing permissions to super_admin, we actually assign the wildcard permission.
     * For other roles, we sync the provided permission IDs normally.
     *
     * This action also handles deduplication and cleanup of orphaned permissions.
     *
     * @param  Role  $role  The role to sync permissions to
     * @param  array<int, int>  $permissionIds  Array of permission IDs to sync
     */
    public function handle(Role $role, array $permissionIds): void
    {
        // Handle super_admin wildcard permission logic
        if ($role->name === 'super_admin') {
            $this->handleSuperAdminPermissions($role);

            return;
        }

        // For non-super_admin roles, sync the provided permissions
        // Ensure we only sync valid permission IDs
        $permissions = Permission::whereIn('id', $permissionIds)->get();
        $permissionNames = $permissions->pluck('name')->unique()->toArray();

        // Sync permissions to the role
        $role->syncPermissions($permissionNames);

        // Cleanup: Remove any duplicate permission entries if they exist
        $this->cleanupDuplicatePermissions($role);
    }

    /**
     * Handle permissions for super_admin role.
     *
     * The super_admin role gets a wildcard permission (*) which grants access to
     * all permissions automatically. We don't need to sync individual permissions.
     *
     * @param  Role  $role  The super_admin role
     */
    protected function handleSuperAdminPermissions(Role $role): void
    {
        // Check if wildcard permission exists, if not create it
        $wildcardPermission = Permission::firstOrCreate(
            ['name' => '*', 'guard_name' => 'web'],
            ['name' => '*', 'guard_name' => 'web']
        );

        // Sync only the wildcard permission to super_admin
        $role->syncPermissions([$wildcardPermission->name]);
    }

    /**
     * Cleanup duplicate permission entries for a role.
     *
     * In some cases, duplicate entries might exist in role_has_permissions table.
     * This method removes any duplicates to ensure data integrity.
     *
     * @param  Role  $role  The role to cleanup permissions for
     */
    protected function cleanupDuplicatePermissions(Role $role): void
    {
        // Get current permission IDs for this role
        $currentPermissionIds = $role->permissions->pluck('id')->toArray();

        // Check for duplicates in the pivot table
        $duplicates = \DB::table('role_has_permissions')
            ->select('permission_id', \DB::raw('COUNT(*) as count'))
            ->where('role_id', $role->id)
            ->whereIn('permission_id', $currentPermissionIds)
            ->groupBy('permission_id')
            ->having('count', '>', 1)
            ->get();

        // Remove duplicates by resyncing
        if ($duplicates->isNotEmpty()) {
            $permissionNames = $role->permissions->pluck('name')->unique()->toArray();
            $role->syncPermissions($permissionNames);
        }
    }

    /**
     * Check if a collection of permissions contains the wildcard permission.
     *
     * @param  Collection<int, Permission>  $permissions  Collection of permissions to check
     * @return bool True if wildcard permission is present
     */
    protected function hasWildcardPermission(Collection $permissions): bool
    {
        return $permissions->contains('name', '*');
    }
}
