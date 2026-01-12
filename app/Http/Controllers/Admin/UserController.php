<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of users with pagination and filters.
     */
    public function index(Request $request): \Inertia\Response|\Illuminate\Http\JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $query = User::query()
            ->with('roles')
            ->withCount('roles');

        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('email', 'like', "%{$searchTerm}%")
                    ->orWhere('nip', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->has('role') && $request->role) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        if ($request->has('is_active') && $request->is_active !== null && $request->is_active !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('department') && $request->department) {
            $query->where('department', $request->department);
        }

        $sortBy = $request->get('sort_by', 'name');
        $sortDirection = $request->get('sort_direction', 'asc');
        $query->orderBy($sortBy, $sortDirection);

        $perPage = in_array($request->get('per_page', 20), [20, 50, 100]) ? $request->get('per_page', 20) : 20;
        $users = $query->paginate($perPage);

        $usersCollection = collect($users->items())->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'nip' => $user->nip,
                'position' => $user->position,
                'department' => $user->department,
                'is_active' => $user->is_active,
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
                'updated_at' => $user->updated_at?->toIso8601String(),
                'roles' => $user->roles->pluck('name'),
                'roles_count' => $user->roles_count,
            ];
        });

        if ($request->wantsJson()) {
            return response()->json([
                'data' => $usersCollection,
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ],
            ]);
        }

        $roles = Role::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Users/Index', [
            'users' => [
                'data' => $usersCollection,
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
            'filters' => $request->only(['search', 'role', 'is_active', 'department', 'sort_by', 'sort_direction']),
            'roles' => $roles,
        ]);
    }

    /**
     * Display a specific user with details.
     */
    public function show(Request $request, User $user): \Inertia\Response|\Illuminate\Http\JsonResponse
    {
        $this->authorize('view', $user);

        $user->load(['roles']);

        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'nip' => $user->nip,
            'position' => $user->position,
            'department' => $user->department,
            'is_active' => $user->is_active,
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
            'updated_at' => $user->updated_at?->toIso8601String(),
            'deleted_at' => $user->deleted_at?->toIso8601String(),
            'roles' => $user->roles->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
            ])->values(),
        ];

        if ($request->wantsJson()) {
            return response()->json(['data' => $userData]);
        }

        $roles = Role::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Users/Show', [
            'user' => $userData,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validated();

        $user = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'nip' => $validated['nip'] ?? null,
                'position' => $validated['position'] ?? null,
                'department' => $validated['department'] ?? null,
                'password' => bcrypt($validated['password']),
                'is_active' => $validated['is_active'] ?? true,
            ]);

            if (isset($validated['roles']) && is_array($validated['roles'])) {
                $user->syncRoles($validated['roles']);
            } elseif (isset($validated['roles']) && is_string($validated['roles'])) {
                $user->assignRole($validated['roles']);
            } else {
                $user->assignRole('pegawai');
            }

            return $user;
        });

        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ], 201);
        }

        return redirect()
            ->route('admin.users.show', $user->id)
            ->with('success', 'User created successfully.');
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user): \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validated();

        DB::transaction(function () use ($user, $validated) {
            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'nip' => $validated['nip'] ?? null,
                'position' => $validated['position'] ?? null,
                'department' => $validated['department'] ?? null,
                'is_active' => $validated['is_active'] ?? $user->is_active,
            ];

            if (! empty($validated['password'])) {
                $updateData['password'] = bcrypt($validated['password']);
            }

            $user->update($updateData);

            if (isset($validated['email_verified'])) {
                if ($validated['email_verified']) {
                    $user->markEmailAsVerified();
                } else {
                    $user->email_verified_at = null;
                    $user->save();
                }
            }

            if (isset($validated['roles']) && is_array($validated['roles'])) {
                $user->syncRoles($validated['roles']);
            } elseif (isset($validated['roles']) && is_string($validated['roles'])) {
                $user->syncRoles([$validated['roles']]);
            }
        });

        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ]);
        }

        return redirect()
            ->back()
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage (soft delete).
     */
    public function destroy(Request $request, User $user): \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $this->authorize('delete', $user);

        DB::transaction(function () use ($user) {
            $user->delete();
        });

        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                ],
            ]);
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Restore a soft deleted user.
     */
    public function restore(Request $request, int $id): \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $user = User::withTrashed()->findOrFail($id);

        $this->authorize('restore', $user);

        DB::transaction(function () use ($user) {
            $user->restore();
        });

        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                ],
            ]);
        }

        return redirect()
            ->back()
            ->with('success', 'User restored successfully.');
    }

    /**
     * Sync roles to a specific user.
     */
    public function syncRoles(Request $request, User $user): \Illuminate\Http\JsonResponse
    {
        $authUser = auth()->user();

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
            $roles = Role::whereIn('id', $validated['role_ids'])->get();
            $superAdminRole = Role::where('name', 'super_admin')->first();

            $isAssigningSuperAdmin = $roles->contains('id', $superAdminRole?->id);

            if ($isAssigningSuperAdmin) {
                $user->syncRoles([$superAdminRole->id]);
            } else {
                if ($user->hasRole('super_admin')) {
                    $user->removeRole('super_admin');
                }

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
