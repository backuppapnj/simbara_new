<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;

class AuditLogService
{
    /**
     * Log a generic audit action.
     *
     * @param  \App\Models\User  $actor  The user who performed the action
     * @param  \App\Models\User  $user  The user who was affected by the action
     * @param  string  $action  The action that was performed
     * @param  array|null  $changes  The changes made (before/after)
     */
    public static function log(User $actor, User $user, string $action, ?array $changes = null): AuditLog
    {
        return AuditLog::create([
            'user_id' => $user->id,
            'actor_id' => $actor->id,
            'action' => $action,
            'changes' => $changes,
        ]);
    }

    /**
     * Log user creation.
     *
     * @param  \App\Models\User  $actor  The user who created the user
     * @param  \App\Models\User  $user  The user that was created
     * @param  array  $changes  The changes made
     */
    public static function logUserCreated(User $actor, User $user, array $changes): AuditLog
    {
        return self::log($actor, $user, 'user_created', $changes);
    }

    /**
     * Log user update.
     *
     * @param  \App\Models\User  $actor  The user who updated the user
     * @param  \App\Models\User  $user  The user that was updated
     * @param  array  $changes  The changes made (before/after)
     */
    public static function logUserUpdated(User $actor, User $user, array $changes): AuditLog
    {
        return self::log($actor, $user, 'user_updated', $changes);
    }

    /**
     * Log user deletion.
     *
     * @param  \App\Models\User  $actor  The user who deleted the user
     * @param  \App\Models\User  $user  The user that was deleted
     * @param  array  $changes  The changes made
     */
    public static function logUserDeleted(User $actor, User $user, array $changes): AuditLog
    {
        return self::log($actor, $user, 'user_deleted', $changes);
    }

    /**
     * Log role assignment.
     *
     * @param  \App\Models\User  $actor  The user who assigned the role
     * @param  \App\Models\User  $user  The user who had the role assigned
     * @param  array  $changes  The changes made
     */
    public static function logRoleAssigned(User $actor, User $user, array $changes): AuditLog
    {
        return self::log($actor, $user, 'role_assigned', $changes);
    }

    /**
     * Log role removal.
     *
     * @param  \App\Models\User  $actor  The user who removed the role
     * @param  \App\Models\User  $user  The user who had the role removed
     * @param  array  $changes  The changes made
     */
    public static function logRoleRemoved(User $actor, User $user, array $changes): AuditLog
    {
        return self::log($actor, $user, 'role_removed', $changes);
    }

    /**
     * Log impersonate start.
     *
     * @param  \App\Models\User  $actor  The user who started impersonating
     * @param  \App\Models\User  $user  The user being impersonated
     * @param  array  $changes  Additional information about the impersonation
     */
    public static function logImpersonateStart(User $actor, User $user, array $changes): AuditLog
    {
        return self::log($actor, $user, 'impersonate_started', $changes);
    }

    /**
     * Log impersonate stop.
     *
     * @param  \App\Models\User  $actor  The user who stopped impersonating
     * @param  \App\Models\User  $user  The user who was being impersonated
     * @param  array  $changes  Additional information about the impersonation
     */
    public static function logImpersonateStop(User $actor, User $user, array $changes): AuditLog
    {
        return self::log($actor, $user, 'impersonate_stopped', $changes);
    }
}
