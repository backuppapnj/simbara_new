<?php

use Database\Seeders\PermissionsSeeder;
use Database\Seeders\RolesSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses()->group('permissions');

beforeEach(function () {
    // Clear permission cache
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    // Seed roles and permissions
    $rolesSeeder = new RolesSeeder;
    $rolesSeeder->run();

    $permissionsSeeder = new PermissionsSeeder;
    $permissionsSeeder->run();
});

it('kpa role has atk.requests.distribute permission', function () {
    $kpaRole = Role::where('name', 'kpa')->first();

    expect($kpaRole)->not->toBeNull()
        ->and($kpaRole->hasPermissionTo('atk.requests.distribute'))->toBeTrue();
});

it('operator_persediaan role has atk.requests.distribute permission', function () {
    $operatorRole = Role::where('name', 'operator_persediaan')->first();

    expect($operatorRole)->not->toBeNull()
        ->and($operatorRole->hasPermissionTo('atk.requests.distribute'))->toBeTrue();
});

it('kpa role has atk.requests.approve permission', function () {
    $kpaRole = Role::where('name', 'kpa')->first();

    expect($kpaRole)->not->toBeNull()
        ->and($kpaRole->hasPermissionTo('atk.requests.approve'))->toBeTrue();
});
