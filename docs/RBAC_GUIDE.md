# RBAC (Role-Based Access Control) Guide

## Overview

This application implements a comprehensive Role-Based Access Control (RBAC) system using Laravel's Spatie Permission package. The system provides granular control over user permissions and ensures security through proper authorization checks.

## Table of Contents

1. [Roles](#roles)
2. [3-Level Approval Workflow](#3-level-approval-workflow)
3. [Permissions](#permissions)
4. [Super Admin Wildcard Access](#super-admin-wildcard-access)
5. [Permission Middleware](#permission-middleware)
6. [Performance Optimization](#performance-optimization)
7. [Security Best Practices](#security-best-practices)
8. [Usage Examples](#usage-examples)
9. [Testing](#testing)

## Roles

The application defines 6 predefined roles with hierarchical access:

### 1. super_admin
- **Description**: Highest level of access with full system control
- **Access**: Can access all routes, manage all roles and permissions
- **Exclusivity**: Mutually exclusive with other roles (users with super_admin cannot have other roles)
- **Wildcard Access**: Has implicit permission to all actions without explicit permission assignment

### 2. kpa (Kuasa Pengguna Anggaran)
- **Description**: Budget authority with approval capabilities
- **Access**: Can approve requests, view reports, manage budget-related operations
- **Permissions**: `approve requests`, `view reports`, `manage budget`

### 3. kasubag_umum (Kepala Subbagian Umum)
- **Description**: General subdivision head with administrative oversight for assets and supplies
- **Access**: Can manage assets, office supplies, and ATK items with full CRUD operations
- **Permissions**: `assets.*`, `atk.*`, `office.*` (full management of these modules)
- **Restrictions**: Does NOT have system administration permissions (users.view, roles.manage, settings.whatsapp)
- **Note**: This role focuses on operational management, not system administration

### 4. operator_bmn
- **Description**: Asset management operator
- **Access**: Can manage assets, process asset mutations, handle asset maintenance
- **Permissions**: `manage assets`, `process mutations`, `manage maintenance`

### 5. operator_persediaan
- **Description**: Inventory/supply management operator
- **Access**: Can manage inventory items, process stock opnames, handle supplies
- **Permissions**: `manage inventory`, `process stock opname`, `manage supplies`

### 6. pegawai
- **Description**: Regular employee with basic access
- **Access**: Can view assets, create requests, view own data
- **Permissions**: `view assets`, `create requests`, `view own data`

## 3-Level Approval Workflow

The application implements a streamlined 3-level approval workflow for ATK and office supply requests:

### Workflow Stages

#### Level 1: Request Creation
- **Actor**: pegawai
- **Action**: Creates ATK or office supply requests
- **Permissions Required**: `atk.requests.create` or `office.requests.create`
- **Outcome**: Request created with status "pending"

#### Level 2: Initial Approval
- **Actor**: operator_persediaan
- **Action**: Reviews and approves/rejects requests at the inventory level
- **Permissions Required**: `atk.requests.approve` or `office.requests.approve`
- **Outcome**: Request status updated to "approved" or "rejected"

#### Level 3: Final Approval
- **Actor**: kpa (Kuasa Pengguna Anggaran)
- **Action**: Provides final budgetary approval
- **Permissions Required**: `atk.requests.approve` or `office.requests.approve`
- **Outcome**: Request marked as "finally approved" and ready for distribution

### Key Points

- **kasubag_umum is NOT in the approval chain**: This role manages assets and supplies but does not participate in the request approval workflow
- **operator_persediaan acts as gatekeeper**: Validates inventory availability and request validity before KPA review
- **kpa has final authority**: Budget approval rests with the KPA role
- **super_admin can override**: The super_admin role has wildcard access and can intervene at any stage if needed

### Permission Matrix for Approval Workflow

| Role | Create Request | Level 1 Approval | Level 2 Approval | Distribution |
|------|---------------|------------------|------------------|--------------|
| pegawai | ✓ | - | - | - |
| operator_persediaan | ✓ | ✓ | - | ✓ |
| kpa | - | ✓ | ✓ (Final) | - |
| kasubag_umum | - | - | - | - |
| operator_bmn | - | - | - | - |
| super_admin | ✓ | ✓ | ✓ | ✓ |

## Permissions

Permissions define specific actions that users can perform. The system supports:

### Complete Permission Matrix by Role

| Module/Permission | super_admin | kpa | kasubag_umum | operator_bmn | operator_persediaan | pegawai |
|-------------------|-------------|-----|--------------|--------------|---------------------|---------|
| **Assets Module** | | | | | | |
| assets.view | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| assets.create | ✓ | - | ✓ | ✓ | - | - |
| assets.edit | ✓ | - | ✓ | ✓ | - | - |
| assets.delete | ✓ | - | ✓ | ✓ | - | - |
| assets.import | ✓ | - | ✓ | ✓ | - | - |
| assets.export | ✓ | ✓ | ✓ | ✓ | - | - |
| assets.photos.* | ✓ | - | ✓ | ✓ | - | - |
| assets.maintenance.* | ✓ | - | ✓ | ✓ | - | - |
| assets.reports.* | ✓ | ✓ | ✓ | ✓ | - | - |
| **ATK Module** | | | | | | |
| atk.view | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| atk.create | ✓ | - | ✓ | - | ✓ | - |
| atk.edit | ✓ | - | ✓ | - | ✓ | - |
| atk.delete | ✓ | - | ✓ | - | ✓ | - |
| atk.stock.view | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| atk.items.* | ✓ | - | ✓ | - | ✓ | - |
| atk.purchases.view | ✓ | ✓ | ✓ | - | ✓ | - |
| atk.purchases.create | ✓ | - | ✓ | - | ✓ | - |
| atk.purchases.approve | ✓ | ✓ | ✓ | - | - | - |
| atk.requests.view | ✓ | ✓ | ✓ | - | ✓ | - |
| atk.requests.create | ✓ | - | ✓ | - | ✓ | ✓ |
| atk.requests.approve | ✓ | ✓ | ✓ | - | ✓ (Level 1) | - |
| atk.requests.reject | ✓ | ✓ | ✓ | - | ✓ | - |
| atk.requests.distribute | ✓ | - | ✓ | - | ✓ | - |
| atk.reports.* | ✓ | ✓ | ✓ | - | ✓ | - |
| **Office Module** | | | | | | |
| office.view | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| office.* | ✓ | - | ✓ | - | ✓ | - |
| **Stock Opnames** | | | | | | |
| stock_opnames.* | ✓ | ✓ | ✓ | - | ✓ | - |
| **User Management** | | | | | | |
| users.view | ✓ | - | ✗ | - | - | - |
| users.* | ✓ | - | ✗ | - | - | - |
| **Role Management** | | | | | | |
| roles.view | ✓ | - | ✗ | - | - | - |
| roles.manage | ✓ | - | ✗ | - | - | - |
| **Permission Management** | | | | | | |
| permissions.view | ✓ | - | ✗ | - | - | - |
| permissions.manage | ✓ | - | ✗ | - | - | - |
| **Settings** | | | | | | |
| settings.view | ✓ | - | ✗ | - | - | - |
| settings.whatsapp | ✓ | - | ✗ | - | - | - |
| settings.general | ✓ | - | ✗ | - | - | - |

**Legend:**
- ✓ = Has permission
- - = No permission
- ✗ = Explicitly denied (system administration permissions restricted from kasubag_umum)

**Key Observations:**
1. **super_admin**: Has all permissions via wildcard `*`
2. **kasubag_umum**: Full access to assets, ATK, and office modules, but NO system administration permissions
3. **kpa**: Can view and approve requests, view reports, but cannot create/edit/delete
4. **operator_persediaan**: Manages ATK and office supplies, Level 1 approval authority
5. **operator_bmn**: Manages assets only
6. **pegawai**: Basic view and create request permissions only

### Permission Structure

Permissions follow a naming convention: `{action} {resource}`

Examples:
- `view assets`
- `create requests`
- `approve requests`
- `manage users`
- `delete assets`

### Permission Assignment

Permissions can be assigned:
1. **Directly to users**: `$user->givePermissionTo('edit users')`
2. **Via roles**: `$role->givePermissionTo('manage assets')`
3. **Through wildcard patterns**: Super admin has implicit `*` permission

## Super Admin Wildcard Access

The super_admin role has special wildcard access that bypasses explicit permission checks:

### Implementation

```php
// In CheckPermission middleware
if ($user->hasRole('super_admin')) {
    return $next($request); // Allow all access
}
```

### Benefits
- Simplified permission management for administrators
- No need to assign individual permissions to super_admin
- Automatic access to new features as they're added

### Caching
Super admin checks are cached for performance:

```php
// Cache key: permissions:super_admin:{user_id}
// TTL: 24 hours
$isSuperAdmin = $permissionService->isSuperAdmin($user);
```

## Permission Middleware

### CheckPermission Middleware

The `CheckPermission` middleware handles route-level authorization:

```php
// In routes/web.php
Route::middleware(['auth', 'permission:edit users'])->group(function () {
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::post('/admin/users', [UserController::class, 'store']);
});
```

### Usage Patterns

#### Single Permission
```php
Route::middleware(['auth', 'permission:edit users'])
    ->get('/admin/users/edit', [UserController::class, 'edit']);
```

#### Multiple Permissions (OR Logic)
```php
Route::middleware(['auth', 'permission:edit users|delete users'])
    ->get('/admin/users/manage', [UserController::class, 'manage']);
```

#### Role-Based
```php
Route::middleware(['auth', 'permission:super_admin|kpa'])
    ->get('/admin/approvals', [ApprovalController::class, 'index']);
```

#### Mixed Roles and Permissions
```php
Route::middleware(['auth', 'permission:super_admin|permission:edit assets|operator_bmn'])
    ->get('/assets/manage', [AssetController::class, 'manage']);
```

## Performance Optimization

### Permission Caching

The application uses a `PermissionService` to cache permission checks:

#### Cache Keys
- `permissions:super_admin:{user_id}` - Super admin status
- `permissions:user:{user_id}` - User permissions list
- `permissions:roles:{user_id}` - User roles list
- `permissions:has_permission:{user_id}:{permission}` - Specific permission check
- `permissions:roles_with_counts` - All roles with user counts
- `permissions:all_permissions` - All permissions in system

#### Cache TTL
All permission caches have a 24-hour TTL (86400 seconds).

#### Cache Invalidation

Automatic cache invalidation occurs when:
- User roles are modified
- Permissions are assigned/revoked
- Role assignments change

Manual invalidation:
```php
$permissionService = app(PermissionService::class);

// Invalidate specific user cache
$permissionService->invalidateUserCache($userId);

// Invalidate all caches
$permissionService->invalidateAllCaches();

// Invalidate role cache
$permissionService->invalidateRoleCache($roleId);
```

### Query Optimization

#### Eager Loading
```php
// Avoid N+1 queries with eager loading
$roles = Role::withCount('users')->orderBy('name')->get();
```

#### LEFT JOIN Optimization
```php
// Efficient role membership check
$users = User::query()
    ->leftJoin('model_has_roles', function ($join) use ($role) {
        $join->on('users.id', '=', 'model_has_roles.model_id')
            ->where('model_has_roles.model_type', '=', User::class)
            ->where('model_has_roles.role_id', '=', $role->id);
    })
    ->select('users.*', 'model_has_roles.role_id as has_role')
    ->paginate(20);
```

## Security Best Practices

### 1. Authorization Checks

Always check authorization before performing actions:

```php
public function update(Request $request, $id)
{
    $user = auth()->user();

    // Check authorization
    if (!$user->hasRole('super_admin') && !$user->hasPermissionTo('edit users')) {
        abort(403, 'Unauthorized');
    }

    // Proceed with action
}
```

### 2. Super Admin Exclusivity

Enforce mutual exclusivity for super_admin role:

```php
// When assigning super_admin, remove all other roles
if ($role->name === 'super_admin') {
    $user->roles()->sync([$role->id]);
}

// When assigning other roles, remove super_admin if present
if ($user->hasRole('super_admin')) {
    $user->removeRole('super_admin');
}
```

### 3. Input Validation

Always validate user input, especially for role assignments:

```php
// Use Form Request validation
public function rules()
{
    return [
        'user_ids' => 'required|array',
        'user_ids.*' => 'integer|exists:users,id',
    ];
}
```

### 4. SQL Injection Prevention

The system uses Laravel's Eloquent ORM and parameterized queries to prevent SQL injection:

```php
// Safe - uses parameterized queries
$users = User::where('name', 'like', "%{$search}%")->get();

// Never use raw queries with user input
// Unsafe - DO NOT DO THIS
// DB::select("SELECT * FROM users WHERE name = '{$userInput}'");
```

### 5. XSS Prevention

All user input is escaped when rendered:

```php
// Blade automatically escapes output
{{ $user->name }} // Safe

// For JSON responses, Laravel handles escaping
return response()->json(['name' => $user->name]); // Safe
```

### 6. CSRF Protection

All state-changing routes require CSRF tokens:

```php
// CSRF token is automatically included in forms
<form method="POST" action="/admin/roles">
    @csrf
    <!-- Form fields -->
</form>
```

## Usage Examples

### Checking Permissions in Code

```php
use App\Services\PermissionService;

class SomeController extends Controller
{
    public function __construct(
        private PermissionService $permissionService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        // Check if user is super admin (cached)
        if ($this->permissionService->isSuperAdmin($user)) {
            // Allow full access
        }

        // Check specific permission (cached)
        if ($this->permissionService->userHasPermission($user, 'view assets')) {
            // Show assets
        }

        // Get user permissions (cached)
        $permissions = $this->permissionService->getUserPermissions($user);

        // Get user roles (cached)
        $roles = $this->permissionService->getUserRoles($user);
    }
}
```

### Assigning Roles and Permissions

```php
// Assign role to user
$user->assignRole('kpa');

// Assign permission to user
$user->givePermissionTo('edit assets');

// Assign permission to role
$role = Role::findByName('kpa');
$role->givePermissionTo('approve requests');

// Remove role from user
$user->removeRole('pegawai');

// Revoke permission from user
$user->revokePermissionTo('delete users');

// Sync user roles (replaces all existing roles)
$user->syncRoles(['kpa', 'operator_bmn']);
```

### Using PermissionService

```php
use App\Services\PermissionService;

class RoleController extends Controller
{
    public function __construct(
        private PermissionService $permissionService
    ) {}

    public function index()
    {
        $user = auth()->user();

        // Get all roles with user counts (cached)
        $roles = $this->permissionService->getAllRolesWithUserCount();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
        ]);
    }

    public function updateUsers(RoleUsersRequest $request, Role $role)
    {
        $validated = $request->validated();

        // Sync users to role with cache invalidation
        $this->permissionService->syncRoleUsers($role, $validated['user_ids']);

        return redirect()->back()->with('success', 'Role assignments updated.');
    }
}
```

### Checking Permissions in Blade/React Components

In React components (using Inertia.js):

```tsx
import { usePage } from '@inertiajs/react';

export default function RoleList() {
    const { auth } = usePage().props;

    const canManageRoles = auth.user.roles?.includes('super_admin');

    return (
        <div>
            {canManageRoles && (
                <button>Manage Roles</button>
            )}
        </div>
    );
}
```

## Testing

### Unit Tests

Test individual components:

```php
// tests/Unit/PermissionMiddlewareTest.php
it('allows super_admin access to all routes', function () {
    $user = User::factory()->create();
    $user->assignRole('super_admin');

    $response = $this->actingAs($user)
        ->get('/admin/roles');

    $response->assertSuccessful();
});
```

### Feature Tests

Test complete workflows:

```php
// tests/Feature/Admin/RoleControllerTest.php
it('allows super_admin to manage role assignments', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('super_admin');

    $pegawai = User::factory()->create();
    $role = Role::where('name', 'pegawai')->first();

    $response = $this->actingAs($superAdmin)
        ->put("/admin/roles/{$role->id}/users", [
            'user_ids' => [$pegawai->id],
        ]);

    $response->assertRedirect();
    expect($pegawai->fresh()->hasRole('pegawai'))->toBeTrue();
});
```

### Browser Tests

Test end-to-end user interactions:

```php
// tests/Browser/RbacBrowserTest.php
it('allows super_admin to view permissions list', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('super_admin');

    $page = visit('/admin/roles', $superAdmin);

    $page->assertSuccessful()
        ->assertSee('Roles')
        ->assertNoJavascriptErrors();
});
```

### Security Tests

Test security vulnerabilities:

```php
// tests/Feature/Security/RbacSecurityTest.php
it('prevents role escalation via direct URL manipulation', function () {
    $pegawai = User::factory()->create();
    $pegawai->assignRole('pegawai');

    $response = $this->actingAs($pegawai)
        ->get('/admin/roles');

    $response->assertForbidden();
});
```

### Performance Tests

Test caching effectiveness:

```php
// tests/Feature/Admin/PermissionServicePerformanceTest.php
it('caches super admin check', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('super_admin');

    $service = app(PermissionService::class);

    // First call hits database
    $result1 = $service->isSuperAdmin($superAdmin);

    // Second call uses cache
    $result2 = $service->isSuperAdmin($superAdmin);

    expect(Cache::has('permissions:super_admin:' . $superAdmin->id))->toBeTrue();
});
```

### Running Tests

```bash
# Run all RBAC tests
php artisan test --compact --filter=Rbac

# Run security tests
php artisan test --compact tests/Feature/Security/

# Run browser tests
php artisan test --compact tests/Browser/

# Run performance tests
php artisan test --compact tests/Feature/Admin/PermissionServicePerformanceTest.php
```

## Database Structure

### Key Tables

#### `roles`
- `id` - Primary key
- `name` - Role name (unique)
- `guard_name` - Auth guard (default: 'web')
- `created_at`, `updated_at` - Timestamps

#### `permissions`
- `id` - Primary key
- `name` - Permission name (unique)
- `guard_name` - Auth guard (default: 'web')
- `created_at`, `updated_at` - Timestamps

#### `model_has_roles`
- `role_id` - Foreign key to roles
- `model_type` - Model class (e.g., 'App\Models\User')
- `model_id` - User ID

#### `model_has_permissions`
- `permission_id` - Foreign key to permissions
- `model_type` - Model class
- `model_id` - User ID

#### `role_has_permissions`
- `permission_id` - Foreign key to permissions
- `role_id` - Foreign key to roles

## Troubleshooting

### Common Issues

#### Permission Not Working

1. Check if user has the role:
```php
$user->hasRole('kpa') // Should return true
```

2. Check if role has the permission:
```php
$role = Role::findByName('kpa');
$role->hasPermissionTo('approve requests') // Should return true
```

3. Clear cache:
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

#### Cache Issues

1. Clear permission cache:
```php
$permissionService = app(PermissionService::class);
$permissionService->invalidateAllCaches();
```

2. Warm up cache:
```php
$permissionService->warmUpUserCache($user);
```

#### Performance Issues

1. Check for N+1 queries:
```bash
php artisan tinker
DB::enableQueryLog();
// Run your code
dd(DB::getQueryLog());
```

2. Use eager loading:
```php
Role::withCount('users')->get();
```

## Best Practices Summary

1. **Always use PermissionService** for permission checks to leverage caching
2. **Invalidate cache** when roles or permissions change
3. **Use eager loading** to avoid N+1 queries
4. **Test authorization** at multiple levels (middleware, controller, policies)
5. **Validate input** to prevent security vulnerabilities
6. **Use Form Requests** for validation
7. **Log unauthorized access attempts** for security monitoring
8. **Keep super_admin role exclusive** from other roles
9. **Use descriptive permission names** following the `{action} {resource}` pattern
10. **Write comprehensive tests** for all authorization scenarios

## Additional Resources

- [Laravel Authorization](https://laravel.com/docs/authorization)
- [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission/v6/introduction)
- [Laravel Caching](https://laravel.com/docs/cache)
- [Laravel Security](https://laravel.com/docs/security)
