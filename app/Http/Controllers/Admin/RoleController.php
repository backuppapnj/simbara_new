<?php

namespace App\Http\Controllers\Admin;

use App\Actions\SyncRolePermissions;
use App\Http\Controllers\Controller;
use App\Http\Requests\RoleUsersRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of all roles with user counts.
     *
     * @param  \Illuminate\Http\Request  $request  The incoming HTTP request
     * @return \Inertia\Response|\Illuminate\Http\JsonResponse Returns Inertia view or JSON response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException When user is not super_admin
     */
    public function index(Request $request): \Inertia\Response|\Illuminate\Http\JsonResponse
    {
        $user = auth()->user();

        // Only super_admin can access role management
        if (! $user->hasRole('super_admin')) {
            abort(403, 'Only super_admin can access role management.');
        }

        // Get all roles with user counts
        $roles = Role::withCount('users')
            ->orderBy('name')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'users_count' => $role->users_count,
                ];
            });

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => $roles,
            ]);
        }

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Display users for a specific role with search/filter.
     *
     * @param  \Illuminate\Http\Request  $request  The incoming HTTP request with search and filter parameters
     * @param  \Spatie\Permission\Models\Role  $role  The role to display users for
     * @return \Inertia\Response|\Illuminate\Http\JsonResponse Returns Inertia view or JSON response with paginated users
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException When user is not super_admin
     */
    public function show(Request $request, Role $role): \Inertia\Response|\Illuminate\Http\JsonResponse
    {
        $user = auth()->user();

        // Only super_admin can access role management
        if (! $user->hasRole('super_admin')) {
            abort(403, 'Only super_admin can access role management.');
        }

        // Build query for users with role membership check using LEFT JOIN
        // This avoids N+1 query and loading all role users into memory
        $query = \App\Models\User::query()
            ->leftJoin('model_has_roles', function ($join) use ($role) {
                $join->on('users.id', '=', 'model_has_roles.model_id')
                    ->where('model_has_roles.model_type', '=', \App\Models\User::class)
                    ->where('model_has_roles.role_id', '=', $role->id);
            })
            ->select('users.*', 'model_has_roles.role_id as has_role');

        // Search by name, email, or NIP
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('email', 'like', "%{$searchTerm}%")
                    ->orWhere('nip', 'like', "%{$searchTerm}%");
            });
        }

        // Filter by active status
        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $users = $query->orderBy('name')->paginate(20);

        // Transform users to include has_role flag as boolean
        $usersCollection = collect($users->items())->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'nip' => $user->nip,
                'has_role' => ! is_null($user->has_role),
            ];
        });

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => $usersCollection,
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ],
            ]);
        }

        return Inertia::render('Admin/Roles/Show', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'users_count' => $role->users()->count(),
            ],
            'users' => [
                'data' => $usersCollection,
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    /**
     * Update users assigned to a specific role.
     *
     * Handles super_admin exclusivity rule:
     * - When assigning super_admin role: removes all other roles from users
     * - When assigning other roles: removes super_admin role if present
     *
     * @param  \App\Http\Requests\RoleUsersRequest  $request  The validated request with user_ids array
     * @param  \Spatie\Permission\Models\Role  $role  The role to update users for
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse Returns redirect or JSON response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException When user is not super_admin
     * @throws \Throwable When database transaction fails
     */
    public function updateUsers(RoleUsersRequest $request, Role $role): \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $user = auth()->user();

        // Only super_admin can update role assignments
        if (! $user->hasRole('super_admin')) {
            abort(403, 'Only super_admin can update role assignments.');
        }

        $validated = $request->validated();

        DB::transaction(function () use ($role, $validated) {
            // Handle super_admin exclusivity rule
            if ($role->name === 'super_admin') {
                // Remove all other roles from users being assigned super_admin
                foreach ($validated['user_ids'] as $userId) {
                    $userModel = \App\Models\User::findOrFail($userId);
                    // Remove all roles except super_admin (will be assigned after this)
                    $userModel->roles()->sync([$role->id]);
                }
            } else {
                // For non-super_admin roles, check if any user has super_admin
                foreach ($validated['user_ids'] as $userId) {
                    $userModel = \App\Models\User::findOrFail($userId);
                    if ($userModel->hasRole('super_admin')) {
                        // Remove super_admin if assigning another role
                        $userModel->removeRole('super_admin');
                    }
                }
            }

            // Sync users to this role (replaces existing users)
            $role->users()->sync($validated['user_ids']);
        });

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'role' => [
                        'id' => $role->id,
                        'name' => $role->name,
                    ],
                    'user_ids' => $validated['user_ids'],
                ],
            ]);
        }

        return redirect()->back()->with('success', 'Role assignments updated successfully.');
    }

    /**
     * Display all permissions with role's permissions marked.
     *
     * Returns all available permissions grouped by module, with the role's
     * current permissions marked. For super_admin role, this will show all
     * permissions as assigned (via wildcard).
     *
     * @param  \Illuminate\Http\Request  $request  The incoming HTTP request
     * @param  \Spatie\Permission\Models\Role  $role  The role to get permissions for
     * @return \Inertia\Response|\Illuminate\Http\JsonResponse Returns Inertia view or JSON response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException When user is not super_admin
     */
    public function permissions(Request $request, Role $role): \Inertia\Response|\Illuminate\Http\JsonResponse
    {
        $user = auth()->user();

        // Only super_admin can access role permissions
        if (! $user->hasRole('super_admin')) {
            abort(403, 'Only super_admin can access role permissions.');
        }

        // Get all permissions and group by module
        $allPermissions = Permission::orderBy('name')->get();

        // Get role's current permissions
        $rolePermissionIds = $role->permissions->pluck('id')->toArray();

        // For super_admin, all permissions are considered assigned (wildcard)
        $isSuperAdmin = $role->name === 'super_admin';

        // Group permissions by module (extract module from permission name format: module.action)
        $groupedPermissions = $allPermissions->groupBy(function ($permission) {
            $parts = explode('.', $permission->name);

            return $parts[0] ?? 'other';
        })->map(function ($permissions, $module) use ($rolePermissionIds, $isSuperAdmin) {
            return [
                'module' => $module,
                'permissions' => $permissions->map(function ($permission) use ($rolePermissionIds, $isSuperAdmin) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'assigned' => $isSuperAdmin || in_array($permission->id, $rolePermissionIds),
                    ];
                })->values(),
            ];
        })->values();

        // Sort modules alphabetically
        $groupedPermissions = $groupedPermissions->sortBy('module')->values();

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'role' => [
                        'id' => $role->id,
                        'name' => $role->name,
                    ],
                    'permissions' => $groupedPermissions,
                    'is_super_admin' => $isSuperAdmin,
                ],
            ]);
        }

        return Inertia::render('Admin/Roles/Permissions', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
            ],
            'permissions' => $groupedPermissions,
            'is_super_admin' => $isSuperAdmin,
        ]);
    }

    /**
     * Sync permissions to a specific role.
     *
     * Handles super_admin wildcard permission logic:
     * - super_admin automatically gets all permissions (cannot be modified)
     * - For other roles, sync the provided permission IDs
     *
     * @param  \Illuminate\Http\Request  $request  The incoming request with permission_ids
     * @param  \Spatie\Permission\Models\Role  $role  The role to sync permissions for
     * @param  \App\Actions\SyncRolePermissions  $syncRolePermissions  The business logic action
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse Returns redirect or JSON response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException When user is not super_admin
     * @throws \Throwable When database transaction fails
     */
    public function syncPermissions(Request $request, Role $role, SyncRolePermissions $syncRolePermissions): \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $user = auth()->user();

        // Only super_admin can sync role permissions
        if (! $user->hasRole('super_admin')) {
            abort(403, 'Only super_admin can sync role permissions.');
        }

        $validated = $request->validate([
            'permission_ids' => ['present', 'array'],
            'permission_ids.*' => ['exists:permissions,id'],
        ], [
            'permission_ids.present' => 'Permission wajib dipilih.',
            'permission_ids.array' => 'Format permission tidak valid.',
            'permission_ids.*.exists' => 'Permission tidak ditemukan.',
        ]);

        DB::transaction(function () use ($role, $validated, $syncRolePermissions) {
            $syncRolePermissions->handle($role, $validated['permission_ids'] ?? []);
        });

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'role' => [
                        'id' => $role->id,
                        'name' => $role->name,
                    ],
                    'permission_ids' => $validated['permission_ids'] ?? [],
                ],
            ]);
        }

        return redirect()->back()->with('success', 'Role permissions updated successfully.');
    }
}
