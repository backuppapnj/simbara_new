<?php

use App\Models\Asset;
use App\Models\User;
use Illuminate\Support\Permission;

beforeEach(function () {
    Permission::clearCachedPermissions();
});

it('allows users with assets.view permission to view assets', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('assets.view');

    $asset = Asset::factory()->create();

    expect($user->can('view', $asset))->toBeTrue();
});

it('denies users without assets.view permission to view assets', function () {
    $user = User::factory()->create();

    $asset = Asset::factory()->create();

    expect($user->can('view', $asset))->toBeFalse();
});

it('allows users with assets.create permission to create assets', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('assets.create');

    expect($user->can('create', Asset::class))->toBeTrue();
});

it('denies users without assets.create permission to create assets', function () {
    $user = User::factory()->create();

    expect($user->can('create', Asset::class))->toBeFalse();
});

it('allows users with assets.edit permission to update assets', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('assets.edit');

    $asset = Asset::factory()->create();

    expect($user->can('update', $asset))->toBeTrue();
});

it('denies users without assets.edit permission to update assets', function () {
    $user = User::factory()->create();

    $asset = Asset::factory()->create();

    expect($user->can('update', $asset))->toBeFalse();
});

it('allows users with assets.delete permission to delete assets', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('assets.delete');

    $asset = Asset::factory()->create();

    expect($user->can('delete', $asset))->toBeTrue();
});

it('denies users without assets.delete permission to delete assets', function () {
    $user = User::factory()->create();

    $asset = Asset::factory()->create();

    expect($user->can('delete', $asset))->toBeFalse();
});

it('allows users with assets.photos permission to manage photos', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('assets.photos');

    $asset = Asset::factory()->create();

    expect($user->can('managePhotos', $asset))->toBeTrue();
});

it('denies users without assets.photos permission to manage photos', function () {
    $user = User::factory()->create();

    $asset = Asset::factory()->create();

    expect($user->can('managePhotos', $asset))->toBeFalse();
});
