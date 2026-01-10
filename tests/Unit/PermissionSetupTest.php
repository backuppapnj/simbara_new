<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Traits\HasRoles;

it('has spatie laravel permission package installed', function () {
    $composerLockPath = dirname(__DIR__, 2).'/composer.lock';
    $composerLock = json_decode(file_get_contents($composerLockPath), true);
    $packages = collect($composerLock['packages'] ?? []);

    expect($packages->where('name', 'spatie/laravel-permission')->isNotEmpty())->toBeTrue();
});

it('user model can use HasRoles trait', function () {
    $uses = class_uses(User::class);

    expect(in_array(HasRoles::class, $uses))->toBeTrue();
});

it('user model has role relationship methods', function () {
    expect(method_exists(User::class, 'roles'))->toBeTrue();
    expect(method_exists(User::class, 'assignRole'))->toBeTrue();
    expect(method_exists(User::class, 'removeRole'))->toBeTrue();
    expect(method_exists(User::class, 'hasRole'))->toBeTrue();
    expect(method_exists(User::class, 'hasAnyRole'))->toBeTrue();
    expect(method_exists(User::class, 'hasAllRoles'))->toBeTrue();
});

it('permission facade is accessible', function () {
    $permissionClass = Permission::class;

    expect(class_exists($permissionClass))->toBeTrue();
});

it('role model is accessible', function () {
    $roleClass = Role::class;

    expect(class_exists($roleClass))->toBeTrue();
});
