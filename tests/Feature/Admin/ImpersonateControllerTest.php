<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles and permissions before each test
    $this->seed(\Database\Seeders\RolesSeeder::class);
    $this->seed(\Database\Seeders\PermissionsSeeder::class);
});

describe('ImpersonateController - Start Impersonation', function () {
    describe('Authentication', function () {
        it('requires authentication', function () {
            $targetUser = User::factory()->create();

            $response = $this->post(route('admin.users.impersonate', $targetUser));

            $response->assertRedirect(route('login'));
        });
    });

    describe('Authorization', function () {
        it('allows super admin to impersonate users', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $targetUser = User::factory()->create();

            $response = $this->actingAs($superAdmin)
                ->post(route('admin.users.impersonate', $targetUser));

            $response->assertRedirect('/');
        });

        it('forbids non super admin from impersonating users', function () {
            $regularUser = User::factory()->create();
            $regularUser->assignRole('pegawai');

            $targetUser = User::factory()->create();

            $response = $this->actingAs($regularUser)
                ->post(route('admin.users.impersonate', $targetUser));

            $response->assertForbidden();
        });

        it('forbids users without users.impersonate permission', function () {
            $user = User::factory()->create();
            $user->assignRole('kpa');

            $targetUser = User::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('admin.users.impersonate', $targetUser));

            $response->assertForbidden();
        });
    });

    describe('Functionality', function () {
        it('stores original admin id in session', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $targetUser = User::factory()->create();

            $this->actingAs($superAdmin)
                ->post(route('admin.users.impersonate', $targetUser));

            expect(Session::get('impersonate_admin_id'))->toBe($superAdmin->id);
        });

        it('logs in as target user', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $targetUser = User::factory()->create(['name' => 'Target User']);

            $this->actingAs($superAdmin)
                ->post(route('admin.users.impersonate', $targetUser));

            expect(Auth::check())->toBeTrue();
            expect(Auth::id())->toBe($targetUser->id);
            expect(Auth::user()->name)->toBe('Target User');
        });

        it('stores target user id in session', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $targetUser = User::factory()->create();

            $this->actingAs($superAdmin)
                ->post(route('admin.users.impersonate', $targetUser));

            expect(Session::get('impersonate_target_user_id'))->toBe($targetUser->id);
        });

        it('prevents super admin from impersonating themselves', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $response = $this->actingAs($superAdmin)
                ->post(route('admin.users.impersonate', $superAdmin));

            $response->assertStatus(403);
        });

        it('prevents super admin from impersonating other super admins', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $otherSuperAdmin = User::factory()->create();
            $otherSuperAdmin->assignRole('super_admin');

            $response = $this->actingAs($superAdmin)
                ->post(route('admin.users.impersonate', $otherSuperAdmin));

            $response->assertStatus(403);
        });

        it('prevents double impersonation', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $user1 = User::factory()->create();
            $user2 = User::factory()->create();

            // Start first impersonation
            $this->actingAs($superAdmin)
                ->post(route('admin.users.impersonate', $user1));

            // Try to impersonate another user while already impersonating
            $response = $this->actingAs($user1)
                ->withSession(['impersonate_admin_id' => $superAdmin->id])
                ->post(route('admin.users.impersonate', $user2));

            $response->assertStatus(403);
        });
    });
});

describe('ImpersonateController - Stop Impersonation', function () {
    describe('Authentication', function () {
        it('requires authentication', function () {
            $response = $this->get(route('admin.users.stop-impersonate'));

            $response->assertRedirect(route('login'));
        });
    });

    describe('Authorization', function () {
        it('allows impersonating admin to stop impersonation', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $targetUser = User::factory()->create();

            // Start impersonation
            Session::put('impersonate_admin_id', $superAdmin->id);
            Session::put('impersonate_target_user_id', $targetUser->id);

            $response = $this->actingAs($targetUser)
                ->get(route('admin.users.stop-impersonate'));

            $response->assertRedirect('/admin/users');
        });

        it('returns error when not impersonating', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $response = $this->actingAs($superAdmin)
                ->get(route('admin.users.stop-impersonate'));

            $response->assertRedirect('/admin/users');
            $response->assertSessionHas('error');
        });
    });

    describe('Functionality', function () {
        it('restores original admin session', function () {
            $superAdmin = User::factory()->create(['name' => 'Super Admin']);
            $superAdmin->assignRole('super_admin');

            $targetUser = User::factory()->create(['name' => 'Target User']);

            // Start impersonation
            Session::put('impersonate_admin_id', $superAdmin->id);
            Session::put('impersonate_target_user_id', $targetUser->id);

            // Stop impersonation
            $this->actingAs($targetUser)
                ->get(route('admin.users.stop-impersonate'));

            expect(Auth::check())->toBeTrue();
            expect(Auth::id())->toBe($superAdmin->id);
            expect(Auth::user()->name)->toBe('Super Admin');
        });

        it('clears impersonate session data', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $targetUser = User::factory()->create();

            // Start impersonation
            Session::put('impersonate_admin_id', $superAdmin->id);
            Session::put('impersonate_target_user_id', $targetUser->id);

            expect(Session::has('impersonate_admin_id'))->toBeTrue();
            expect(Session::has('impersonate_target_user_id'))->toBeTrue();

            // Stop impersonation
            $this->actingAs($targetUser)
                ->get(route('admin.users.stop-impersonate'));

            expect(Session::has('impersonate_admin_id'))->toBeFalse();
            expect(Session::has('impersonate_target_user_id'))->toBeFalse();
        });

        it('redirects to admin users page after stopping', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $targetUser = User::factory()->create();

            // Start impersonation
            Session::put('impersonate_admin_id', $superAdmin->id);
            Session::put('impersonate_target_user_id', $targetUser->id);

            // Stop impersonation
            $response = $this->actingAs($targetUser)
                ->get(route('admin.users.stop-impersonate'));

            $response->assertRedirect('/admin/users');
        });
    });
});
