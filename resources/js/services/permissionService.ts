import { router } from '@inertiajs/react';

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
        return router.post(route('admin.permissions.store'), data, {
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
        return router.put(route('admin.permissions.update', id), data, {
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
        return router.delete(route('admin.permissions.destroy', id), {
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
            route('admin.roles.sync-permissions', roleId),
            { permission_ids: permissionIds },
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
        return router.get(route('admin.permissions.index'));
    },

    /**
     * Navigate to role permissions
     */
    navigateToRolePermissions: (
        roleId: number,
        tab: string = 'permissions',
    ) => {
        return router.get(route('admin.roles.show', roleId), { tab });
    },
};

export default permissionService;
