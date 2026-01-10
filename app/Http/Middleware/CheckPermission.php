<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission = ''): Response
    {
        $user = $request->user();

        if ($user === null) {
            throw new HttpException(401, 'Unauthenticated.');
        }

        // Super admin has access to everything
        if ($user->hasRole('super_admin')) {
            return $next($request);
        }

        if (empty($permission)) {
            return $next($request);
        }

        $items = explode('|', $permission);

        foreach ($items as $item) {
            $item = trim($item);

            if (str_starts_with($item, 'permission:')) {
                $perm = substr($item, strlen('permission:'));

                try {
                    if ($user->hasPermissionTo($perm)) {
                        return $next($request);
                    }
                } catch (PermissionDoesNotExist) {
                    // Permission does not exist, continue checking
                }
            } else {
                if ($user->hasRole($item)) {
                    return $next($request);
                }
            }
        }

        throw new HttpException(403, 'Forbidden.');
    }
}
