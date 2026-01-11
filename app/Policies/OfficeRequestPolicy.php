<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\OfficeRequest;
use App\Models\User;

class OfficeRequestPolicy
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
    public function view(User $user, OfficeRequest $officeRequest): bool
    {
        // Users can view their own requests
        if ($user->id === $officeRequest->user_id) {
            return true;
        }

        return $user->can('office.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('office.requests.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, OfficeRequest $officeRequest): bool
    {
        // Users can only update their own pending requests
        if ($user->id === $officeRequest->user_id && $officeRequest->status === 'pending') {
            return true;
        }

        return $user->can('office.edit');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, OfficeRequest $officeRequest): bool
    {
        // Users can only delete their own pending requests
        if ($user->id === $officeRequest->user_id && $officeRequest->status === 'pending') {
            return true;
        }

        return $user->can('office.delete');
    }

    /**
     * Determine whether the user can approve the request.
     */
    public function approve(User $user, OfficeRequest $officeRequest): bool
    {
        return $user->can('office.requests.approve');
    }

    /**
     * Determine whether the user can reject the request.
     */
    public function reject(User $user, OfficeRequest $officeRequest): bool
    {
        return $user->can('office.requests.approve');
    }
}
