<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('users.view') || $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can view a specific user.
     */
    public function view(User $user, User $model): bool
    {
        return $user->can('users.view') || $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can create users.
     */
    public function create(User $user): bool
    {
        return $user->can('users.create') || $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can update a user.
     */
    public function update(User $user, User $model): bool
    {
        return $user->can('users.edit') || $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can delete a user.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->can('users.delete') || $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can restore a user.
     */
    public function restore(User $user, User $model): bool
    {
        return $user->can('users.delete') || $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can permanently delete a user.
     */
    public function forceDelete(User $user, User $model): bool
    {
        return $user->can('users.delete') || $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can export users.
     */
    public function export(User $user): bool
    {
        return $user->can('users.view') || $user->hasRole('super_admin');
    }
}
