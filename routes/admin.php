<?php

use App\Http\Controllers\Admin\NotificationLogController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified', 'permission:super_admin'])->group(function () {
    Route::get('/notification-logs', [NotificationLogController::class, 'index'])
        ->name('notification-logs.index');
    Route::get('/notification-logs/{log}', [NotificationLogController::class, 'show'])
        ->name('notification-logs.show');
});
