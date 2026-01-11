<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReceivePurchaseRequest;
use App\Http\Requests\StorePurchaseRequest;
use App\Models\Item;
use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\StockMutation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    /**
     * Display a listing of purchases.
     */
    public function index(): Response
    {
        $status = request()->query('status');

        $purchases = Purchase::query()
            ->with(['purchaseDetails.item'])
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(20);

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new purchase.
     */
    public function create(): Response
    {
        $items = Item::select('id', 'kode_barang', 'nama_barang', 'satuan', 'harga_rata_rata')
            ->orderBy('nama_barang')
            ->get();

        return Inertia::render('Purchases/Create', [
            'items' => $items,
        ]);
    }

    /**
     * Store a newly created purchase in storage.
     */
    public function store(StorePurchaseRequest $request): RedirectResponse
    {
        return DB::transaction(function () use ($request) {
            $items = $request->validated('items');
            $totalNilai = collect($items)->sum(function ($item) {
                return $item['jumlah'] * $item['harga_satuan'];
            });

            $purchase = Purchase::create([
                'tanggal' => $request->validated('tanggal'),
                'supplier' => $request->validated('supplier'),
                'keterangan' => $request->validated('keterangan'),
                'total_nilai' => $totalNilai,
                'status' => 'draft',
            ]);

            foreach ($items as $item) {
                PurchaseDetail::create([
                    'purchase_id' => $purchase->id,
                    'item_id' => $item['item_id'],
                    'jumlah' => $item['jumlah'],
                    'harga_satuan' => $item['harga_satuan'],
                    'subtotal' => $item['jumlah'] * $item['harga_satuan'],
                ]);
            }

            return redirect()->route('purchases.show', $purchase)
                ->with('success', 'Purchase created successfully.');
        });
    }

    /**
     * Display the specified purchase.
     */
    public function show(Purchase $purchase): Response
    {
        $purchase->load(['purchaseDetails.item']);

        return Inertia::render('Purchases/Show', [
            'purchase' => $purchase,
        ]);
    }

    /**
     * Receive the purchase goods.
     */
    public function receive(Purchase $purchase, ReceivePurchaseRequest $request): RedirectResponse
    {
        $this->authorizeReceive($purchase);

        return DB::transaction(function () use ($request, $purchase) {
            $items = $request->validated('items');

            foreach ($items as $item) {
                $detail = PurchaseDetail::findOrFail($item['purchase_detail_id']);

                // Ensure the detail belongs to this purchase
                if ($detail->purchase_id !== $purchase->id) {
                    abort(403, 'Purchase detail does not belong to this purchase.');
                }

                $detail->update([
                    'jumlah_diterima' => $item['jumlah_diterima'],
                ]);
            }

            $purchase->update(['status' => 'received']);

            return redirect()->route('purchases.show', $purchase)
                ->with('success', 'Goods received successfully.');
        });
    }

    /**
     * Complete the purchase and update stock.
     */
    public function complete(Purchase $purchase): RedirectResponse
    {
        $this->authorizeComplete($purchase);

        return DB::transaction(function () use ($purchase) {
            $purchase->load('purchaseDetails.item');

            foreach ($purchase->purchaseDetails as $detail) {
                // Use jumlah_diterima if available, otherwise use jumlah
                $jumlahDiterima = $detail->jumlah_diterima ?? $detail->jumlah;

                if ($jumlahDiterima <= 0) {
                    continue; // Skip if no items received
                }

                $item = $detail->item;
                $stokSebelum = $item->stok;
                $stokSesudah = $stokSebelum + $jumlahDiterima;

                // Create stock mutation
                StockMutation::create([
                    'id' => (string) Str::ulid(),
                    'item_id' => $item->id,
                    'jenis_mutasi' => 'masuk',
                    'jumlah' => $jumlahDiterima,
                    'stok_sebelum' => $stokSebelum,
                    'stok_sesudah' => $stokSesudah,
                    'referensi_id' => $purchase->id,
                    'referensi_tipe' => 'purchase',
                    'keterangan' => "Pembelian {$purchase->no_pembelian} dari {$purchase->supplier}",
                ]);

                // Update item stock
                $item->update([
                    'stok' => $stokSesudah,
                ]);

                // Update harga_beli_terakhir
                $item->update([
                    'harga_beli_terakhir' => $detail->harga_satuan,
                ]);

                // Calculate and update harga_rata_rata (weighted average)
                $totalNilaiBaru = $stokSebelum * $item->harga_rata_rata;
                $totalNilaiBeli = $jumlahDiterima * $detail->harga_satuan;
                $totalStok = $stokSesudah;

                if ($totalStok > 0) {
                    $hargaRataRataBaru = ($totalNilaiBaru + $totalNilaiBeli) / $totalStok;
                    $item->update([
                        'harga_rata_rata' => $hargaRataRataBaru,
                    ]);
                }
            }

            $purchase->update(['status' => 'completed']);

            return redirect()->route('purchases.show', $purchase)
                ->with('success', 'Purchase completed and stock updated successfully.');
        });
    }

    /**
     * Authorize receive action.
     */
    protected function authorizeReceive(Purchase $purchase): void
    {
        if (! in_array($purchase->status, ['draft', 'received'])) {
            abort(403, 'Only draft or received purchases can be marked as received.');
        }
    }

    /**
     * Authorize complete action.
     */
    protected function authorizeComplete(Purchase $purchase): void
    {
        if ($purchase->status !== 'received') {
            abort(403, 'Only received purchases can be completed.');
        }
    }
}
