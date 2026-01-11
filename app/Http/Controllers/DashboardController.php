<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AtkRequest;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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
        return Asset::where('ur_kondisi', 'rusak')->count();
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
            ->selectRaw('ur_sskel, COUNT(*) as count, SUM(rph_perolehan) as value')
            ->groupBy('ur_sskel')
            ->get()
            ->map(fn ($item) => [
                'category' => $item->ur_sskel ?? 'Lainnya',
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
        // Get last 6 months of data using MySQL DATE_FORMAT
        $data = AtkRequest::query()
            ->selectRaw('DATE_FORMAT(tanggal, "%Y-%m") as year_month, COUNT(*) as requests')
            ->where('tanggal', '>=', now()->subMonths(6))
            ->groupBy('year_month')
            ->orderBy('year_month')
            ->get();

        // Calculate expenditure by summing up request details with item prices
        $requests = AtkRequest::query()
            ->with(['requestDetails.item'])
            ->where('tanggal', '>=', now()->subMonths(6))
            ->get()
            ->groupBy(fn ($request) => $request->tanggal->format('Y-m'));

        // Format month names in PHP using Carbon and calculate expenditure
        return $data->map(fn ($item) => [
            'month' => $item->year_month ? Carbon::parse($item->year_month.'-01')->format('M') : '',
            'requests' => $item->requests,
            'expenditure' => (int) ($requests->get($item->year_month)?->sum(fn ($request) => $request->requestDetails->sum(fn ($detail) => ($detail->jumlah_diberikan ?? $detail->jumlah_disetujui ?? $detail->jumlah_diminta) * ($detail->item?->harga_rata_rata ?? 0)
            )
            ) ?? 0),
        ])->toArray();
    }
}
