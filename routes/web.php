<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Fortify Authentication Routes
if (Features::enabled(Features::registration())) {
    Route::get('/register', [App\Http\Controllers\Auth\RegistrationController::class, 'create'])->name('register');
    Route::post('/register', [App\Http\Controllers\Auth\RegistrationController::class, 'store'])->name('register.store');
}

Route::get('/login', fn () => Inertia::render('auth/login'))->name('login');
Route::post('/login', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'store'])->name('login.store');

Route::post('/logout', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'destroy'])->name('logout');

if (Features::enabled(Features::resetPasswords())) {
    Route::get('/forgot-password', fn () => Inertia::render('auth/forgot-password'))->name('password.request');
    Route::post('/forgot-password', [\App\Http\Controllers\Auth\PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::get('/reset-password/{token}', fn ($token) => Inertia::render('auth/reset-password', ['token' => $token]))->name('password.reset');
    Route::post('/reset-password', [\App\Http\Controllers\Auth\NewPasswordController::class, 'store'])->name('password.update');
}

// Two Factor Authentication Routes
if (Features::enabled(Features::twoFactorAuthentication())) {
    Route::get('/two-factor-challenge', fn () => Inertia::render('auth/two-factor-challenge'))->name('two-factor.login');
    Route::post('/two-factor-challenge', [\App\Http\Controllers\Auth\TwoFactorAuthenticationController::class, 'store'])->name('two-factor.store');
    Route::post('/two-factor-recovery-code', [\App\Http\Controllers\Auth\TwoFactorAuthenticationController::class, 'storeRecoveryCode'])->name('two-factor.recovery');
}

// Password Confirmation Route (requires auth)
Route::middleware(['auth'])->group(function () {
    Route::get('/confirm-password', fn () => Inertia::render('auth/confirm-password'))->name('password.confirm');
    Route::post('/confirm-password', [\App\Http\Controllers\Auth\ConfirmPasswordController::class, 'store'])->name('password.confirm.app');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', \App\Http\Controllers\DashboardController::class)->name('dashboard');
});

// Push Subscription Routes (API)
Route::middleware(['auth'])->group(function () {
    Route::post('/push-subscriptions', [\App\Http\Controllers\Api\PushSubscriptionController::class, 'store'])->name('push-subscriptions.store');
    Route::delete('/push-subscriptions', [\App\Http\Controllers\Api\PushSubscriptionController::class, 'destroy'])->name('push-subscriptions.destroy');
    Route::get('/push-subscriptions/vapid-key', [\App\Http\Controllers\Api\PushSubscriptionController::class, 'vapidKey'])->name('push-subscriptions.vapid-key');
});

require __DIR__.'/settings.php';
