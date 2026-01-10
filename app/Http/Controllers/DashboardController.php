<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with summary statistics and charts.
     */
    public function __invoke(Request $request)
    {
        return Inertia::render('dashboard', [
            // Immediate data for welcome section
            'user' => [
                'name' => $request->user()?->name ?? 'Guest',
                'email' => $request->user()?->email,
            ],

            // Deferred props for summary cards (load after initial render)
            'summary' => Inertia::defer(fn () => [
                'total_assets' => $this->getTotalAssets(),
                'total_atk' => $this->getTotalAtk(),
                'pending_requests' => $this->getPendingRequests(),
                'damaged_assets' => $this->getDamagedAssets(),
            ]),

            // Deferred props for charts (load when visible)
            'charts' => Inertia::defer(fn () => [
                'asset_distribution' => $this->getAssetDistribution(),
                'monthly_trends' => $this->getMonthlyTrends(),
            ]),
        ]);
    }

    /**
     * Get total assets count.
     * TODO: Replace with actual database query when Asset model exists.
     */
    protected function getTotalAssets(): int
    {
        return 0;
    }

    /**
     * Get total ATK count.
     * TODO: Replace with actual database query when ATK model exists.
     */
    protected function getTotalAtk(): int
    {
        return 0;
    }

    /**
     * Get pending requests count.
     * TODO: Replace with actual database query when Request model exists.
     */
    protected function getPendingRequests(): int
    {
        return 0;
    }

    /**
     * Get damaged assets count.
     * TODO: Replace with actual database query when Asset model exists.
     */
    protected function getDamagedAssets(): int
    {
        return 0;
    }

    /**
     * Get asset distribution by category.
     * TODO: Replace with actual database query when Asset model exists.
     */
    protected function getAssetDistribution(): array
    {
        return [
            ['category' => 'Elektronik', 'count' => 0, 'value' => 0],
            ['category' => 'Furniture', 'count' => 0, 'value' => 0],
            ['category' => 'Kendaraan', 'count' => 0, 'value' => 0],
            ['category' => 'Lainnya', 'count' => 0, 'value' => 0],
        ];
    }

    /**
     * Get monthly request trends.
     * TODO: Replace with actual database query when Request model exists.
     */
    protected function getMonthlyTrends(): array
    {
        return [
            ['month' => 'Jan', 'requests' => 0, 'expenditure' => 0],
            ['month' => 'Feb', 'requests' => 0, 'expenditure' => 0],
            ['month' => 'Mar', 'requests' => 0, 'expenditure' => 0],
            ['month' => 'Apr', 'requests' => 0, 'expenditure' => 0],
            ['month' => 'Mei', 'requests' => 0, 'expenditure' => 0],
            ['month' => 'Jun', 'requests' => 0, 'expenditure' => 0],
        ];
    }
}
