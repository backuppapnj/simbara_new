<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\AtkReportFilterRequest;
use App\Models\Item;
use App\Services\AtkExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Response;

class AtkReportController extends Controller
{
    public function __construct(
        protected AtkExportService $exportService
    ) {}

    /**
     * Get stock card report for an item.
     */
    public function stockCard(Item $item, AtkReportFilterRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $data = $this->exportService->getStockCardData($item, $filters);

        return response()->json([
            'data' => [
                'item' => [
                    'id' => $data['item']->id,
                    'kode_barang' => $data['item']->kode_barang,
                    'nama_barang' => $data['item']->nama_barang,
                    'stok' => $data['item']->stok,
                    'satuan' => $data['item']->satuan,
                ],
                'mutations' => $data['mutations']->map(function ($mutation) {
                    return [
                        'id' => $mutation->id,
                        'jenis_mutasi' => $mutation->jenis_mutasi,
                        'jumlah' => $mutation->jumlah,
                        'stok_sebelum' => $mutation->stok_sebelum,
                        'stok_sesudah' => $mutation->stok_sesudah,
                        'referensi_id' => $mutation->referensi_id,
                        'referensi_tipe' => $mutation->referensi_tipe,
                        'keterangan' => $mutation->keterangan,
                        'created_at' => $mutation->created_at->format('d/m/Y H:i'),
                    ];
                }),
                'summary' => $data['summary'],
            ],
        ]);
    }

