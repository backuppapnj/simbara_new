<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\AssetReportFilterRequest;
use App\Services\AssetExportService;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;

class AssetReportController extends Controller
{
    public function __construct(
        protected AssetExportService $exportService
    ) {}

    /**
     * Display the reports index page.
     */
    public function index()
    {
        return Inertia::render('Assets/Reports');
    }

    /**
     * Export all assets in SAKTI/SIMAN format.
     */
    public function exportSaktiSiman(AssetReportFilterRequest $request)
    {
        $filters = $request->validated();
        $assets = $this->exportService->getAssetsWithFilters($filters);

        $csv = $this->exportService->exportAssetsToSaktiSimanFormat($assets);
        $filename = $this->exportService->generateFilename('sakti-siman');

        return $this->downloadCsv($csv, $filename);
    }

    /**
     * Export assets grouped by location.
     */
    public function exportByLocation(AssetReportFilterRequest $request)
    {
        $filters = $request->validated();
        $assets = $this->exportService->getAssetsWithFilters($filters);

        $csv = $this->exportService->exportByLocation($assets);
        $filename = $this->exportService->generateFilename('per-lokasi');

        return $this->downloadCsv($csv, $filename);
    }

    /**
     * Export assets grouped by category (14-digit Kemenkeu).
     */
    public function exportByCategory(AssetReportFilterRequest $request)
    {
        $filters = $request->validated();
        $assets = $this->exportService->getAssetsWithFilters($filters);

        $csv = $this->exportService->exportByCategory($assets);
        $filename = $this->exportService->generateFilename('per-kategori');

        return $this->downloadCsv($csv, $filename);
    }

    /**
     * Export assets grouped by condition.
     */
    public function exportByCondition(AssetReportFilterRequest $request)
    {
        $filters = $request->validated();
        $assets = $this->exportService->getAssetsWithFilters($filters);

        $csv = $this->exportService->exportByCondition($assets);
        $filename = $this->exportService->generateFilename('per-kondisi');

        return $this->downloadCsv($csv, $filename);
    }

    /**
     * Export maintenance history.
     */
    public function exportMaintenanceHistory(AssetReportFilterRequest $request)
    {
        $filters = $request->validated();
        $maintenances = $this->exportService->getMaintenanceHistoryWithFilters($filters);

        $csv = $this->exportService->exportMaintenanceHistory($maintenances);
        $filename = $this->exportService->generateFilename('riwayat-perawatan');

        return $this->downloadCsv($csv, $filename);
    }

    /**
     * Export asset value summary per category.
     */
    public function exportValueSummary(AssetReportFilterRequest $request)
    {
        $filters = $request->validated();
        $assets = $this->exportService->getAssetsWithFilters($filters);

        $csv = $this->exportService->exportValueSummary($assets);
        $filename = $this->exportService->generateFilename('ringkasan-nilai');

        return $this->downloadCsv($csv, $filename);
    }

    /**
     * Get report data for preview (JSON response).
     */
    public function preview(AssetReportFilterRequest $request)
    {
        $reportType = $request->input('report_type', 'sakti_siman');
        $filters = $request->validated();

        return match ($reportType) {
            'by_location' => $this->previewByLocation($filters),
            'by_category' => $this->previewByCategory($filters),
            'by_condition' => $this->previewByCondition($filters),
            'maintenance_history' => $this->previewMaintenanceHistory($filters),
            'value_summary' => $this->previewValueSummary($filters),
            default => $this->previewSaktiSiman($filters),
        };
    }

    /**
     * Preview SAKTI/SIMAN format report.
     */
    protected function previewSaktiSiman(array $filters)
    {
        $assets = $this->exportService->getAssetsWithFilters($filters);

        return response()->json([
            'data' => $assets->take(50),
            'total' => $assets->count(),
            'report_type' => 'SAKTI/SIMAN Format',
        ]);
    }

    /**
     * Preview by location report.
     */
    protected function previewByLocation(array $filters)
    {
        $assets = $this->exportService->getAssetsWithFilters($filters);
        $grouped = $assets->sortBy('lokasi_ruang')->groupBy('lokasi_ruang');

        $summary = $grouped->map(function ($locationAssets, $location) {
            return [
                'location' => $location,
                'count' => $locationAssets->count(),
                'total_value' => $locationAssets->sum('rph_aset'),
            ];
        })->values();

        return response()->json([
            'summary' => $summary,
            'total' => $assets->count(),
            'report_type' => 'Per Lokasi',
        ]);
    }

    /**
     * Preview by category report.
     */
    protected function previewByCategory(array $filters)
    {
        $assets = $this->exportService->getAssetsWithFilters($filters);
        $grouped = $assets->sortBy('kd_brg')->groupBy('kd_brg');

        $summary = $grouped->map(function ($categoryAssets, $category) {
            return [
                'category' => $category,
                'description' => $categoryAssets->first()?->ur_sskel,
                'count' => $categoryAssets->count(),
                'total_value' => $categoryAssets->sum('rph_aset'),
            ];
        })->values();

        return response()->json([
            'summary' => $summary,
            'total' => $assets->count(),
            'report_type' => 'Per Kategori',
        ]);
    }

    /**
     * Preview by condition report.
     */
    protected function previewByCondition(array $filters)
    {
        $assets = $this->exportService->getAssetsWithFilters($filters);
        $grouped = $assets->sortBy('ur_kondisi')->groupBy('ur_kondisi');

        $summary = $grouped->map(function ($conditionAssets, $condition) {
            return [
                'condition' => $condition,
                'count' => $conditionAssets->count(),
                'total_value' => $conditionAssets->sum('rph_aset'),
            ];
        })->values();

        return response()->json([
            'summary' => $summary,
            'total' => $assets->count(),
            'report_type' => 'Per Kondisi',
        ]);
    }

    /**
     * Preview maintenance history report.
     */
    protected function previewMaintenanceHistory(array $filters)
    {
        $maintenances = $this->exportService->getMaintenanceHistoryWithFilters($filters);

        return response()->json([
            'data' => $maintenances->take(50),
            'total' => $maintenances->count(),
            'total_cost' => $maintenances->sum('biaya'),
            'report_type' => 'Riwayat Perawatan',
        ]);
    }

    /**
     * Preview value summary report.
     */
    protected function previewValueSummary(array $filters)
    {
        $assets = $this->exportService->getAssetsWithFilters($filters);
        $grouped = $assets->sortBy('kd_brg')->groupBy('kd_brg');

        $summary = $grouped->map(function ($categoryAssets, $category) {
            $count = $categoryAssets->count();
            $totalNilaiAset = $categoryAssets->sum('rph_aset');
            $totalNilaiBuku = $categoryAssets->sum('rph_buku');
            $avgNilai = $count > 0 ? $totalNilaiAset / $count : 0;

            return [
                'category' => $category,
                'description' => $categoryAssets->first()?->ur_sskel,
                'count' => $count,
                'total_nilai_aset' => $totalNilaiAset,
                'total_nilai_buku' => $totalNilaiBuku,
                'avg_nilai' => $avgNilai,
            ];
        })->values();

        return response()->json([
            'summary' => $summary,
            'total_assets' => $assets->count(),
            'total_value' => $assets->sum('rph_aset'),
            'report_type' => 'Ringkasan Nilai',
        ]);
    }

    /**
     * Download CSV file.
     */
    protected function downloadCsv(string $content, string $filename)
    {
        return Response::make($content, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ]);
    }
}
