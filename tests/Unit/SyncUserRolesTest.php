<?php

use App\Actions\SyncUserRoles;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Begin a transaction for each test to ensure isolation
    DB::beginTransaction();
});

afterEach(function () {
    // Rollback the transaction after each test
    DB::rollBack();
});

it('assigns super_admin role exclusively when it is in the role list', function () {
    // Arrange: Create roles and user
    $superAdminRole = Role::create(['name' => 'super_admin']);
    $adminRole = Role::create(['name' => 'admin']);
    $userRole = Role::create(['name' => 'user']);

    $user = User::factory()->create();

    // Act: Sync roles including super_admin
    $action = new SyncUserRoles;
    $action->handle($user, [$superAdminRole->id, $adminRole->id, $userRole->id]);

    // Assert: User should only have super_admin role
    expect($user->hasRole('super_admin'))->toBeTrue();
    expect($user->hasRole('admin'))->toBeFalse();
    expect($user->hasRole('user'))->toBeFalse();
    expect($user->roles()->count())->toBe(1);
});

it('replaces existing roles with super_admin when super_admin is assigned', function () {
    // Arrange: Create roles and user with existing roles
    $superAdminRole = Role::create(['name' => 'super_admin']);
    $adminRole = Role::create(['name' => 'admin']);
    $userRole = Role::create(['name' => 'user']);

    $user = User::factory()->create();
    $user->assignRole(['admin', 'user']);

    expect($user->roles()->count())->toBe(2);

    // Act: Sync roles including super_admin
    $action = new SyncUserRoles;
    $action->handle($user, [$superAdminRole->id, $adminRole->id]);

    // Assert: User should only have super_admin role
    expect($user->hasRole('super_admin'))->toBeTrue();
    expect($user->hasRole('admin'))->toBeFalse();
    expect($user->hasRole('user'))->toBeFalse();
    expect($user->roles()->count())->toBe(1);
});

it('removes super_admin role when it is not in the role list', function () {
    // Arrange: Create roles and user with super_admin
    $superAdminRole = Role::create(['name' => 'super_admin']);
    $adminRole = Role::create(['name' => 'admin']);
    $userRole = Role::create(['name' => 'user']);

    $user = User::factory()->create();
    $user->assignRole('super_admin');

    expect($user->hasRole('super_admin'))->toBeTrue();

    // Act: Sync roles without super_admin
    $action = new SyncUserRoles;
    $action->handle($user, [$adminRole->id, $userRole->id]);

    // Assert: User should have admin and user roles, but not super_admin
    expect($user->hasRole('super_admin'))->toBeFalse();
    expect($user->hasRole('admin'))->toBeTrue();
    expect($user->hasRole('user'))->toBeTrue();
    expect($user->roles()->count())->toBe(2);
});

it('syncs multiple roles normally when super_admin is not involved', function () {
    // Arrange: Create roles and user
    $adminRole = Role::create(['name' => 'admin']);
    $userRole = Role::create(['name' => 'user']);
    $editorRole = Role::create(['name' => 'editor']);

    $user = User::factory()->create();

    // Act: Sync roles without super_admin
    $action = new SyncUserRoles;
    $action->handle($user, [$adminRole->id, $userRole->id]);

    // Assert: User should have both roles
    expect($user->hasRole('admin'))->toBeTrue();
    expect($user->hasRole('user'))->toBeTrue();
    expect($user->roles()->count())->toBe(2);

    // Act: Sync to different roles
    $action->handle($user, [$editorRole->id]);

    // Assert: User should only have editor role
    expect($user->hasRole('admin'))->toBeFalse();
    expect($user->hasRole('user'))->toBeFalse();
    expect($user->hasRole('editor'))->toBeTrue();
    expect($user->roles()->count())->toBe(1);
});

it('removes all roles when empty array is provided', function () {
    // Arrange: Create roles and user with existing roles
    $adminRole = Role::create(['name' => 'admin']);
    $userRole = Role::create(['name' => 'user']);

    $user = User::factory()->create();
    $user->assignRole(['admin', 'user']);

    expect($user->roles()->count())->toBe(2);

    // Act: Sync with empty array
    $action = new SyncUserRoles;
    $action->handle($user, []);

    // Assert: User should have no roles
    expect($user->roles()->count())->toBe(0);
    expect($user->hasRole('admin'))->toBeFalse();
    expect($user->hasRole('user'))->toBeFalse();
});

it('handles user with super_admin being changed to regular roles', function () {
    // Arrange: Create roles and user with super_admin
    $superAdminRole = Role::create(['name' => 'super_admin']);
    $adminRole = Role::create(['name' => 'admin']);
    $userRole = Role::create(['name' => 'user']);

    $user = User::factory()->create();
    $user->assignRole('super_admin');

    expect($user->hasRole('super_admin'))->toBeTrue();
    expect($user->roles()->count())->toBe(1);

    // Act: Sync to regular roles (removing super_admin)
    $action = new SyncUserRoles;
    $action->handle($user, [$adminRole->id, $userRole->id]);

    // Assert: User should no longer have super_admin but have the new roles
    expect($user->hasRole('super_admin'))->toBeFalse();
    expect($user->hasRole('admin'))->toBeTrue();
    expect($user->hasRole('user'))->toBeTrue();
    expect($user->roles()->count())->toBe(2);
});
