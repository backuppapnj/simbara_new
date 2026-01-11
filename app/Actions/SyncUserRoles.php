<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Support\Collection;
use Spatie\Permission\Models\Role;

class SyncUserRoles
{
    /**
     * Sync roles to a user with super_admin exclusivity handling.
     *
     * The super_admin role is exclusive - a user with super_admin cannot have any other roles.
     * When super_admin is assigned, all other roles are automatically removed.
     * When super_admin is removed, the user can have other roles.
     *
     * @param  User  $user  The user to sync roles to
     * @param  array<int, int>  $roleIds  Array of role IDs to sync
     */
    public function handle(User $user, array $roleIds): void
    {
        $roles = Role::whereIn('id', $roleIds)->get();

        // Check if super_admin is being assigned
        if ($this->hasSuperAdminRole($roles)) {
            // Remove all other roles, keep only super_admin
            $user->syncRoles(['super_admin']);

            return;
        }

        // Sync normally - this will also remove super_admin if the user had it
        // but it's not in the new roles list
        $user->syncRoles($roles->pluck('name')->toArray());
    }

    /**
     * Check if a collection of roles contains the super_admin role.
     *
     * @param  Collection<int, Role>  $roles  Collection of roles to check
     * @return bool True if super_admin role is present
     */
    protected function hasSuperAdminRole(Collection $roles): bool
    {
        return $roles->contains('name', 'super_admin');
    }
}
