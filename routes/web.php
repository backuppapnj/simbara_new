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

    // Items CRUD
    Route::prefix('items')->name('items.')->group(function () {
        Route::get('/', [\App\Http\Controllers\ItemController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\ItemController::class, 'store'])->name('store');
        Route::put('/{item}', [\App\Http\Controllers\ItemController::class, 'update'])->name('update');
        Route::delete('/{item}', [\App\Http\Controllers\ItemController::class, 'destroy'])->name('destroy');
        Route::get('/{item}/mutations', [\App\Http\Controllers\ItemController::class, 'mutations'])->name('mutations');
    });

    // Assets Management
    Route::prefix('assets')->name('assets.')->group(function () {
        Route::get('/', [\App\Http\Controllers\AssetController::class, 'index'])->name('index');
        Route::get('/import', [\App\Http\Controllers\AssetController::class, 'import'])->name('import');
        Route::post('/import', [\App\Http\Controllers\AssetController::class, 'processImport'])->name('import.process');
        Route::post('/import/confirm', [\App\Http\Controllers\AssetController::class, 'confirmImport'])->name('import.confirm');
        Route::get('/{id}', [\App\Http\Controllers\AssetController::class, 'show'])->name('show');
        Route::get('/{id}/histories', [\App\Http\Controllers\AssetController::class, 'histories'])->name('histories');
        Route::post('/{id}/update-location', [\App\Http\Controllers\AssetController::class, 'updateLocation'])->name('update-location');

        // Asset Photos
        Route::prefix('{id}/photos')->name('photos.')->group(function () {
            Route::get('/', [\App\Http\Controllers\AssetController::class, 'photosIndex'])->name('index');
            Route::post('/', [\App\Http\Controllers\AssetController::class, 'photosStore'])->name('store');
        });

        Route::prefix('{assetId}/photos')->name('photos.')->group(function () {
            Route::put('/{photoId}', [\App\Http\Controllers\AssetController::class, 'photosUpdate'])->name('update');
            Route::delete('/{photoId}', [\App\Http\Controllers\AssetController::class, 'photosDestroy'])->name('destroy');
        });

        // Asset Maintenances
        Route::prefix('{id}/maintenance')->name('maintenance.')->group(function () {
            Route::post('/', [\App\Http\Controllers\AssetController::class, 'maintenanceStore'])->name('store');
        });

        Route::prefix('{assetId}/maintenances')->name('maintenances.')->group(function () {
            Route::get('/', [\App\Http\Controllers\AssetController::class, 'maintenancesIndex'])->name('index');
            Route::put('/{maintenanceId}', [\App\Http\Controllers\AssetController::class, 'maintenancesUpdate'])->name('update');
            Route::delete('/{maintenanceId}', [\App\Http\Controllers\AssetController::class, 'maintenancesDestroy'])->name('destroy');
        });

        // Asset Reports & Exports
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [\App\Http\Controllers\AssetReportController::class, 'index'])->name('index');
            Route::post('/preview', [\App\Http\Controllers\AssetReportController::class, 'preview'])->name('preview');
            Route::get('/export/sakti-siman', [\App\Http\Controllers\AssetReportController::class, 'exportSaktiSiman'])->name('export.sakti-siman');
            Route::get('/export/by-location', [\App\Http\Controllers\AssetReportController::class, 'exportByLocation'])->name('export.by-location');
            Route::get('/export/by-category', [\App\Http\Controllers\AssetReportController::class, 'exportByCategory'])->name('export.by-category');
            Route::get('/export/by-condition', [\App\Http\Controllers\AssetReportController::class, 'exportByCondition'])->name('export.by-condition');
            Route::get('/export/maintenance-history', [\App\Http\Controllers\AssetReportController::class, 'exportMaintenanceHistory'])->name('export.maintenance-history');
            Route::get('/export/value-summary', [\App\Http\Controllers\AssetReportController::class, 'exportValueSummary'])->name('export.value-summary');
        });
    });

    // Stock Opnames
    Route::prefix('stock-opnames')->name('stock-opnames.')->group(function () {
        Route::get('/', [\App\Http\Controllers\StockOpnameController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\StockOpnameController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\StockOpnameController::class, 'store'])->name('store');
        Route::get('/{stockOpname}', [\App\Http\Controllers\StockOpnameController::class, 'show'])->name('show');
        Route::post('/{stockOpname}/submit', [\App\Http\Controllers\StockOpnameController::class, 'submit'])->name('submit');
        Route::post('/{stockOpname}/approve', [\App\Http\Controllers\StockOpnameController::class, 'approve'])->name('approve');
        Route::get('/{stockOpname}/ba-pdf', [\App\Http\Controllers\StockOpnameController::class, 'generateBaPdf'])->name('ba-pdf');
    });

    // ATK Requests Management
    Route::prefix('atk-requests')->name('atk-requests.')->group(function () {
        Route::get('/', [\App\Http\Controllers\AtkRequestController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\AtkRequestController::class, 'store'])->name('store');
        Route::get('/{atkRequest}', [\App\Http\Controllers\AtkRequestController::class, 'show'])->name('show');

        // Approval routes
        Route::post('/{atkRequest}/approve-level1', [\App\Http\Controllers\AtkRequestController::class, 'approveLevel1'])->name('approve-level1');
        Route::post('/{atkRequest}/approve-level2', [\App\Http\Controllers\AtkRequestController::class, 'approveLevel2'])->name('approve-level2');
        Route::post('/{atkRequest}/approve-level3', [\App\Http\Controllers\AtkRequestController::class, 'approveLevel3'])->name('approve-level3');
        Route::post('/{atkRequest}/reject', [\App\Http\Controllers\AtkRequestController::class, 'reject'])->name('reject');
    });

    // Office Supplies Management
    Route::prefix('office-supplies')->name('office-supplies.')->group(function () {
        Route::get('/', [\App\Http\Controllers\OfficeSupplyController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\OfficeSupplyController::class, 'store'])->name('store');
        Route::put('/{office_supply}', [\App\Http\Controllers\OfficeSupplyController::class, 'update'])->name('update');
        Route::delete('/{office_supply}', [\App\Http\Controllers\OfficeSupplyController::class, 'destroy'])->name('destroy');
        Route::get('/{office_supply}/mutations', [\App\Http\Controllers\OfficeSupplyController::class, 'mutations'])->name('mutations');
    });

    // Office Usages Management
    Route::prefix('office-usages')->name('office-usages.')->group(function () {
        Route::get('/', [\App\Http\Controllers\OfficeUsageController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\OfficeUsageController::class, 'store'])->name('store');
    });

    // Office Mutations
    Route::prefix('office-mutations')->name('office-mutations.')->group(function () {
        Route::post('/quick-deduct', [\App\Http\Controllers\OfficeUsageController::class, 'quickDeduct'])->name('quick-deduct');
    });

    // Office Purchases Management
    Route::prefix('office-purchases')->name('office-purchases.')->group(function () {
        Route::get('/', [\App\Http\Controllers\OfficePurchaseController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\OfficePurchaseController::class, 'store'])->name('store');
        Route::get('/{officePurchase}', [\App\Http\Controllers\OfficePurchaseController::class, 'show'])->name('show');
    });

    // Office Requests Management
    Route::prefix('office-requests')->name('office-requests.')->group(function () {
        Route::get('/', [\App\Http\Controllers\OfficeRequestController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\OfficeRequestController::class, 'store'])->name('store');
        Route::get('/{officeRequest}', [\App\Http\Controllers\OfficeRequestController::class, 'show'])->name('show');

        // Direct approval routes (no multi-level approval for office supplies)
        Route::post('/{officeRequest}/approve', [\App\Http\Controllers\OfficeRequestController::class, 'approve'])->name('approve');
        Route::post('/{officeRequest}/reject', [\App\Http\Controllers\OfficeRequestController::class, 'reject'])->name('reject');
    });

    // ATK Purchases Management
    Route::prefix('purchases')->name('purchases.')->group(function () {
        Route::get('/', [\App\Http\Controllers\PurchaseController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\PurchaseController::class, 'store'])->name('store');
        Route::get('/{purchase}', [\App\Http\Controllers\PurchaseController::class, 'show'])->name('show');
        Route::post('/{purchase}/receive', [\App\Http\Controllers\PurchaseController::class, 'receive'])->name('receive');
        Route::post('/{purchase}/complete', [\App\Http\Controllers\PurchaseController::class, 'complete'])->name('complete');
    });
});

// Push Subscription Routes (API)
Route::middleware(['auth'])->group(function () {
    Route::post('/push-subscriptions', [\App\Http\Controllers\Api\PushSubscriptionController::class, 'store'])->name('push-subscriptions.store');
    Route::delete('/push-subscriptions', [\App\Http\Controllers\Api\PushSubscriptionController::class, 'destroy'])->name('push-subscriptions.destroy');
    Route::get('/push-subscriptions/vapid-key', [\App\Http\Controllers\Api\PushSubscriptionController::class, 'vapidKey'])->name('push-subscriptions.vapid-key');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
