<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AtkRequest;
use App\Models\Item;
use App\Models\Purchase;
use App\Models\StockMutation;
use App\Models\StockOpname;
use Dompdf\Dompdf;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Response;

class AtkExportService
{
    /**
     * Get items with filters for stock card report.
     */
    public function getStockCardData(Item $item, ?array $filters = []): array
    {
        $query = StockMutation::query()
            ->where('item_id', $item->id)
            ->with('item');

        // Apply filters
        if (isset($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }
        if (isset($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }
        if (isset($filters['jenis_mutasi'])) {
            $query->where('jenis_mutasi', $filters['jenis_mutasi']);
        }

        $mutations = $query->latest()->get();

        // Calculate summary
        $summary = [
            'total_mutations' => $mutations->count(),
            'total_masuk' => $mutations->where('jenis_mutasi', 'masuk')->sum('jumlah'),
            'total_keluar' => $mutations->where('jenis_mutasi', 'keluar')->sum('jumlah'),
            'total_adjustment' => $mutations->where('jenis_mutasi', 'adjustment')->sum('jumlah'),
        ];

        return [
            'item' => $item,
            'mutations' => $mutations,
            'summary' => $summary,
        ];
    }

    /**
     * Get monthly report data.
     */
    public function getMonthlyReportData(int $bulan, int $tahun): array
    {
        $startDate = now()->setDate($tahun, $bulan, 1)->startOfDay();
        $endDate = $startDate->copy()->endOfMonth()->endOfDay();

        // Get purchases
        $purchases = Purchase::query()
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->where('status', 'completed')
            ->with(['purchaseDetails.item'])
            ->get();

        // Get requests
        $requests = AtkRequest::query()
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->with(['user', 'department', 'requestDetails.item'])
            ->get();

        // Get stock opnames
        $stockOpnames = StockOpname::query()
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->with(['stockOpnameDetails.item'])
            ->get();

        // Calculate summary
        $summary = [
            'total_purchases' => $purchases->count(),
            'total_purchase_value' => $purchases->sum('total_nilai'),
            'total_requests' => $requests->count(),
            'total_requests_approved' => $requests->where('status', 'diterima')->count(),
            'total_stock_opnames' => $stockOpnames->count(),
        ];

        return [
            'period' => [
                'bulan' => $bulan,
                'tahun' => $tahun,
                'nama_bulan' => $startDate->monthName,
            ],
            'summary' => $summary,
            'purchases' => $purchases,
            'requests' => $requests,
            'stock_opnames' => $stockOpnames,
        ];
    }

    /**
     * Get request history data.
     */
    public function getRequestHistoryData(string $startDate, string $endDate, ?array $filters = []): Collection
    {
        $query = AtkRequest::query()
            ->with(['user', 'department', 'requestDetails'])
            ->whereBetween('tanggal', [$startDate, $endDate]);

        // Apply filters
        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }
        if (isset($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->get();
    }

    /**
     * Get purchase history data.
     */
    public function getPurchaseHistoryData(string $startDate, string $endDate, ?array $filters = []): Collection
    {
        $query = Purchase::query()
            ->with(['purchaseDetails.item'])
            ->whereBetween('tanggal', [$startDate, $endDate]);

        // Apply filters
        if (isset($filters['supplier'])) {
            $query->where('supplier', 'like', '%'.$filters['supplier'].'%');
        }
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->get();
    }

    /**
     * Get distribution data.
     */
    public function getDistributionData(string $startDate, string $endDate): Collection
    {
        return AtkRequest::query()
            ->with(['user', 'department', 'requestDetails'])
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->whereIn('status', ['diserahkan', 'diterima'])
            ->latest()
            ->get();
    }

    /**
     * Get low stock items.
     */
    public function getLowStockItems(): Collection
    {
        return Item::query()
            ->whereColumn('stok', '<=', 'stok_minimal')
            ->get()
            ->map(function ($item) {
                $item->selisih = $item->stok_minimal - $item->stok;

                return $item;
            });
    }

    /**
     * Generate stock card PDF.
     */
    public function generateStockCardPdf(Item $item, ?array $filters = []): string
    {
        $data = $this->getStockCardData($item, $filters);

        $html = view('reports.atk.stock-card-pdf', $data)->render();

        $dompdf = new Dompdf;
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }

    /**
     * Generate monthly report PDF.
     */
    public function generateMonthlyReportPdf(int $bulan, int $tahun): string
    {
        $data = $this->getMonthlyReportData($bulan, $tahun);

        $html = view('reports.atk.monthly-pdf', $data)->render();

        $dompdf = new Dompdf;
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }

    /**
     * Export monthly report to CSV.
     */
    public function exportMonthlyReportToCsv(int $bulan, int $tahun): string
    {
        $data = $this->getMonthlyReportData($bulan, $tahun);
        $rows = [];

        // Header
        $rows[] = [
            'LAPORAN BULANAN ATK',
            '',
            '',
            '',
            '',
        ];
        $rows[] = [
            'Periode',
            $data['period']['nama_bulan'].' '.$data['period']['tahun'],
            '',
            '',
            '',
        ];
        $rows[] = [];

        // Summary
        $rows[] = ['RINGKASAN'];
        $rows[] = [
            'Total Pembelian',
            $data['summary']['total_purchases'],
        ];
        $rows[] = [
            'Total Nilai Pembelian',
            'Rp '.number_format($data['summary']['total_purchase_value'], 2, ',', '.'),
        ];
        $rows[] = [
            'Total Permintaan',
            $data['summary']['total_requests'],
        ];
        $rows[] = [
            'Total Permintaan Disetujui',
            $data['summary']['total_requests_approved'],
        ];
        $rows[] = [];

        // Purchases
        $rows[] = ['PEMBELIAN'];
        $rows[] = ['No', 'No Pembelian', 'Tanggal', 'Supplier', 'Total Nilai', 'Status'];

        foreach ($data['purchases'] as $index => $purchase) {
            $rows[] = [
                $index + 1,
                $purchase->no_pembelian,
                $purchase->tanggal->format('d/m/Y'),
                $purchase->supplier,
                'Rp '.number_format($purchase->total_nilai, 2, ',', '.'),
                $purchase->status,
            ];
        }

        $rows[] = [];

        // Requests
        $rows[] = ['PERMINTAAN'];
        $rows[] = ['No', 'No Permintaan', 'Tanggal', 'Pemohon', 'Departemen', 'Status'];

        foreach ($data['requests'] as $index => $request) {
            $rows[] = [
                $index + 1,
                $request->no_permintaan,
                $request->tanggal->format('d/m/Y'),
                $request->user->name,
                $request->department->nama_department,
                $request->status,
            ];
        }

        // Generate CSV
        $csv = "\xEF\xBB\xBF"; // UTF-8 BOM
        foreach ($rows as $row) {
            $csv .= implode(',', array_map(function ($cell) {
                return '"'.str_replace('"', '""', $cell).'"';
            }, $row))."\n";
        }

        return $csv;
    }

    /**
     * Generate filename for export.
     */
    public function generateFilename(string $type, ?string $suffix = null): string
    {
        $date = now()->format('Y-m-d_His');
        $filename = "laporan-atk-{$type}-{$date}";

        if ($suffix) {
            $filename .= "-{$suffix}";
        }

        return $filename.'.csv';
    }

    /**
     * Download CSV file.
     */
    public function downloadCsv(string $content, string $filename)
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
