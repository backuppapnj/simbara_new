<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class ImpersonateMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Detects if the current session is an impersonation session and shares
     * the impersonation information to Inertia for displaying a banner.
     *
     * @param  \Illuminate\Http\Request  $request  The incoming HTTP request
     * @param  \Closure  $next  The next middleware in the pipeline
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if this is an impersonation session
        if (Session::has('impersonate_admin_id')) {
            $adminId = Session::get('impersonate_admin_id');
            $targetUserId = Session::get('impersonate_target_user_id');

            // Validate that the admin user still exists
            // Note: We query the database directly to avoid SoftDeletes trait issues
            $admin = \DB::table('users')->where('id', $adminId)->first();

            if (! $admin) {
                // Admin user not found - clear impersonation session
                Session::forget(['impersonate_admin_id', 'impersonate_target_user_id']);

                return $next($request);
            }

            // Get target user info for the banner
            $targetUser = \DB::table('users')->where('id', $targetUserId)->first();

            // Share impersonate info with Inertia
            Inertia::share('impersonate', [
                'is_impersonating' => true,
                'admin' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                ],
                'target_user' => $targetUser ? [
                    'id' => $targetUser->id,
                    'name' => $targetUser->name,
                    'email' => $targetUser->email,
                ] : null,
            ]);
        } else {
            // Not impersonating - share default state
            Inertia::share('impersonate', [
                'is_impersonating' => false,
                'admin' => null,
                'target_user' => null,
            ]);
        }

        return $next($request);
    }
}
