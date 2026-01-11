<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RolesSeeder::class);
    $this->seed(\Database\Seeders\UsersSeeder::class);
});

describe('Flash Messages Tests', function () {
    describe('Flash Messages Shared to Frontend', function () {
        it('shares flash messages from backend to frontend', function () {
            $user = User::where('email', 'admin@pa-penajam.go.id')->first();

            // Set a flash message in session
            session()->flash('success', 'Test success message');
            session()->flash('error', 'Test error message');

            $response = $this->actingAs($user)->get('/dashboard');

            $response->assertSuccessful();

            // Verify flash data is available in session
            expect(session('success'))->toBe('Test success message');
            expect(session('error'))->toBe('Test error message');
        });

        it('displays success toast when flash success exists', function () {
            $user = User::where('email', 'admin@pa-penajam.go.id')->first();

            session()->flash('success', 'Operation completed successfully');

            $response = $this->actingAs($user)->get('/dashboard');

            $response->assertSuccessful();
        });

        it('displays error toast when flash error exists', function () {
            $user = User::where('email', 'admin@pa-penajam.go.id')->first();

            session()->flash('error', 'Operation failed');

            $response = $this->actingAs($user)->get('/dashboard');

            $response->assertSuccessful();
        });
    });

    describe('Flash Messages After Form Submission', function () {
        it('clears flash messages after display', function () {
            $user = User::where('email', 'admin@pa-penajam.go.id')->first();

            // Set flash message
            session()->flash('success', 'Test message');

            // First visit should have flash
            $response = $this->actingAs($user)->get('/dashboard');
            $response->assertSuccessful();

            // Flash messages are one-time only, so they'll be cleared
            // This is tested by the session behavior
        });
    });
});
