<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePermissionRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Display a listing of all permissions grouped by module.
     *
     * @param  \Illuminate\Http\Request  $request  The incoming HTTP request
     * @return \Inertia\Response|\Illuminate\Http\JsonResponse Returns Inertia view or JSON response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException When user is not super_admin
     */
    public function index(Request $request): \Inertia\Response|JsonResponse
    {
        $user = auth()->user();

        // Only super_admin can access permission management
        if (! $user->hasRole('super_admin')) {
            abort(403, 'Only super_admin can access permission management.');
        }

        // Get all permissions and group by module
        $permissions = Permission::orderBy('name')->get()->groupBy(function ($permission) {
            return explode('.', $permission->name)[0];
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

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => $permissions,
            ]);
        }

        return Inertia::render('Admin/Permissions/Index', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created permission in storage.
     *
     * @param  \App\Http\Requests\StorePermissionRequest  $request  The validated request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse Returns redirect or JSON response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException When user is not super_admin
     */
    public function store(StorePermissionRequest $request): RedirectResponse|JsonResponse
    {
        $user = auth()->user();

        // Only super_admin can create permissions
        if (! $user->hasRole('super_admin')) {
            abort(403, 'Only super_admin can create permissions.');
        }

        $validated = $request->validated();

        $permission = Permission::firstOrCreate(
            ['name' => $validated['name'], 'guard_name' => 'web'],
            ['name' => $validated['name'], 'guard_name' => 'web']
        );

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                ],
            ], 201);
        }

        return redirect()->back()->with('success', 'Permission created successfully.');
    }

    /**
     * Update the specified permission in storage.
     *
     * @param  \App\Http\Requests\StorePermissionRequest  $request  The validated request
     * @param  \Spatie\Permission\Models\Permission  $permission  The permission to update
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse Returns redirect or JSON response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException When user is not super_admin
     */
    public function update(StorePermissionRequest $request, Permission $permission): RedirectResponse|JsonResponse
    {
        $user = auth()->user();

        // Only super_admin can update permissions
        if (! $user->hasRole('super_admin')) {
            abort(403, 'Only super_admin can update permissions.');
        }

        $validated = $request->validated();

        $permission->update([
            'name' => $validated['name'],
        ]);

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                ],
            ]);
        }

        return redirect()->back()->with('success', 'Permission updated successfully.');
    }

    /**
     * Remove the specified permission from storage.
     *
     * @param  \Illuminate\Http\Request  $request  The incoming HTTP request
     * @param  \Spatie\Permission\Models\Permission  $permission  The permission to delete
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse Returns redirect or JSON response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException When user is not super_admin
     */
    public function destroy(Request $request, Permission $permission): RedirectResponse|JsonResponse
    {
        $user = auth()->user();

        // Only super_admin can delete permissions
        if (! $user->hasRole('super_admin')) {
            abort(403, 'Only super_admin can delete permissions.');
        }

        $permissionName = $permission->name;
        $permission->delete();

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'message' => 'Permission deleted successfully.',
                    'name' => $permissionName,
                ],
            ]);
        }

        return redirect()->back()->with('success', 'Permission deleted successfully.');
    }
}
