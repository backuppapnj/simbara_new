<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SyncPermissionsRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionController extends Controller
{
    /**
     * Display permissions for a specific role grouped by module.
     *
     * @param  \Illuminate\Http\Request  $request  The incoming HTTP request
     * @param  \Spatie\Permission\Models\Role  $role  The role to display permissions for
     * @return \Inertia\Response|\Illuminate\Http\JsonResponse Returns Inertia view or JSON response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException When user is not super_admin
     */
    public function index(Request $request, Role $role): \Inertia\Response|JsonResponse
    {
        $user = auth()->user();

        // Only super_admin can access role permission management
        if (! $user->hasRole('super_admin')) {
            abort(403, 'Only super_admin can access role permission management.');
        }

        // Get all permissions grouped by module
        $allPermissions = Permission::orderBy('name')->get()->groupBy(function ($permission) {
            $parts = explode('.', $permission->name);

            return $parts[0];
        })->map(function ($modulePermissions, $module) {
            return [
                'module' => $module,
                'permissions' => $modulePermissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                    ];
                })->values(),
            ];
        })->values();

        // Get role's current permissions
        $rolePermissionNames = $role->permissions->pluck('name')->toArray();

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'role' => [
                        'id' => $role->id,
                        'name' => $role->name,
                    ],
                    'permissions' => $allPermissions,
                    'role_permission_names' => $rolePermissionNames,
                ],
            ]);
        }

        return Inertia::render('Admin/Roles/Permissions', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
            ],
            'permissions' => $allPermissions,
            'role_permission_names' => $rolePermissionNames,
        ]);
    }

    /**
     * Sync permissions to a specific role.
     *
     * Handles super_admin special case:
     * - When syncing permissions to super_admin role: automatically assigns all permissions
     * - For other roles: syncs the provided permissions
     *
     * @param  \App\Http\Requests\SyncPermissionsRequest  $request  The validated request with permission_ids array
     * @param  \Spatie\Permission\Models\Role  $role  The role to sync permissions for
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse Returns redirect or JSON response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException When user is not super_admin
     * @throws \Throwable When database transaction fails
     */
    public function update(SyncPermissionsRequest $request, Role $role): RedirectResponse|JsonResponse
    {
        $user = auth()->user();

        // Only super_admin can sync role permissions
        if (! $user->hasRole('super_admin')) {
            abort(403, 'Only super_admin can sync role permissions.');
        }

        $validated = $request->validated();

        DB::transaction(function () use ($role, $validated) {
            // Special handling for super_admin role
            if ($role->name === 'super_admin') {
                // Super admin always gets all permissions
                $allPermissions = Permission::all()->pluck('name')->toArray();
                $role->syncPermissions($allPermissions);
            } else {
                // Sync the provided permissions for other roles
                // Default to empty array if not provided
                $permissionIds = $validated['permission_ids'] ?? [];
                $role->syncPermissions($permissionIds);
            }
        });

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'role' => [
                        'id' => $role->id,
                        'name' => $role->name,
                    ],
                    'permission_ids' => $role->permissions->pluck('name')->toArray(),
                ],
            ]);
        }

        return redirect()->back()->with('success', 'Role permissions updated successfully.');
    }
}