    /**
     * Get monthly summary report.
     */
    public function monthly(AtkReportFilterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $bulan = $validated['bulan'] ?? now()->month;
        $tahun = $validated['tahun'] ?? now()->year;

        $data = $this->exportService->getMonthlyReportData((int) $bulan, (int) $tahun);

        return response()->json([
            'data' => [
                'period' => [
                    'bulan' => $data['period']['bulan'],
                    'tahun' => $data['period']['tahun'],
                    'nama_bulan' => $data['period']['nama_bulan'],
                ],
                'summary' => $data['summary'],
                'purchases' => $data['purchases']->map(function ($purchase) {
                    return [
                        'id' => $purchase->id,
                        'no_pembelian' => $purchase->no_pembelian,
                        'tanggal' => $purchase->tanggal->format('d/m/Y'),
                        'supplier' => $purchase->supplier,
                        'total_nilai' => $purchase->total_nilai,
                        'status' => $purchase->status,
                    ];
                }),
                'requests' => $data['requests']->map(function ($request) {
                    return [
                        'id' => $request->id,
                        'no_permintaan' => $request->no_permintaan,
                        'tanggal' => $request->tanggal->format('d/m/Y'),
                        'user' => $request->user->name,
                        'department' => $request->department->nama_department,
                        'status' => $request->status,
                    ];
                }),
                'stock_opnames' => $data['stock_opnames']->map(function ($so) {
                    return [
                        'id' => $so->id,
                        'no_so' => $so->no_so,
                        'tanggal' => $so->tanggal->format('d/m/Y'),
                        'periode_bulan' => $so->periode_bulan,
                        'periode_tahun' => $so->periode_tahun,
                        'status' => $so->status,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Export stock card to PDF.
     */
    public function stockCardPdf(Item $item, AtkReportFilterRequest $request)
    {
        $filters = $request->validated();
        $pdf = $this->exportService->generateStockCardPdf($item, $filters);
        $filename = "kartu-stok-{$item->kode_barang}-".now()->format('Y-m-d').'.pdf';

        return Response::make($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ]);
    }

    /**
     * Export monthly report to PDF.
     */
    public function monthlyPdf(AtkReportFilterRequest $request)
    {
        $validated = $request->validated();

        $bulan = $validated['bulan'] ?? now()->month;
        $tahun = $validated['tahun'] ?? now()->year;

        $pdf = $this->exportService->generateMonthlyReportPdf((int) $bulan, (int) $tahun);
        $bulanNama = now()->setDate((int) $tahun, (int) $bulan, 1)->monthName;
        $filename = "laporan-atk-bulanan-{$bulanNama}-{$tahun}.pdf";

        return Response::make($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ]);
    }

    /**
     * Export monthly report to Excel (CSV).
     */
    public function monthlyExcel(AtkReportFilterRequest $request)
    {
        $validated = $request->validated();

        $bulan = $validated['bulan'] ?? now()->month;
        $tahun = $validated['tahun'] ?? now()->year;

        $csv = $this->exportService->exportMonthlyReportToCsv((int) $bulan, (int) $tahun);
        $bulanNama = now()->setDate((int) $tahun, (int) $bulan, 1)->monthName;
        $filename = "laporan-atk-bulanan-{$bulanNama}-{$tahun}.csv";

        return $this->exportService->downloadCsv($csv, $filename);
    }

    /**
     * Get request history report.
     */
    public function requests(AtkReportFilterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $startDate = $validated['start_date'] ?? now()->subDays(30)->format('Y-m-d');
        $endDate = $validated['end_date'] ?? now()->format('Y-m-d');

        $filters = [
            'user_id' => $validated['user_id'] ?? null,
            'department_id' => $validated['department_id'] ?? null,
            'status' => $validated['status'] ?? null,
        ];

        $requests = $this->exportService->getRequestHistoryData($startDate, $endDate, $filters);

        return response()->json([
            'data' => $requests->map(function ($request) {
                return [
                    'id' => $request->id,
                    'no_permintaan' => $request->no_permintaan,
                    'tanggal' => $request->tanggal->format('d/m/Y'),
                    'status' => $request->status,
                    'user' => $request->user->name,
                    'department' => $request->department->nama_department,
                    'items_count' => $request->requestDetails->count(),
                ];
            }),
        ]);
    }

    /**
     * Get purchase history report.
     */
    public function purchases(AtkReportFilterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $startDate = $validated['start_date'] ?? now()->subDays(30)->format('Y-m-d');
        $endDate = $validated['end_date'] ?? now()->format('Y-m-d');

        $filters = [
            'supplier' => $validated['supplier'] ?? null,
            'status' => $validated['status'] ?? null,
        ];

        $purchases = $this->exportService->getPurchaseHistoryData($startDate, $endDate, $filters);

        return response()->json([
            'data' => $purchases->map(function ($purchase) {
                return [
                    'id' => $purchase->id,
                    'no_pembelian' => $purchase->no_pembelian,
                    'tanggal' => $purchase->tanggal->format('d/m/Y'),
                    'supplier' => $purchase->supplier,
                    'total_nilai' => $purchase->total_nilai,
                    'status' => $purchase->status,
                ];
            }),
        ]);
    }

    /**
     * Get distribution report.
     */
    public function distributions(AtkReportFilterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $startDate = $validated['start_date'] ?? now()->subDays(30)->format('Y-m-d');
        $endDate = $validated['end_date'] ?? now()->format('Y-m-d');

        $distributions = $this->exportService->getDistributionData($startDate, $endDate);

        return response()->json([
            'data' => $distributions->map(function ($request) {
                return [
                    'id' => $request->id,
                    'no_permintaan' => $request->no_permintaan,
                    'tanggal' => $request->tanggal->format('d/m/Y'),
                    'distributed_at' => $request->distributed_at?->format('d/m/Y H:i'),
                    'user' => $request->user->name,
                    'department' => $request->department->nama_department,
                    'items_count' => $request->requestDetails->count(),
                ];
            }),
        ]);
    }

    /**
     * Get low stock items report.
     */
    public function lowStock(): JsonResponse
    {
        $items = $this->exportService->getLowStockItems();

        return response()->json([
            'data' => $items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'kode_barang' => $item->kode_barang,
                    'nama_barang' => $item->nama_barang,
                    'stok' => $item->stok,
                    'stok_minimal' => $item->stok_minimal,
                    'selisih' => $item->selisih,
                ];
            }),
        ]);
    }
}
