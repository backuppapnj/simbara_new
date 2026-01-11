<?php

use App\Http\Controllers\Admin\NotificationLogController;
use App\Http\Controllers\Admin\WhatsAppSettingsController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified', 'permission:super_admin'])->group(function () {
    Route::get('/whatsapp-settings', [WhatsAppSettingsController::class, 'index'])
        ->name('whatsapp-settings.index');
    Route::post('/whatsapp-settings', [WhatsAppSettingsController::class, 'update'])
        ->name('whatsapp-settings.update');
    Route::post('/whatsapp-settings/test-send', [WhatsAppSettingsController::class, 'testSend'])
        ->name('whatsapp-settings.test-send');

    Route::get('/notification-logs', [NotificationLogController::class, 'index'])
        ->name('notification-logs.index');
    Route::get('/notification-logs/{log}', [NotificationLogController::class, 'show'])
        ->name('notification-logs.show');
});
