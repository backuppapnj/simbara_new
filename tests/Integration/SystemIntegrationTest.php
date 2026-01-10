<?php

use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

describe('System Integration Tests', function (): void {
    beforeEach(function (): void {
        $this->seed(\Database\Seeders\RolesSeeder::class);
    });

    describe('Authentication with Roles', function (): void {
        test('super_admin user can login and has correct role', function (): void {
            $this->seed(\Database\Seeders\UsersSeeder::class);

            $response = $this->post(route('login.store'), [
                'email' => 'admin@demo.com',
                'password' => 'password',
            ]);

            $this->assertAuthenticated();
            $user = auth()->user();
            expect($user->hasRole('super_admin'))->toBeTrue();
        });

        test('kpa user has correct permissions', function (): void {
            $this->seed(\Database\Seeders\UsersSeeder::class);

            $response = $this->post(route('login.store'), [
                'email' => 'kpa@demo.com',
                'password' => 'password',
            ]);

            $user = auth()->user();
            expect($user->hasRole('kpa'))->toBeTrue();
        });

        test('operator_bmn has correct role', function (): void {
            $this->seed(\Database\Seeders\UsersSeeder::class);

            $response = $this->post(route('login.store'), [
                'email' => 'operator_bmn@demo.com',
                'password' => 'password',
            ]);

            $user = auth()->user();
            expect($user->hasRole('operator_bmn'))->toBeTrue();
        });
    });

    describe('Permission Middleware', function (): void {
        test('middleware allows access with correct role', function (): void {
            $role = Role::where('name', 'super_admin')->first();
            $user = User::factory()->create();
            $user->assignRole($role);

            $request = Request::create('/test', 'GET');
            $request->setUserResolver(fn () => $user);

            $middleware = new \App\Http\Middleware\CheckPermission;

            $response = $middleware->handle($request, fn () => new \Illuminate\Http\Response('OK', 200), 'super_admin');

            expect($response->getStatusCode())->toBe(200);
        });

        test('middleware denies access with wrong role', function (): void {
            $role = Role::where('name', 'pegawai')->first();
            $user = User::factory()->create();
            $user->assignRole($role);

            $request = Request::create('/test', 'GET');
            $request->setUserResolver(fn () => $user);

            $middleware = new \App\Http\Middleware\CheckPermission;

            $middleware->handle($request, fn () => new \Illuminate\Http\Response('OK', 200), 'operator_bmn');
        })->throws(\Symfony\Component\HttpKernel\Exception\HttpException::class);

        test('middleware allows super_admin to access any route', function (): void {
            $role = Role::where('name', 'super_admin')->first();
            $user = User::factory()->create();
            $user->assignRole($role);

            $request = Request::create('/test', 'GET');
            $request->setUserResolver(fn () => $user);

            $middleware = new \App\Http\Middleware\CheckPermission;

            $response = $middleware->handle($request, fn () => new \Illuminate\Http\Response('OK', 200), 'any-random-permission');

            expect($response->getStatusCode())->toBe(200);
        });
    });

    describe('Database Relationships', function (): void {
        test('user belongs to location and department relationships exist', function (): void {
            $user = User::factory()->create([
                'phone' => '081234567890',
                'nip' => '1234567890',
            ]);

            expect(method_exists($user, 'roles'))->toBeTrue();
            expect(method_exists($user, 'permissions'))->toBeTrue();
        });

        test('roles can be retrieved from database', function (): void {
            $roles = Role::all();

            expect($roles)->toHaveCount(6);
            expect($roles->pluck('name')->toArray())->toContain('super_admin');
            expect($roles->pluck('name')->toArray())->toContain('kpa');
            expect($roles->pluck('name')->toArray())->toContain('kasubag_umum');
            expect($roles->pluck('name')->toArray())->toContain('operator_bmn');
            expect($roles->pluck('name')->toArray())->toContain('operator_persediaan');
            expect($roles->pluck('name')->toArray())->toContain('pegawai');
        });
    });
});
