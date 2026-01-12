<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Sync roles to a specific user.
     *
     * Handles super_admin exclusivity rule:
     * - When assigning super_admin role: removes all other roles from user
     * - When assigning other roles: removes super_admin role if present
     *
     * @param  \Illuminate\Http\Request  $request  The incoming request with role_ids array
     * @param  \App\Models\User  $user  The user to sync roles for
     * @return \Illuminate\Http\JsonResponse Returns JSON response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException When user is not super_admin
     * @throws \Throwable When database transaction fails
     */
    public function syncRoles(Request $request, User $user): JsonResponse
    {
        $authUser = auth()->user();

        // Only super_admin can sync user roles
        if (! $authUser->hasRole('super_admin')) {
            abort(403, 'Only super_admin can sync user roles.');
        }

        $validated = $request->validate([
            'role_ids' => ['present', 'array'],
            'role_ids.*' => ['exists:roles,id'],
        ], [
            'role_ids.present' => 'Role wajib dipilih.',
            'role_ids.array' => 'Format role tidak valid.',
            'role_ids.*.exists' => 'Role tidak ditemukan.',
        ]);

        DB::transaction(function () use ($user, $validated) {
            // Get roles being assigned
            $roles = \Spatie\Permission\Models\Role::whereIn('id', $validated['role_ids'])->get();
            $superAdminRole = \Spatie\Permission\Models\Role::where('name', 'super_admin')->first();

            // Check if super_admin is being assigned
            $isAssigningSuperAdmin = $roles->contains('id', $superAdminRole?->id);

            if ($isAssigningSuperAdmin) {
                // When assigning super_admin, remove all other roles
                // syncRoles will handle this automatically
                $user->syncRoles([$superAdminRole->id]);
            } else {
                // When assigning non-super_admin roles, ensure super_admin is removed
                // if the user currently has it
                if ($user->hasRole('super_admin')) {
                    $user->removeRole('super_admin');
                }

                // Sync the provided roles
                $user->syncRoles($validated['role_ids']);
            }
        });

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->fresh()->roles->pluck('name'),
                ],
            ],
        ]);
    }
}
