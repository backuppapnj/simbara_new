import type { SharedData, User } from '@/types';
import { usePage } from '@inertiajs/react';

/**
 * Permission checking composable for frontend authorization
 */
export function usePermission() {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;

    /**
     * Check if user has a specific permission
     */
    const can = (permission: string): boolean => {
        if (!user?.permissions) {
            return false;
        }

        return user.permissions.includes(permission);
    };

    /**
     * Check if user has any of the given permissions
     */
    const canAny = (permissions: string[]): boolean => {
        if (!user?.permissions) {
            return false;
        }

        const userPermissions = user.permissions;
        return permissions.some((permission) =>
            userPermissions.includes(permission),
        );
    };

    /**
     * Check if user has all of the given permissions
     */
    const canAll = (permissions: string[]): boolean => {
        if (!user?.permissions) {
            return false;
        }

        const userPermissions = user.permissions;
        return permissions.every((permission) =>
            userPermissions.includes(permission),
        );
    };

    /**
     * Check if user has a specific role
     */
    const hasRole = (role: string): boolean => {
        if (!user?.roles) {
            return false;
        }

        return user.roles.includes(role);
    };

    /**
     * Check if user has any of the given roles
     */
    const hasAnyRole = (roles: string[]): boolean => {
        if (!user?.roles) {
            return false;
        }

        const userRoles = user.roles;
        return roles.some((role) => userRoles.includes(role));
    };

    /**
     * Check if user has all of the given roles
     */
    const hasAllRoles = (roles: string[]): boolean => {
        if (!user?.roles) {
            return false;
        }

        const userRoles = user.roles;
        return roles.every((role) => userRoles.includes(role));
    };

    return {
        can,
        canAny,
        canAll,
        hasRole,
        hasAnyRole,
        hasAllRoles,
    };
}
