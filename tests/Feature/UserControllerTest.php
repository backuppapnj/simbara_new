<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    // Seed roles before each test
    Artisan::call('db:seed', ['--class' => 'RoleSeeder']);
});

describe('UserController Index', function () {
    it('returns paginated users list for super_admin', function () {
        $admin = User::whereHas('roles', function ($q) {
            $q->where('name', 'super_admin');
        })->first();

        $response = actingAs($admin)
            ->get('/admin/users')
            ->assertStatus(200);

        // Check if it returns Inertia response
        expect($response->viewData('page'))->toBeObject();
    });

    it('filters users by search term', function () {
        $admin = User::whereHas('roles', function ($q) {
            $q->where('name', 'super_admin');
        })->first();

        // Create test users
        User::factory()->create(['name' => 'John Doe']);
        User::factory()->create(['name' => 'Jane Smith']);

        $response = actingAs($admin)
            ->get('/admin/users?search=John')
            ->assertStatus(200);
    });

    it('filters users by role', function () {
        $admin = User::whereHas('roles', function ($q) {
            $q->where('name', 'super_admin');
        })->first();

        $response = actingAs($admin)
            ->get('/admin/users?role=pegawai')
            ->assertStatus(200);
    });

    it('filters users by status', function () {
        $admin = User::whereHas('roles', function ($q) {
            $q->where('name', 'super_admin');
        })->first();

        $response = actingAs($admin)
            ->get('/admin/users?is_active=1')
            ->assertStatus(200);
    });

    it('returns 403 for non-admin users', function () {
        $user = User::factory()->create();
        $user->assignRole('pegawai');

        actingAs($user)
            ->get('/admin/users')
            ->assertStatus(403);
    });
});

describe('UserController Show', function () {
    it('displays user details for super_admin', function () {
        $admin = User::whereHas('roles', function ($q) {
            $q->where('name', 'super_admin');
        })->first();

        $user = User::factory()->create();

        $response = actingAs($admin)
            ->get("/admin/users/{$user->id}")
            ->assertStatus(200);
    });

    it('returns 404 for non-existent user', function () {
        $admin = User::whereHas('roles', function ($q) {
            $q->where('name', 'super_admin');
        })->first();

        actingAs($admin)
            ->get('/admin/users/999999')
            ->assertStatus(404);
    });

    it('returns 403 for non-admin users', function () {
        $user = User::factory()->create();
        $user->assignRole('pegawai');

        $targetUser = User::factory()->create();

        actingAs($user)
            ->get("/admin/users/{$targetUser->id}")
            ->assertStatus(403);
    });
});

describe('UserController Store', function () {
    it('creates a new user for super_admin', function () {
        $admin = User::whereHas('roles', function ($q) {
            $q->where('name', 'super_admin');
        })->first();

        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '+62812345678',
            'nip' => '12345',
            'position' => 'Staff',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'roles' => ['pegawai'],
            'is_active' => true,
        ];

        actingAs($admin)
            ->post('/admin/users', $userData)
            ->assertStatus(302);

        assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User',
        ]);
    });

    it('validates required fields', function () {
        $admin = User::whereHas('roles', function ($q) {
            $q->where('name', 'super_admin');
        })->first();

        actingAs($admin)
            ->post('/admin/users', [])
            ->assertStatus(302)
            ->assertSessionHasErrors();
    });

    it('returns 403 for non-admin users', function () {
        $user = User::factory()->create();
        $user->assignRole('pegawai');

        actingAs($user)
            ->post('/admin/users', [])
            ->assertStatus(403);
    });
});

describe('UserController Update', function () {
    it('updates user for super_admin', function () {
        $admin = User::whereHas('roles', function ($q) {
            $q->where('name', 'super_admin');
        })->first();

        $user = User::factory()->create(['name' => 'Old Name']);

        $updateData = [
            'name' => 'New Name',
            'email' => $user->email,
            'roles' => ['pegawai'],
        ];

        actingAs($admin)
            ->put("/admin/users/{$user->id}", $updateData)
            ->assertStatus(302);

        expect($user->fresh()->name)->toBe('New Name');
    });

    it('returns 403 for non-admin users', function () {
        $user = User::factory()->create();
        $user->assignRole('pegawai');

        $targetUser = User::factory()->create();

        actingAs($user)
            ->put("/admin/users/{$targetUser->id}", [])
            ->assertStatus(403);
    });
});

describe('UserController Destroy', function () {
    it('soft deletes user for super_admin', function () {
        $admin = User::whereHas('roles', function ($q) {
            $q->where('name', 'super_admin');
        })->first();

        $user = User::factory()->create();

        actingAs($admin)
            ->delete("/admin/users/{$user->id}")
            ->assertStatus(302);

        expect($user->fresh()->deleted_at)->not->toBeNull();
    });

    it('returns 403 for non-admin users', function () {
        $user = User::factory()->create();
        $user->assignRole('pegawai');

        $targetUser = User::factory()->create();

        actingAs($user)
            ->delete("/admin/users/{$targetUser->id}")
            ->assertStatus(403);
    });
});

describe('UserController Restore', function () {
    it('restores deleted user for super_admin', function () {
        $admin = User::whereHas('roles', function ($q) {
            $q->where('name', 'super_admin');
        })->first();

        $user = User::factory()->create();
        $user->delete();

        actingAs($admin)
            ->post("/admin/users/{$user->id}/restore")
            ->assertStatus(302);

        expect($user->fresh()->deleted_at)->toBeNull();
    });

    it('returns 403 for non-admin users', function () {
        $user = User::factory()->create();
        $user->assignRole('pegawai');

        $targetUser = User::factory()->create();
        $targetUser->delete();

        actingAs($user)
            ->post("/admin/users/{$targetUser->id}/restore")
            ->assertStatus(403);
    });
});
