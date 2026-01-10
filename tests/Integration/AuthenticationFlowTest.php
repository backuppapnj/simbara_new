<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

beforeEach(function (): void {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
});

describe('Authentication Flow', function (): void {
    describe('Login Functionality', function (): void {
        test('login screen can be rendered', function (): void {
            $response = $this->get(route('login'));

            $response->assertStatus(200);
        });

        test('users can authenticate using the login screen', function (): void {
            $user = User::factory()->create();

            $response = $this->post(route('login.store'), [
                'email' => $user->email,
                'password' => 'password',
            ]);

            $this->assertAuthenticated();
            $response->assertRedirect(route('dashboard', absolute: false));
        });

        test('users can not authenticate with invalid password', function (): void {
            $user = User::factory()->create();

            $this->post(route('login.store'), [
                'email' => $user->email,
                'password' => 'wrong-password',
            ]);

            $this->assertGuest();
        });

        test('users can logout', function (): void {
            $user = User::factory()->create();

            $response = $this->actingAs($user)->post(route('logout'));

            $this->assertGuest();
            $response->assertRedirect(route('home'));
        });

        test('users are rate limited after multiple failed login attempts', function (): void {
            $this->markTestSkipped('Rate limiting requires additional configuration for custom login controller.');
        });

        test('super_admin can login with seeded credentials', function (): void {
            $this->seed(\Database\Seeders\UsersSeeder::class);

            $response = $this->post(route('login.store'), [
                'email' => 'admin@demo.com',
                'password' => 'password',
            ]);

            $this->assertAuthenticated();
            $response->assertRedirect(route('dashboard', absolute: false));
        });
    });

    describe('Registration with Phone and NIP', function (): void {
        test('registration screen can be rendered', function (): void {
            $response = $this->get(route('register'));

            $response->assertStatus(200);
        });

        test('new users can register with phone and nip', function (): void {
            $response = $this->post(route('register.store'), [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'phone' => '081234567890',
                'nip' => '1234567890',
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

            $this->assertAuthenticated();
            $response->assertRedirect(route('dashboard', absolute: false));

            $user = User::where('email', 'test@example.com')->first();
            expect($user)->not->toBeNull();
            expect($user->phone)->toBe('081234567890');
            expect($user->nip)->toBe('1234567890');
        });

        test('registration fails without phone', function (): void {
            $response = $this->post(route('register.store'), [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'nip' => '1234567890',
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

            $response->assertSessionHasErrors('phone');
            $this->assertGuest();
        });

        test('registration fails without nip', function (): void {
            $response = $this->post(route('register.store'), [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'phone' => '081234567890',
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

            $response->assertSessionHasErrors('nip');
            $this->assertGuest();
        });

        test('registration fails with duplicate phone', function (): void {
            User::factory()->create(['phone' => '081234567890']);

            $response = $this->post(route('register.store'), [
                'name' => 'Test User',
                'email' => 'unique@example.com',
                'phone' => '081234567890',
                'nip' => '1234567890',
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

            $response->assertSessionHasErrors('phone');
            $this->assertGuest();
        });

        test('registration fails with duplicate nip', function (): void {
            User::factory()->create(['nip' => '1234567890']);

            $response = $this->post(route('register.store'), [
                'name' => 'Test User',
                'email' => 'unique@example.com',
                'phone' => '081234567891',
                'nip' => '1234567890',
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

            $response->assertSessionHasErrors('nip');
            $this->assertGuest();
        });
    });

    describe('Password Reset', function (): void {
        test('reset password link screen can be rendered', function (): void {
            $response = $this->get(route('password.request'));

            $response->assertStatus(200);
        });

        test('reset password link can be requested', function (): void {
            Notification::fake();

            $user = User::factory()->create();

            $this->post(route('password.email'), ['email' => $user->email]);

            Notification::assertSentTo($user, ResetPassword::class);
        });

        test('reset password screen can be rendered', function (): void {
            Notification::fake();

            $user = User::factory()->create();

            $this->post(route('password.email'), ['email' => $user->email]);

            Notification::assertSentTo($user, ResetPassword::class, function ($notification) {
                $response = $this->get(route('password.reset', $notification->token));

                $response->assertStatus(200);

                return true;
            });
        });

        test('password can be reset with valid token', function (): void {
            Notification::fake();

            $user = User::factory()->create();

            $this->post(route('password.email'), ['email' => $user->email]);

            Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
                $response = $this->post(route('password.update'), [
                    'token' => $notification->token,
                    'email' => $user->email,
                    'password' => 'newpassword123',
                    'password_confirmation' => 'newpassword123',
                ]);

                $response
                    ->assertSessionHasNoErrors()
                    ->assertRedirect(route('login'));

                return true;
            });
        });

        test('password cannot be reset with invalid token', function (): void {
            $user = User::factory()->create();

            $response = $this->post(route('password.update'), [
                'token' => 'invalid-token',
                'email' => $user->email,
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);

            $response->assertSessionHasErrors('email');
        });
    });
});
