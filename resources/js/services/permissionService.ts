import { router } from '@inertiajs/react';
import permissions from '@/routes/admin/permissions';
import roles from '@/routes/admin/roles';

export interface Permission {
    id: number;
    name: string;
    module: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface PermissionGroup {
    module: string;
    permissions: Permission[];
}

export interface RolePermission {
    id: number;
    name: string;
    module: string;
    description: string | null;
    assigned: boolean;
}

export interface CreatePermissionData {
    name: string;
    module: string;
    description?: string;
}

export interface UpdatePermissionData {
    name?: string;
    description?: string;
}

export interface GetPermissionsResponse {
    groups: PermissionGroup[];
    all: Permission[];
}

export interface GetRolePermissionsResponse {
    groups: PermissionGroup[];
    all: RolePermission[];
}

declare global {
    interface Window {
        permissions?: GetPermissionsResponse;
        rolePermissions?: Record<number, GetRolePermissionsResponse>;
    }
}

const permissionService = {
    /**
     * Get all permissions grouped by module
     */
    getPermissions: (): GetPermissionsResponse => {
        // This will be called from Inertia page props
        // The actual data fetching happens server-side
        return window.permissions || { groups: [], all: [] };
    },

    /**
     * Get permissions for a specific role
     */
    getRolePermissions: (roleId: number): GetRolePermissionsResponse => {
        // This will be called from Inertia page props
        // The actual data fetching happens server-side
        return window.rolePermissions?.[roleId] || { groups: [], all: [] };
    },

    /**
     * Create a new permission
     */
    createPermission: (data: CreatePermissionData) => {
        return router.post(permissions.store.url(), data as any, {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Permission created successfully');
            },
            onError: (errors) => {
                console.error('Error creating permission:', errors);
            },
        });
    },

    /**
     * Update an existing permission
     */
    updatePermission: (id: number, data: UpdatePermissionData) => {
        return router.put(permissions.update.url(id), data as any, {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Permission updated successfully');
            },
            onError: (errors) => {
                console.error('Error updating permission:', errors);
            },
        });
    },

    /**
     * Delete a permission
     */
    deletePermission: (id: number) => {
        return router.delete(permissions.destroy.url(id), {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Permission deleted successfully');
            },
            onError: (errors) => {
                console.error('Error deleting permission:', errors);
            },
        });
    },

    /**
     * Sync permissions for a role
     */
    syncRolePermissions: (roleId: number, permissionIds: number[]) => {
        return router.put(
            roles.syncPermissions.url(roleId),
            { permission_ids: permissionIds } as any,
            {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Permissions synced successfully');
                },
                onError: (errors) => {
                    console.error('Error syncing permissions:', errors);
                },
            },
        );
    },

    /**
     * Navigate to permission list
     */
    navigateToPermissions: () => {
        return router.get(permissions.index.url());
    },

    /**
     * Navigate to role permissions
     */
    navigateToRolePermissions: (
        roleId: number,
        tab: string = 'permissions',
    ) => {
        return router.get(roles.show.url(roleId), { tab });
    },
};

export default permissionService;
