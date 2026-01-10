<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\NotificationLog;
use App\Models\User;

class NotificationLogPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, NotificationLog $log): bool
    {
        return $user->hasRole('super_admin');
    }
}
