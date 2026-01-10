<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AtkRequest;
use App\Models\Item;
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
                'low_stock_items' => $this->getLowStockItems(),
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
     */
    protected function getTotalAssets(): int
    {
        return Asset::count();
    }

    /**
     * Get total ATK count.
     */
    protected function getTotalAtk(): int
    {
        return Item::count();
    }

    /**
     * Get pending requests count.
     */
    protected function getPendingRequests(): int
    {
        return AtkRequest::where('status', 'pending')->count();
    }

    /**
     * Get damaged assets count.
     */
    protected function getDamagedAssets(): int
    {
        return Asset::where('kondisi', 'rusak')->count();
    }

    /**
     * Get low stock items count.
     */
    protected function getLowStockItems(): int
    {
        return Item::whereColumn('stok', '<=', 'stok_minimal')->count();
    }

    /**
     * Get asset distribution by category.
     */
    protected function getAssetDistribution(): array
    {
        return Asset::query()
            ->selectRaw('kategori, COUNT(*) as count, SUM(harga_perolehan) as value')
            ->groupBy('kategori')
            ->get()
            ->map(fn ($item) => [
                'category' => $item->kategori ?? 'Lainnya',
                'count' => $item->count,
                'value' => (int) $item->value,
            ])
            ->toArray();
    }

    /**
     * Get monthly request trends.
     */
    protected function getMonthlyTrends(): array
    {
        // Get last 6 months of data
        return AtkRequest::query()
            ->selectRaw('DATE_FORMAT(tanggal, "%b") as month, COUNT(*) as requests, SUM(total_nilai) as expenditure')
            ->where('tanggal', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('tanggal')
            ->get()
            ->map(fn ($item) => [
                'month' => $item->month,
                'requests' => $item->requests,
                'expenditure' => (int) ($item->expenditure ?? 0),
            ])
            ->toArray();
    }
}
