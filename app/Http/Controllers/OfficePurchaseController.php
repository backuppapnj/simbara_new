<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOfficePurchaseRequest;
use App\Http\Resources\OfficePurchaseCollection;
use App\Http\Resources\OfficePurchaseResource;
use App\Models\OfficeMutation;
use App\Models\OfficePurchase;
use App\Models\OfficePurchaseDetail;
use App\Models\OfficeSupply;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OfficePurchaseController extends Controller
{
    /**
     * Display a listing of the purchases.
     */
    public function index(Request $request): OfficePurchaseCollection
    {
        $query = OfficePurchase::query()->with(['details.supply']);

        // Filter by date range if provided
        if ($request->has('tanggal_from') && $request->has('tanggal_to')) {
            $query->whereBetween('tanggal', [$request->tanggal_from, $request->tanggal_to]);
        }

        $purchases = $query->latest()->paginate(20);

        return new OfficePurchaseCollection($purchases);
    }

    /**
     * Store a newly created purchase in storage.
     * Creates purchase, purchase details, updates stock, and creates mutations.
     */
    public function store(StoreOfficePurchaseRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $purchase = DB::transaction(function () use ($validated) {
            $user = auth()->user();

            // Calculate total value
            $totalNilai = collect($validated['items'])->sum(function ($item) {
                return $item['subtotal'] ?? 0;
            });

            // Create the main purchase
            $purchase = OfficePurchase::create([
                'tanggal' => $validated['tanggal'],
                'supplier' => $validated['supplier'],
                'total_nilai' => $totalNilai,
                'keterangan' => $validated['keterangan'] ?? null,
            ]);

            // Create purchase details and update stock
            foreach ($validated['items'] as $item) {
                $supply = OfficeSupply::findOrFail($item['supply_id']);
                $stokSebelum = $supply->stok;
                $stokSesudah = $stokSebelum + $item['jumlah'];

                // Create purchase detail
                OfficePurchaseDetail::create([
                    'purchase_id' => $purchase->id,
                    'supply_id' => $item['supply_id'],
                    'jumlah' => $item['jumlah'],
                    'subtotal' => $item['subtotal'] ?? null,
                ]);

                // Update stock
                $supply->update(['stok' => $stokSesudah]);

                // Create mutation
                OfficeMutation::create([
                    'supply_id' => $item['supply_id'],
                    'jenis_mutasi' => 'masuk',
                    'jumlah' => $item['jumlah'],
                    'stok_sebelum' => $stokSebelum,
                    'stok_sesudah' => $stokSesudah,
                    'tipe' => 'pembelian',
                    'referensi_id' => $purchase->id,
                    'user_id' => $user->id,
                    'keterangan' => "Pembelian dari {$validated['supplier']}",
                ]);
            }

            return $purchase;
        });

        return (new OfficePurchaseResource($purchase->load(['details.supply'])))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified purchase.
     */
    public function show(OfficePurchase $officePurchase): OfficePurchaseResource
    {
        $officePurchase->load(['details.supply']);

        return new OfficePurchaseResource($officePurchase);
    }
}
