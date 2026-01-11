<?php

use App\Models\AtkRequest;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    // Create required permissions
    $permissions = [
        'atk.view',
        'atk.create',
        'atk.edit',
        'atk.delete',
        'atk.requests.approve',
        'atk.requests.distribute',
        'atk.reports',
    ];

    foreach ($permissions as $permission) {
        Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
    }
});

it('allows users with atk.view permission to view atk requests', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('atk.view');

    $atkRequest = AtkRequest::factory()->create();

    expect($user->can('view', $atkRequest))->toBeTrue();
});

it('allows users to view their own atk requests', function () {
    $user = User::factory()->create();

    $atkRequest = AtkRequest::factory()->create(['user_id' => $user->id]);

    expect($user->can('view', $atkRequest))->toBeTrue();
});

it('denies users without atk.view permission to view others requests', function () {
    $user = User::factory()->create();

    $atkRequest = AtkRequest::factory()->create();

    expect($user->can('view', $atkRequest))->toBeFalse();
});

it('allows users with atk.create permission to create atk requests', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('atk.create');

    expect($user->can('create', AtkRequest::class))->toBeTrue();
});

it('denies users without atk.create permission to create atk requests', function () {
    $user = User::factory()->create();

    expect($user->can('create', AtkRequest::class))->toBeFalse();
});

it('allows users with atk.requests.approve permission to approve requests', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('atk.requests.approve');

    $atkRequest = AtkRequest::factory()->create();

    expect($user->can('approve', $atkRequest))->toBeTrue();
});

it('denies users without atk.requests.approve permission to approve requests', function () {
    $user = User::factory()->create();

    $atkRequest = AtkRequest::factory()->create();

    expect($user->can('approve', $atkRequest))->toBeFalse();
});

it('allows users with atk.requests.distribute permission to distribute requests', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('atk.requests.distribute');

    $atkRequest = AtkRequest::factory()->create();

    expect($user->can('distribute', $atkRequest))->toBeTrue();
});

it('denies users without atk.requests.distribute permission to distribute requests', function () {
    $user = User::factory()->create();

    $atkRequest = AtkRequest::factory()->create();

    expect($user->can('distribute', $atkRequest))->toBeFalse();
});

it('allows requesters to confirm receipt', function () {
    $user = User::factory()->create();

    $atkRequest = AtkRequest::factory()->create(['user_id' => $user->id]);

    expect($user->can('confirmReceive', $atkRequest))->toBeTrue();
});

it('denies non-requesters to confirm receipt', function () {
    $user = User::factory()->create();

    $atkRequest = AtkRequest::factory()->create();

    expect($user->can('confirmReceive', $atkRequest))->toBeFalse();
});
