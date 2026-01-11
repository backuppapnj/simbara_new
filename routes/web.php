<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

Route::get('/', function () {
    return Inertia::render('auth/login', [
        'canResetPassword' => Features::enabled(Features::resetPasswords()),
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->middleware('guest')->name('home');

// Fortify Authentication Routes
if (Features::enabled(Features::registration())) {
    Route::get('/register', [App\Http\Controllers\Auth\RegistrationController::class, 'create'])->name('register');
    Route::post('/register', [App\Http\Controllers\Auth\RegistrationController::class, 'store'])->name('register.store');
}

Route::get('/login', fn () => Inertia::render('auth/login'))->middleware('guest')->name('login');
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
        Route::get('/', [\App\Http\Controllers\ItemController::class, 'index'])
            ->middleware('permission:atk.view')
            ->name('index');
        Route::post('/', [\App\Http\Controllers\ItemController::class, 'store'])
            ->middleware('permission:atk.items.create')
            ->name('store');
        Route::put('/{item}', [\App\Http\Controllers\ItemController::class, 'update'])
            ->middleware('permission:atk.items.edit')
            ->name('update');
        Route::delete('/{item}', [\App\Http\Controllers\ItemController::class, 'destroy'])
            ->middleware('permission:atk.items.delete')
            ->name('destroy');
        Route::get('/{item}/mutations', [\App\Http\Controllers\ItemController::class, 'mutations'])
            ->middleware('permission:atk.view')
            ->name('mutations');
    });

    // Assets Management
    Route::prefix('assets')->name('assets.')->group(function () {
        Route::get('/', [\App\Http\Controllers\AssetController::class, 'index'])
            ->middleware('permission:assets.view')
            ->name('index');
        Route::get('/import', [\App\Http\Controllers\AssetController::class, 'import'])
            ->middleware('permission:assets.import')
            ->name('import');
        Route::post('/import', [\App\Http\Controllers\AssetController::class, 'processImport'])
            ->middleware('permission:assets.import')
            ->name('import.process');
        Route::post('/import/confirm', [\App\Http\Controllers\AssetController::class, 'confirmImport'])
            ->middleware('permission:assets.import')
            ->name('import.confirm');
        Route::get('/{id}', [\App\Http\Controllers\AssetController::class, 'show'])
            ->middleware('permission:assets.view')
            ->name('show');
        Route::get('/{id}/histories', [\App\Http\Controllers\AssetController::class, 'histories'])
            ->middleware('permission:assets.view')
            ->name('histories');
        Route::post('/{id}/update-location', [\App\Http\Controllers\AssetController::class, 'updateLocation'])
            ->middleware('permission:assets.edit')
            ->name('update-location');

        // Asset Photos
        Route::prefix('{id}/photos')->name('photos.')->middleware('permission:assets.photos')->group(function () {
            Route::get('/', [\App\Http\Controllers\AssetController::class, 'photosIndex'])->name('index');
            Route::post('/', [\App\Http\Controllers\AssetController::class, 'photosStore'])->name('store');
        });

        Route::prefix('{assetId}/photos')->name('photos.')->group(function () {
            Route::put('/{photoId}', [\App\Http\Controllers\AssetController::class, 'photosUpdate'])
                ->middleware('permission:assets.photos')
                ->name('update');
            Route::delete('/{photoId}', [\App\Http\Controllers\AssetController::class, 'photosDestroy'])
                ->middleware('permission:assets.photos')
                ->name('destroy');
        });

        // Asset Maintenances
        Route::prefix('{id}/maintenance')->name('maintenance.')->group(function () {
            Route::post('/', [\App\Http\Controllers\AssetController::class, 'maintenanceStore'])
                ->middleware('permission:assets.maintenance.create')
                ->name('store');
        });

        Route::prefix('{assetId}/maintenances')->name('maintenances.')->group(function () {
            Route::get('/', [\App\Http\Controllers\AssetController::class, 'maintenancesIndex'])
                ->middleware('permission:assets.maintenance.view')
                ->name('index');
            Route::put('/{maintenanceId}', [\App\Http\Controllers\AssetController::class, 'maintenancesUpdate'])
                ->middleware('permission:assets.maintenance.edit')
                ->name('update');
            Route::delete('/{maintenanceId}', [\App\Http\Controllers\AssetController::class, 'maintenancesDestroy'])
                ->middleware('permission:assets.maintenance.delete')
                ->name('destroy');
        });

        // Asset Reports & Exports
        Route::prefix('reports')->name('reports.')->middleware('permission:assets.export')->group(function () {
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
        Route::get('/', [\App\Http\Controllers\StockOpnameController::class, 'index'])
            ->middleware('permission:stock_opnames.view')
            ->name('index');
        Route::get('/create', [\App\Http\Controllers\StockOpnameController::class, 'create'])
            ->middleware('permission:stock_opnames.create')
            ->name('create');
        Route::post('/', [\App\Http\Controllers\StockOpnameController::class, 'store'])
            ->middleware('permission:stock_opnames.create')
            ->name('store');
        Route::get('/{stockOpname}', [\App\Http\Controllers\StockOpnameController::class, 'show'])
            ->middleware('permission:stock_opnames.view')
            ->name('show');
        Route::post('/{stockOpname}/submit', [\App\Http\Controllers\StockOpnameController::class, 'submit'])
            ->middleware('permission:stock_opnames.create')
            ->name('submit');
        Route::post('/{stockOpname}/approve', [\App\Http\Controllers\StockOpnameController::class, 'approve'])
            ->middleware('permission:stock_opnames.approve')
            ->name('approve');
        Route::get('/{stockOpname}/ba-pdf', [\App\Http\Controllers\StockOpnameController::class, 'generateBaPdf'])
            ->middleware('permission:stock_opnames.view')
            ->name('ba-pdf');
    });

    // ATK Requests Management
    Route::prefix('atk-requests')->name('atk-requests.')->group(function () {
        Route::get('/', [\App\Http\Controllers\AtkRequestController::class, 'index'])
            ->middleware('permission:atk.view')
            ->name('index');
        Route::get('/create', [\App\Http\Controllers\AtkRequestController::class, 'create'])
            ->middleware('permission:atk.create')
            ->name('create');
        Route::post('/', [\App\Http\Controllers\AtkRequestController::class, 'store'])
            ->middleware('permission:atk.create')
            ->name('store');
        Route::get('/{atkRequest}', [\App\Http\Controllers\AtkRequestController::class, 'show'])
            ->middleware('permission:atk.view')
            ->name('show');

        // Approval routes
        Route::post('/{atkRequest}/approve-level1', [\App\Http\Controllers\AtkRequestController::class, 'approveLevel1'])
            ->middleware('permission:atk.requests.approve')
            ->name('approve-level1');
        Route::post('/{atkRequest}/approve-level2', [\App\Http\Controllers\AtkRequestController::class, 'approveLevel2'])
            ->middleware('permission:atk.requests.approve')
            ->name('approve-level2');
        Route::post('/{atkRequest}/approve-level3', [\App\Http\Controllers\AtkRequestController::class, 'approveLevel3'])
            ->middleware('permission:atk.requests.approve')
            ->name('approve-level3');
        Route::post('/{atkRequest}/reject', [\App\Http\Controllers\AtkRequestController::class, 'reject'])
            ->middleware('permission:atk.requests.approve')
            ->name('reject');

        // Distribution routes
        Route::post('/{atkRequest}/distribute', [\App\Http\Controllers\AtkRequestController::class, 'distribute'])
            ->middleware('permission:atk.requests.distribute')
            ->name('distribute');
        Route::post('/{atkRequest}/confirm-receive', [\App\Http\Controllers\AtkRequestController::class, 'confirmReceive'])
            ->name('confirm-receive');
    });

    // Office Supplies Management
    Route::prefix('office-supplies')->name('office-supplies.')->group(function () {
        Route::get('/', [\App\Http\Controllers\OfficeSupplyController::class, 'index'])
            ->middleware('permission:office.view')
            ->name('index');
        Route::post('/', [\App\Http\Controllers\OfficeSupplyController::class, 'store'])
            ->middleware('permission:office.create')
            ->name('store');
        Route::put('/{office_supply}', [\App\Http\Controllers\OfficeSupplyController::class, 'update'])
            ->middleware('permission:office.edit')
            ->name('update');
        Route::delete('/{office_supply}', [\App\Http\Controllers\OfficeSupplyController::class, 'destroy'])
            ->middleware('permission:office.delete')
            ->name('destroy');
        Route::get('/{office_supply}/mutations', [\App\Http\Controllers\OfficeSupplyController::class, 'mutations'])
            ->middleware('permission:office.view')
            ->name('mutations');
    });

    // Office Usages Management
    Route::prefix('office-usages')->name('office-usages.')->group(function () {
        Route::get('/', [\App\Http\Controllers\OfficeUsageController::class, 'index'])
            ->middleware('permission:office.view')
            ->name('index');
        Route::post('/', [\App\Http\Controllers\OfficeUsageController::class, 'store'])
            ->middleware('permission:office.usage.log')
            ->name('store');
    });

    // Office Mutations
    Route::prefix('office-mutations')->name('office-mutations.')->group(function () {
        Route::post('/quick-deduct', [\App\Http\Controllers\OfficeUsageController::class, 'quickDeduct'])
            ->middleware('permission:office.usage.log')
            ->name('quick-deduct');
    });

    // Office Purchases Management
    Route::prefix('office-purchases')->name('office-purchases.')->group(function () {
        Route::get('/', [\App\Http\Controllers\OfficePurchaseController::class, 'index'])
            ->middleware('permission:office.view')
            ->name('index');
        Route::post('/', [\App\Http\Controllers\OfficePurchaseController::class, 'store'])
            ->middleware('permission:office.purchases')
            ->name('store');
        Route::get('/{officePurchase}', [\App\Http\Controllers\OfficePurchaseController::class, 'show'])
            ->middleware('permission:office.view')
            ->name('show');
    });

    // Office Requests Management
    Route::prefix('office-requests')->name('office-requests.')->group(function () {
        Route::get('/', [\App\Http\Controllers\OfficeRequestController::class, 'index'])
            ->middleware('permission:office.view')
            ->name('index');
        Route::post('/', [\App\Http\Controllers\OfficeRequestController::class, 'store'])
            ->middleware('permission:office.requests.create')
            ->name('store');
        Route::get('/{officeRequest}', [\App\Http\Controllers\OfficeRequestController::class, 'show'])
            ->middleware('permission:office.view')
            ->name('show');

        // Direct approval routes (no multi-level approval for office supplies)
        Route::post('/{officeRequest}/approve', [\App\Http\Controllers\OfficeRequestController::class, 'approve'])
            ->middleware('permission:office.requests.approve')
            ->name('approve');
        Route::post('/{officeRequest}/reject', [\App\Http\Controllers\OfficeRequestController::class, 'reject'])
            ->middleware('permission:office.requests.approve')
            ->name('reject');
    });

    // ATK Purchases Management
    Route::prefix('purchases')->name('purchases.')->group(function () {
        Route::get('/', [\App\Http\Controllers\PurchaseController::class, 'index'])
            ->middleware('permission:atk.purchases.view')
            ->name('index');
        Route::get('/create', [\App\Http\Controllers\PurchaseController::class, 'create'])
            ->middleware('permission:atk.purchases.create')
            ->name('create');
        Route::post('/', [\App\Http\Controllers\PurchaseController::class, 'store'])
            ->middleware('permission:atk.purchases.create')
            ->name('store');
        Route::get('/{purchase}', [\App\Http\Controllers\PurchaseController::class, 'show'])
            ->middleware('permission:atk.purchases.view')
            ->name('show');
        Route::post('/{purchase}/receive', [\App\Http\Controllers\PurchaseController::class, 'receive'])
            ->middleware('permission:atk.purchases.approve')
            ->name('receive');
        Route::post('/{purchase}/complete', [\App\Http\Controllers\PurchaseController::class, 'complete'])
            ->middleware('permission:atk.purchases.approve')
            ->name('complete');
    });

    // ATK Reports & Analytics
    Route::prefix('atk-reports')->name('atk-reports.')->middleware('permission:atk.reports')->group(function () {
        Route::get('/stock-card/{item}', [\App\Http\Controllers\AtkReportController::class, 'stockCard'])->name('stock-card');
        Route::get('/stock-card/{item}/pdf', [\App\Http\Controllers\AtkReportController::class, 'stockCardPdf'])->name('stock-card-pdf');
        Route::get('/monthly', [\App\Http\Controllers\AtkReportController::class, 'monthly'])->name('monthly');
        Route::get('/monthly/pdf', [\App\Http\Controllers\AtkReportController::class, 'monthlyPdf'])->name('monthly-pdf');
        Route::get('/monthly/excel', [\App\Http\Controllers\AtkReportController::class, 'monthlyExcel'])->name('monthly-excel');
        Route::get('/requests', [\App\Http\Controllers\AtkReportController::class, 'requests'])->name('requests');
        Route::get('/purchases', [\App\Http\Controllers\AtkReportController::class, 'purchases'])->name('purchases');
        Route::get('/distributions', [\App\Http\Controllers\AtkReportController::class, 'distributions'])->name('distributions');
        Route::get('/low-stock', [\App\Http\Controllers\AtkReportController::class, 'lowStock'])->name('low-stock');
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
