<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Asset;
use App\Models\AtkRequest;
use App\Models\Item;
use App\Models\NotificationLog;
use App\Models\OfficeRequest;
use App\Models\OfficeSupply;
use App\Models\StockOpname;
use App\Policies\AssetPolicy;
use App\Policies\AtkRequestPolicy;
use App\Policies\ItemPolicy;
use App\Policies\NotificationLogPolicy;
use App\Policies\OfficeRequestPolicy;
use App\Policies\OfficeSupplyPolicy;
use App\Policies\StockOpnamePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Asset::class => AssetPolicy::class,
        AtkRequest::class => AtkRequestPolicy::class,
        Item::class => ItemPolicy::class,
        NotificationLog::class => NotificationLogPolicy::class,
        OfficeRequest::class => OfficeRequestPolicy::class,
        OfficeSupply::class => OfficeSupplyPolicy::class,
        StockOpname::class => StockOpnamePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        //
    }
}
