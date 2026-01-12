<?php

use App\Http\Controllers\Admin\ImpersonateController;
use App\Http\Controllers\Admin\NotificationLogController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserExportController;
use App\Http\Controllers\Admin\WhatsAppSettingsController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified'])->group(function () {
    // WhatsApp Settings - requires super_admin
    Route::middleware(['permission:settings.whatsapp'])->group(function () {
        Route::get('/whatsapp-settings', [WhatsAppSettingsController::class, 'index'])
            ->name('whatsapp-settings.index');
        Route::post('/whatsapp-settings', [WhatsAppSettingsController::class, 'update'])
            ->name('whatsapp-settings.update');
        Route::post('/whatsapp-settings/test-send', [WhatsAppSettingsController::class, 'testSend'])
            ->name('whatsapp-settings.test-send');
    });

    // Notification Logs - requires super_admin or permission
    Route::middleware(['permission:settings.notifications'])->group(function () {
        Route::get('/notification-logs', [NotificationLogController::class, 'index'])
            ->name('notification-logs.index');
        Route::get('/notification-logs/{log}', [NotificationLogController::class, 'show'])
            ->name('notification-logs.show');
    });

    // Role Management - requires role management permission
    Route::prefix('roles')->name('roles.')->middleware(['permission:roles.manage'])->group(function () {
        Route::get('/', [RoleController::class, 'index'])->name('index');
        Route::get('/{role}', [RoleController::class, 'show'])->name('show');
        Route::put('/{role}/users', [RoleController::class, 'updateUsers'])->name('update-users');

        // Role Permissions Routes - using RoleController methods
        Route::get('/{role}/permissions', [RoleController::class, 'permissions'])->name('permissions');
        Route::put('/{role}/permissions', [RoleController::class, 'syncPermissions'])->name('sync-permissions');
    });

    // Permission Management Routes - requires permission management
    Route::prefix('permissions')->name('permissions.')->middleware(['permission:permissions.manage'])->group(function () {
        Route::get('/', [PermissionController::class, 'index'])->name('index');
        Route::post('/', [PermissionController::class, 'store'])->name('store');
        Route::put('/{permission}', [PermissionController::class, 'update'])->name('update');
        Route::delete('/{permission}', [PermissionController::class, 'destroy'])->name('destroy');
    });

    // User Management Routes
    Route::prefix('users')->name('users.')->group(function () {
        // User Export - must come before /{user} route
        Route::get('/export', UserExportController::class)
            ->middleware(['permission:users.view'])
            ->name('export');

        // User CRUD Routes - authorization handled by UserPolicy
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/{user}', [UserController::class, 'show'])->name('show');
        Route::put('/{user}', [UserController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');

        // User Restore (soft delete)
        Route::post('/{id}/restore', [UserController::class, 'restore'])->name('restore');

        // User role sync - requires super_admin (checked in controller)
        Route::put('/{user}/roles', [UserController::class, 'syncRoles'])->name('sync-roles');

        // User Impersonation Routes
        // Start impersonation requires users.impersonate permission
        Route::post('/{user}/impersonate', [ImpersonateController::class, 'start'])
            ->name('impersonate');

        // Stop impersonation only requires authentication (session check handles authorization)
        Route::get('/stop-impersonate', [ImpersonateController::class, 'stop'])
            ->name('stop-impersonate');
    });
});
