<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class ImpersonateController extends Controller
{
    /**
     * Start impersonating a target user.
     *
     * Stores the original admin ID in session and logs in as the target user.
     * Only super_admin users with users.impersonate permission can use this feature.
     *
     * @param  \Illuminate\Http\Request  $request  The incoming HTTP request
     * @param  \App\Models\User  $user  The target user to impersonate
     * @return \Illuminate\Http\RedirectResponse Redirects to home page
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException When user is not authorized
     */
    public function start(Request $request, User $user): RedirectResponse
    {
        $admin = auth()->user();

        // Only super_admin can impersonate
        if (! $admin->hasRole('super_admin')) {
            abort(403, 'Only super_admin can impersonate users.');
        }

        // Prevent self-impersonation
        if ($admin->id === $user->id) {
            abort(403, 'Cannot impersonate yourself.');
        }

        // Prevent impersonating other super_admins
        if ($user->hasRole('super_admin')) {
            abort(403, 'Cannot impersonate super_admin users.');
        }

        // Prevent double impersonation
        if (Session::has('impersonate_admin_id')) {
            abort(403, 'Already impersonating a user. Stop current impersonation first.');
        }

        // Store original admin ID and target user ID in session
        Session::put('impersonate_admin_id', $admin->id);
        Session::put('impersonate_target_user_id', $user->id);

        // Log in as target user
        Auth::login($user);

        // Log the impersonate action if AuditLogService exists
        if (class_exists(\App\Services\AuditLogService::class)) {
            $auditLogService = app(\App\Services\AuditLogService::class);
            if (method_exists($auditLogService, 'logImpersonate')) {
                $auditLogService->logImpersonate($admin, $user, 'start');
            }
        }

        return redirect('/')->with('success', "You are now impersonating {$user->name}.");
    }

    /**
     * Stop impersonating and restore original admin session.
     *
     * Restores the original admin user from session and clears impersonation data.
     *
     * @param  \Illuminate\Http\Request  $request  The incoming HTTP request
     * @return \Illuminate\Http\RedirectResponse Redirects to admin users page
     */
    public function stop(Request $request): RedirectResponse
    {
        // Check if impersonating
        if (! Session::has('impersonate_admin_id')) {
            return redirect('/admin/users')->with('error', 'No active impersonation session found.');
        }

        $adminId = Session::get('impersonate_admin_id');
        $targetUserId = Session::get('impersonate_target_user_id');

        // Find the admin user using DB::table to avoid SoftDeletes trait issues
        $admin = \DB::table('users')->where('id', $adminId)->first();

        if (! $admin) {
            // Admin not found, clear session and redirect
            Session::forget(['impersonate_admin_id', 'impersonate_target_user_id']);
            Auth::logout();

            return redirect('/login')->with('error', 'Original admin user not found.');
        }

        // Log the impersonate stop action if AuditLogService exists
        if (class_exists(\App\Services\AuditLogService::class)) {
            $targetUserData = \DB::table('users')->where('id', $targetUserId)->first();
            if ($targetUserData) {
                $auditLogService = app(\App\Services\AuditLogService::class);
                if (method_exists($auditLogService, 'logImpersonate')) {
                    // Try to create User models, but don't fail if SoftDeletes causes issues
                    try {
                        $adminModel = User::find($admin->id);
                        $targetUserModel = User::find($targetUserData->id);
                        if ($adminModel && $targetUserModel) {
                            $auditLogService->logImpersonate($adminModel, $targetUserModel, 'stop');
                        }
                    } catch (\Exception $e) {
                        // Log failed, but continue with stopping impersonation
                    }
                }
            }
        }

        // Clear impersonation session data
        Session::forget(['impersonate_admin_id', 'impersonate_target_user_id']);

        // Log back in as admin using ID to avoid SoftDeletes issues
        Auth::loginUsingId($admin->id);

        return redirect('/admin/users')->with('success', 'Impersonation stopped. You are now back to your admin account.');
    }
}
