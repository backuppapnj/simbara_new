<?php

namespace App\Http\Controllers;

use App\Http\Requests\OfficeUsageRequest;
use App\Http\Requests\QuickDeductRequest;
use App\Models\OfficeMutation;
use App\Models\OfficeSupply;
use App\Models\OfficeUsage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OfficeUsageController extends Controller
{
    /**
     * Display a listing of the office usages.
     */
    public function index(): Response
    {
        $query = OfficeUsage::query()->with('supply', 'user');

        $dateFrom = request()->date('date_from');
        $dateTo = request()->date('date_to');

        if ($dateFrom) {
            $query->whereDate('tanggal', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('tanggal', '<=', $dateTo);
        }

        $usages = $query->latest('tanggal')
            ->paginate(20)
            ->withQueryString();

        $supplies = OfficeSupply::query()
            ->select('id', 'nama_barang', 'satuan', 'stok')
            ->orderBy('nama_barang')
            ->get();

        return Inertia::render('OfficeUsages/Index', [
            'usages' => $usages,
            'supplies' => $supplies,
            'filters' => [
                'date_from' => $dateFrom?->format('Y-m-d'),
                'date_to' => $dateTo?->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Store a newly created usage record.
     * Creates OfficeUsage record + OfficeMutation + updates stock.
     */
    public function store(OfficeUsageRequest $request): RedirectResponse
    {
        $supply = OfficeSupply::findOrFail($request->validated('supply_id'));

        return DB::transaction(function () use ($request, $supply) {
            $data = $request->validated();
            $data['user_id'] = auth()->id();

            // Create usage record
            $usage = OfficeUsage::create($data);

            // Create mutation
            $stokSebelum = $supply->stok;
            $supply->stok -= $data['jumlah'];
            $supply->save();

            OfficeMutation::create([
                'supply_id' => $supply->id,
                'jenis_mutasi' => 'keluar',
                'jumlah' => $data['jumlah'],
                'stok_sebelum' => $stokSebelum,
                'stok_sesudah' => $supply->stok,
                'tipe' => 'manual',
                'referensi_id' => $usage->id,
                'user_id' => auth()->id(),
                'keterangan' => $data['keperluan'] ?? 'Pemakaian manual',
            ]);

            return redirect()
                ->route('office-usages.index')
                ->with('success', 'Pemakaian berhasil dicatat.');
        });
    }

    /**
     * Quick deduct stock without creating full usage record.
     * Only creates OfficeMutation + updates stock.
     */
    public function quickDeduct(QuickDeductRequest $request): RedirectResponse
    {
        $supply = OfficeSupply::findOrFail($request->validated('supply_id'));

        return DB::transaction(function () use ($request, $supply) {
            $data = $request->validated();
            $jumlah = $data['jumlah'];

            // Create mutation only (no usage record)
            $stokSebelum = $supply->stok;
            $supply->stok -= $jumlah;
            $supply->save();

            OfficeMutation::create([
                'supply_id' => $supply->id,
                'jenis_mutasi' => 'keluar',
                'jumlah' => $jumlah,
                'stok_sebelum' => $stokSebelum,
                'stok_sesudah' => $supply->stok,
                'tipe' => 'quick_deduct',
                'user_id' => auth()->id(),
                'keterangan' => $data['keterangan'] ?? 'Quick deduct',
            ]);

            return redirect()
                ->route('office-supplies.index')
                ->with('success', 'Stok berhasil dikurangi.');
        });
    }
}
