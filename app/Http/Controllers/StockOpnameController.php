<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStockOpnameRequest;
use App\Models\Item;
use App\Models\StockMutation;
use App\Models\StockOpname;
use App\Models\StockOpnameDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockOpnameController extends Controller
{
    /**
     * Display a listing of stock opnames.
     */
    public function index(Request $request)
    {
        $query = StockOpname::query()
            ->with(['stockOpnameDetails.item', 'approver'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('periode_bulan') && $request->periode_bulan) {
            $query->where('periode_bulan', $request->periode_bulan);
        }

        if ($request->has('periode_tahun') && $request->periode_tahun) {
            $query->where('periode_tahun', $request->periode_tahun);
        }

        $stockOpnames = $query->paginate(10);

        return Inertia::render('StockOpnames/Index', [
            'stockOpnames' => $stockOpnames,
            'filters' => $request->only(['status', 'periode_bulan', 'periode_tahun']),
        ]);
    }

    /**
     * Show the form for creating a new stock opname.
     */
    public function create()
    {
        $items = Item::query()
            ->orderBy('kategori')
            ->orderBy('nama_barang')
            ->get();

        return Inertia::render('StockOpnames/Create', [
            'items' => $items,
        ]);
    }

    /**
     * Store a newly created stock opname in storage.
     */
    public function store(StoreStockOpnameRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $stockOpname = StockOpname::create([
                'tanggal' => $request->tanggal,
                'periode_bulan' => $request->periode_bulan,
                'periode_tahun' => $request->periode_tahun,
                'keterangan' => $request->keterangan,
                'status' => 'draft',
            ]);

            foreach ($request->details as $detail) {
                StockOpnameDetail::create([
                    'stock_opname_id' => $stockOpname->id,
                    'item_id' => $detail['item_id'],
                    'stok_sistem' => $detail['stok_sistem'],
                    'stok_fisik' => $detail['stok_fisik'],
                    'keterangan' => $detail['keterangan'] ?? null,
                ]);
            }

            return redirect()->route('stock-opnames.show', $stockOpname)
                ->with('success', 'Stock opname berhasil dibuat.');
        });
    }

    /**
     * Display the specified stock opname.
     */
    public function show(StockOpname $stockOpname)
    {
        $stockOpname->load(['stockOpnameDetails.item', 'approver']);

        return Inertia::render('StockOpnames/Show', [
            'stockOpname' => $stockOpname,
        ]);
    }

    /**
     * Submit stock opname for approval.
     */
    public function submit(StockOpname $stockOpname)
    {
        if ($stockOpname->status !== 'draft') {
            abort(403, 'Hanya draft yang bisa disubmit.');
        }

        $stockOpname->update(['status' => 'completed']);

        return redirect()->route('stock-opnames.show', $stockOpname)
            ->with('success', 'Stock opname berhasil disubmit untuk approval.');
    }

    /**
     * Approve stock opname and adjust stock.
     */
    public function approve(Request $request, StockOpname $stockOpname)
    {
        if ($stockOpname->status !== 'completed') {
            abort(403, 'Hanya completed yang bisa diapprove.');
        }

        return DB::transaction(function () use ($request, $stockOpname) {
            $stockOpname->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);

            foreach ($stockOpname->stockOpnameDetails as $detail) {
                if ($detail->selisih !== 0) {
                    $item = $detail->item;

                    // Create stock mutation
                    StockMutation::create([
                        'item_id' => $item->id,
                        'jenis_mutasi' => 'adjustment',
                        'jumlah' => $detail->selisih,
                        'stok_sebelum' => $item->stok,
                        'stok_sesudah' => $item->stok + $detail->selisih,
                        'referensi_id' => $stockOpname->id,
                        'referensi_tipe' => 'stock_opname',
                        'keterangan' => "Penyesuaian stock opname {$stockOpname->no_so}",
                    ]);

                    // Update item stock
                    $item->increment('stok', $detail->selisih);
                }
            }

            return redirect()->route('stock-opnames.show', $stockOpname)
                ->with('success', 'Stock opname berhasil diapprove. Stok telah disesuaikan.');
        });
    }

    /**
     * Generate Berita Acara PDF.
     */
    public function generateBaPdf(StockOpname $stockOpname)
    {
        $stockOpname->load(['stockOpnameDetails.item', 'approver']);

        // For now, return a simple response
        // TODO: Implement PDF generation with dompdf or snappy
        return response()->json([
            'message' => 'PDF generation not yet implemented',
            'data' => $stockOpname,
        ]);
    }
}
