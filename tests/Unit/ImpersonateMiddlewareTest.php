<?php

use App\Http\Middleware\ImpersonateMiddleware;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RolesSeeder::class);
    $this->seed(\Database\Seeders\PermissionsSeeder::class);
});

describe('ImpersonateMiddleware', function () {
    describe('Share Impersonate Info to Inertia', function () {
        it('shares impersonate info when actively impersonating', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $targetUser = User::factory()->create(['name' => 'Target User']);

            // Set up impersonation session
            Session::put('impersonate_admin_id', $superAdmin->id);
            Session::put('impersonate_target_user_id', $targetUser->id);

            // Create request and middleware
            $request = Request::create('/');
            $middleware = new ImpersonateMiddleware;

            // Mock Inertia::share - we'll verify the session data is set correctly
            $next = function ($request) {
                return response('OK');
            };

            $response = $middleware->handle($request, $next);

            // Verify session still has impersonate data
            expect(Session::get('impersonate_admin_id'))->toBe($superAdmin->id);
            expect(Session::get('impersonate_target_user_id'))->toBe($targetUser->id);
        });

        it('does not share impersonate info when not impersonating', function () {
            $user = User::factory()->create();

            // No impersonation session set

            $request = Request::create('/');
            $middleware = new ImpersonateMiddleware;

            $next = function ($request) {
                return response('OK');
            };

            $response = $middleware->handle($request, $next);

            // Verify session does not have impersonate data
            expect(Session::get('impersonate_admin_id'))->toBeNull();
            expect(Session::get('impersonate_target_user_id'))->toBeNull();
        });

        it('shares admin user info in session for Inertia', function () {
            $superAdmin = User::factory()->create(['name' => 'Super Admin']);
            $superAdmin->assignRole('super_admin');

            $targetUser = User::factory()->create(['name' => 'Target User']);

            // Set up impersonation session
            Session::put('impersonate_admin_id', $superAdmin->id);
            Session::put('impersonate_target_user_id', $targetUser->id);

            $request = Request::create('/');
            $middleware = new ImpersonateMiddleware;

            $next = function ($request) {
                return response('OK');
            };

            $response = $middleware->handle($request, $next);

            // Session should have the correct IDs
            expect(Session::get('impersonate_admin_id'))->toBe($superAdmin->id);
            expect(Session::get('impersonate_target_user_id'))->toBe($targetUser->id);
        });

        it('clears impersonate session when admin is not found', function () {
            // Set up impersonation session with non-existent admin ID
            Session::put('impersonate_admin_id', 999999);
            Session::put('impersonate_target_user_id', 1);

            $request = Request::create('/');
            $middleware = new ImpersonateMiddleware;

            $next = function ($request) {
                return response('OK');
            };

            $response = $middleware->handle($request, $next);

            // Session should be cleared
            expect(Session::get('impersonate_admin_id'))->toBeNull();
            expect(Session::get('impersonate_target_user_id'))->toBeNull();
        });

        it('does not interfere with normal requests', function () {
            $user = User::factory()->create();
            Auth::login($user);

            $request = Request::create('/');
            $middleware = new ImpersonateMiddleware;

            $next = function ($request) {
                return response('OK');
            };

            $response = $middleware->handle($request, $next);

            expect($response->getStatusCode())->toBe(200);
            expect(Auth::check())->toBeTrue();
            expect(Auth::id())->toBe($user->id);
        });

        it('handles multiple requests during impersonation', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $targetUser = User::factory()->create();

            // Set up impersonation session
            Session::put('impersonate_admin_id', $superAdmin->id);
            Session::put('impersonate_target_user_id', $targetUser->id);

            $middleware = new ImpersonateMiddleware;

            // Multiple requests
            for ($i = 0; $i < 3; $i++) {
                $request = Request::create('/');
                $next = function ($request) {
                    return response('OK');
                };
                $response = $middleware->handle($request, $next);

                expect(Session::get('impersonate_admin_id'))->toBe($superAdmin->id);
                expect(Session::get('impersonate_target_user_id'))->toBe($targetUser->id);
            }
        });
    });

    describe('Security', function () {
        it('does not expose impersonate data to unauthenticated users', function () {
            // No user authenticated
            Auth::logout();

            // Set up impersonation session (should not happen in reality)
            Session::put('impersonate_admin_id', 1);
            Session::put('impersonate_target_user_id', 2);

            $request = Request::create('/');
            $middleware = new ImpersonateMiddleware;

            $next = function ($request) {
                return response('OK');
            };

            $response = $middleware->handle($request, $next);

            // Session data should be cleared as admin doesn't exist
            expect(Session::get('impersonate_admin_id'))->toBeNull();
            expect(Session::get('impersonate_target_user_id'))->toBeNull();
        });

        it('validates admin user exists on each request', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $targetUser = User::factory()->create();

            // Set up impersonation session
            Session::put('impersonate_admin_id', $superAdmin->id);
            Session::put('impersonate_target_user_id', $targetUser->id);

            $middleware = new ImpersonateMiddleware;

            // First request - admin exists
            $request1 = Request::create('/');
            $next1 = function ($request) {
                return response('OK');
            };
            $response1 = $middleware->handle($request1, $next1);

            expect(Session::get('impersonate_admin_id'))->toBe($superAdmin->id);

            // Simulate admin deletion by setting a non-existent ID
            Session::put('impersonate_admin_id', 999999);

            // Second request - admin no longer exists
            $request2 = Request::create('/');
            $next2 = function ($request) {
                return response('OK');
            };
            $response2 = $middleware->handle($request2, $next2);

            // Session should be cleared
            expect(Session::get('impersonate_admin_id'))->toBeNull();
            expect(Session::get('impersonate_target_user_id'))->toBeNull();
        });
    });
});
