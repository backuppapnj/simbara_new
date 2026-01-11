<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Asset;
use App\Models\User;

class AssetPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('assets.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Asset $asset): bool
    {
        return $user->can('assets.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('assets.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Asset $asset): bool
    {
        return $user->can('assets.edit');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Asset $asset): bool
    {
        return $user->can('assets.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Asset $asset): bool
    {
        return $user->can('assets.delete');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Asset $asset): bool
    {
        return $user->can('assets.delete');
    }

    /**
     * Determine whether the user can manage photos.
     */
    public function managePhotos(User $user, Asset $asset): bool
    {
        return $user->can('assets.photos');
    }

    /**
     * Determine whether the user can update location.
     */
    public function updateLocation(User $user, Asset $asset): bool
    {
        return $user->can('assets.edit');
    }

    /**
     * Determine whether the user can update condition.
     */
    public function updateCondition(User $user, Asset $asset): bool
    {
        return $user->can('assets.edit');
    }

    /**
     * Determine whether the user can manage maintenance.
     */
    public function manageMaintenance(User $user, Asset $asset): bool
    {
        return $user->can('assets.maintenance');
    }

    /**
     * Determine whether the user can import assets.
     */
    public function import(User $user): bool
    {
        return $user->can('assets.import');
    }

    /**
     * Determine whether the user can export assets.
     */
    public function export(User $user): bool
    {
        return $user->can('assets.export');
    }
}
