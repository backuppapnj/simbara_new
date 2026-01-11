<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\OfficeSupply;
use App\Models\User;

class OfficeSupplyPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('office.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, OfficeSupply $officeSupply): bool
    {
        return $user->can('office.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('office.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, OfficeSupply $officeSupply): bool
    {
        return $user->can('office.edit');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, OfficeSupply $officeSupply): bool
    {
        return $user->can('office.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, OfficeSupply $officeSupply): bool
    {
        return $user->can('office.delete');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, OfficeSupply $officeSupply): bool
    {
        return $user->can('office.delete');
    }
}
