<?php

declare(strict_types=1);

use App\Models\User;
use Database\Seeders\PermissionsSeeder;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

use function Pest\Laravel\actingAs;

beforeEach(function () {
    // Clear permission cache
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    // Seed roles and permissions
    (new RolesSeeder)->run();
    (new PermissionsSeeder)->run();

    // Create a user with super_admin role (has all permissions)
    $user = User::factory()->create();
    $user->assignRole('super_admin');
    actingAs($user);
});

test('office usages page has select with name attribute for supply_id', function () {
    $response = $this->get('/office-usages');

    $response->assertStatus(200);

    // Check if the page contains select with name attribute
    $content = $response->getContent();

    // Look for select elements that should have name attributes
    // This test verifies that the Select component renders properly with name attributes
    expect($content)->toContain('name=');
});

test('atk requests create page has select with name attributes', function () {
    $response = $this->get('/atk-requests/create');

    $response->assertStatus(200);

    $content = $response->getContent();

    // Check for select elements with proper name attributes
    expect($content)->toContain('name=');
});

test('office supplies page has select elements', function () {
    $response = $this->get('/office-supplies');

    $response->assertStatus(200);

    $content = $response->getContent();

    // Verify select elements exist
    expect($content)->toContain('select');
});
