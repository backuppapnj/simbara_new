<?php

use Database\Seeders\PermissionsSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\artisan;

beforeEach(function () {
    Permission::query()->delete();
    Role::query()->delete();
});

afterEach(function () {
    Permission::query()->delete();
    Role::query()->delete();
});

it('can instantiate PermissionsSeeder', function () {
    $seeder = new PermissionsSeeder;

    expect($seeder)->toBeInstanceOf(PermissionsSeeder::class);
});

it('creates all asset permissions', function () {
    artisan('db:seed', ['--class' => PermissionsSeeder::class])->run();

    $permissions = [
        'view-aset',
        'create-aset',
        'edit-aset',
        'delete-aset',
    ];

    foreach ($permissions as $permissionName) {
        expect(Permission::where('name', $permissionName)->exists())->toBeTrue();
    }
});

it('creates all ATK permissions', function () {
    artisan('db:seed', ['--class' => PermissionsSeeder::class])->run();

    $permissions = [
        'view-atk',
        'create-atk',
        'edit-atk',
        'delete-atk',
    ];

    foreach ($permissions as $permissionName) {
        expect(Permission::where('name', $permissionName)->exists())->toBeTrue();
    }
});

it('creates all office supplies permissions', function () {
    artisan('db:seed', ['--class' => PermissionsSeeder::class])->run();

    $permissions = [
        'view-bahan',
        'create-bahan',
        'edit-bahan',
        'delete-bahan',
    ];

    foreach ($permissions as $permissionName) {
        expect(Permission::where('name', $permissionName)->exists())->toBeTrue();
    }
});

it('creates reports permission', function () {
    artisan('db:seed', ['--class' => PermissionsSeeder::class])->run();

    expect(Permission::where('name', 'view-reports')->exists())->toBeTrue();
});

it('creates approval permissions', function () {
    artisan('db:seed', ['--class' => PermissionsSeeder::class])->run();

    $permissions = [
        'approval-l1',
        'approval-l2',
        'approval-l3',
    ];

    foreach ($permissions as $permissionName) {
        expect(Permission::where('name', $permissionName)->exists())->toBeTrue();
    }
});

it('assigns all permissions to super_admin role', function () {
    artisan('db:seed', ['--class' => PermissionsSeeder::class])->run();

    $superAdmin = Role::where('name', 'super_admin')->firstOrFail();
    $allPermissions = Permission::all();

    expect($superAdmin->hasAllPermissions($allPermissions))->toBeTrue();
});

it('assigns correct permissions to kpa role', function () {
    artisan('db:seed', ['--class' => PermissionsSeeder::class])->run();

    $kpa = Role::where('name', 'kpa')->firstOrFail();

    expect($kpa->hasPermissionTo('view-reports'))->toBeTrue();
    expect($kpa->hasPermissionTo('approval-l3'))->toBeTrue();
    expect($kpa->hasPermissionTo('view-aset'))->toBeTrue();
    expect($kpa->hasPermissionTo('view-atk'))->toBeTrue();
    expect($kpa->hasPermissionTo('view-bahan'))->toBeTrue();
    expect($kpa->hasPermissionTo('create-aset'))->toBeFalse();
    expect($kpa->hasPermissionTo('approval-l1'))->toBeFalse();
});

it('assigns correct permissions to kasubag_umum role', function () {
    artisan('db:seed', ['--class' => PermissionsSeeder::class])->run();

    $kasubag = Role::where('name', 'kasubag_umum')->firstOrFail();

    expect($kasubag->hasPermissionTo('view-aset'))->toBeTrue();
    expect($kasubag->hasPermissionTo('create-aset'))->toBeTrue();
    expect($kasubag->hasPermissionTo('edit-aset'))->toBeTrue();
    expect($kasubag->hasPermissionTo('delete-aset'))->toBeTrue();
    expect($kasubag->hasPermissionTo('view-reports'))->toBeTrue();
    expect($kasubag->hasPermissionTo('approval-l2'))->toBeTrue();
    expect($kasubag->hasPermissionTo('approval-l3'))->toBeFalse();
});

it('assigns correct permissions to operator_bmn role', function () {
    artisan('db:seed', ['--class' => PermissionsSeeder::class])->run();

    $operatorBmn = Role::where('name', 'operator_bmn')->firstOrFail();

    expect($operatorBmn->hasPermissionTo('view-aset'))->toBeTrue();
    expect($operatorBmn->hasPermissionTo('create-aset'))->toBeTrue();
    expect($operatorBmn->hasPermissionTo('edit-aset'))->toBeTrue();
    expect($operatorBmn->hasPermissionTo('delete-aset'))->toBeTrue();
    expect($operatorBmn->hasPermissionTo('view-atk'))->toBeFalse();
    expect($operatorBmn->hasPermissionTo('approval-l1'))->toBeFalse();
});

it('assigns correct permissions to operator_persediaan role', function () {
    artisan('db:seed', ['--class' => PermissionsSeeder::class])->run();

    $operatorAtk = Role::where('name', 'operator_persediaan')->firstOrFail();

    expect($operatorAtk->hasPermissionTo('view-atk'))->toBeTrue();
    expect($operatorAtk->hasPermissionTo('create-atk'))->toBeTrue();
    expect($operatorAtk->hasPermissionTo('edit-atk'))->toBeTrue();
    expect($operatorAtk->hasPermissionTo('delete-atk'))->toBeTrue();
    expect($operatorAtk->hasPermissionTo('approval-l1'))->toBeTrue();
    expect($operatorAtk->hasPermissionTo('view-aset'))->toBeFalse();
});

it('assigns correct permissions to pegawai role', function () {
    artisan('db:seed', ['--class' => PermissionsSeeder::class])->run();

    $pegawai = Role::where('name', 'pegawai')->firstOrFail();

    expect($pegawai->hasPermissionTo('view-aset'))->toBeTrue();
    expect($pegawai->hasPermissionTo('view-atk'))->toBeTrue();
    expect($pegawai->hasPermissionTo('view-bahan'))->toBeTrue();
    expect($pegawai->hasPermissionTo('create-aset'))->toBeFalse();
    expect($pegawai->hasPermissionTo('edit-aset'))->toBeFalse();
    expect($pegawai->hasPermissionTo('delete-aset'))->toBeFalse();
});
