<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\AtkRequest;
use App\Models\User;

class AtkRequestPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('atk.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, AtkRequest $atkRequest): bool
    {
        // Users can view their own requests
        if ($user->id === $atkRequest->user_id) {
            return true;
        }

        return $user->can('atk.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('atk.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, AtkRequest $atkRequest): bool
    {
        // Users can only update their own pending requests
        if ($user->id === $atkRequest->user_id && $atkRequest->status === 'pending') {
            return true;
        }

        return $user->can('atk.edit');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, AtkRequest $atkRequest): bool
    {
        // Users can only delete their own pending requests
        if ($user->id === $atkRequest->user_id && $atkRequest->status === 'pending') {
            return true;
        }

        return $user->can('atk.delete');
    }

    /**
     * Determine whether the user can approve the request.
     */
    public function approve(User $user, AtkRequest $atkRequest): bool
    {
        return $user->can('atk.requests.approve');
    }

    /**
     * Determine whether the user can reject the request.
     */
    public function reject(User $user, AtkRequest $atkRequest): bool
    {
        return $user->can('atk.requests.approve');
    }

    /**
     * Determine whether the user can distribute the request.
     */
    public function distribute(User $user, AtkRequest $atkRequest): bool
    {
        return $user->can('atk.requests.distribute');
    }

    /**
     * Determine whether the user can confirm receipt.
     */
    public function confirmReceive(User $user, AtkRequest $atkRequest): bool
    {
        // Only the requester can confirm receipt
        if ($user->id === $atkRequest->user_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can export requests.
     */
    public function export(User $user): bool
    {
        return $user->can('atk.reports');
    }
}
