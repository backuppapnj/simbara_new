<?php

declare(strict_types=1);

use App\Http\Middleware\CheckPermission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

uses(TestCase::class)->in('..');

describe('CheckPermission Middleware', function (): void {
    beforeEach(function (): void {
        $this->middleware = new CheckPermission;
    });

    it('can be instantiated', function (): void {
        expect($this->middleware)->toBeInstanceOf(CheckPermission::class);
    });

    it('accepts role parameter and allows access when user has role', function (): void {
        $role = Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $closure = function (Request $req): Response {
            return new Response('OK', 200);
        };

        $response = $this->middleware->handle($request, $closure, 'admin');

        expect($response->getStatusCode())->toBe(200);
    });

    it('denies access when user does not have required role', function (): void {
        $user = User::factory()->create();

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $closure = function (Request $req): Response {
            return new Response('OK', 200);
        };

        $this->middleware->handle($request, $closure, 'admin');
    })->throws(\Symfony\Component\HttpKernel\Exception\HttpException::class);

    it('accepts permission parameter and allows access when user has permission', function (): void {
        $permission = Permission::create(['name' => 'edit users', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->givePermissionTo($permission);

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $closure = function (Request $req): Response {
            return new Response('OK', 200);
        };

        $response = $this->middleware->handle($request, $closure, 'permission:edit users');

        expect($response->getStatusCode())->toBe(200);
    });

    it('denies access when user does not have required permission', function (): void {
        $user = User::factory()->create();

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $closure = function (Request $req): Response {
            return new Response('OK', 200);
        };

        $this->middleware->handle($request, $closure, 'permission:delete assets');
    })->throws(\Symfony\Component\HttpKernel\Exception\HttpException::class);

    it('allows access with pipe-separated roles (OR logic)', function (): void {
        $role = Role::create(['name' => 'operator_bmn', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $closure = function (Request $req): Response {
            return new Response('OK', 200);
        };

        $response = $this->middleware->handle($request, $closure, 'super_admin|operator_bmn|operator_persediaan');

        expect($response->getStatusCode())->toBe(200);
    });

    it('allows access with pipe-separated permissions (OR logic)', function (): void {
        $permission = Permission::create(['name' => 'view assets', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->givePermissionTo($permission);

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $closure = function (Request $req): Response {
            return new Response('OK', 200);
        };

        $response = $this->middleware->handle($request, $closure, 'permission:view assets|permission:edit assets');

        expect($response->getStatusCode())->toBe(200);
    });

    it('allows super_admin access to all routes', function (): void {
        $role = Role::create(['name' => 'super_admin', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $closure = function (Request $req): Response {
            return new Response('OK', 200);
        };

        $response = $this->middleware->handle($request, $closure, 'any random permission');

        expect($response->getStatusCode())->toBe(200);
    });

    it('denies access when user is not authenticated', function (): void {
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => null);

        $closure = function (Request $req): Response {
            return new Response('OK', 200);
        };

        $this->middleware->handle($request, $closure, 'admin');
    })->throws(\Symfony\Component\HttpKernel\Exception\HttpException::class);
});
