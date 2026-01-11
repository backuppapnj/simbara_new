import type { User } from '@/types';
import { usePage } from '@inertiajs/react';

/**
 * Permission checking composable for frontend authorization
 */
export function usePermission() {
    const page = usePage();
    const user = page.props.auth?.user as User | undefined;

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

        return permissions.some((permission) =>
            user.permissions.includes(permission),
        );
    };

    /**
     * Check if user has all of the given permissions
     */
    const canAll = (permissions: string[]): boolean => {
        if (!user?.permissions) {
            return false;
        }

        return permissions.every((permission) =>
            user.permissions.includes(permission),
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

        return roles.some((role) => user.roles.includes(role));
    };

    /**
     * Check if user has all of the given roles
     */
    const hasAllRoles = (roles: string[]): boolean => {
        if (!user?.roles) {
            return false;
        }

        return roles.every((role) => user.roles.includes(role));
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
