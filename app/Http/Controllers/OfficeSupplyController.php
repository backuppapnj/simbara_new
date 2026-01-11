<?php

namespace App\Http\Controllers;

use App\Http\Requests\OfficeSupplyRequest;
use App\Models\OfficeSupply;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OfficeSupplyController extends Controller
{
    /**
     * Display a listing of the office supplies.
     */
    public function index(): Response
    {
        $query = OfficeSupply::query()->with('mutations');

        $search = request()->string('search')->trim();
        $kategori = request()->string('kategori')->trim();

        if ($search->isNotEmpty()) {
            $query->where('nama_barang', 'like', "%{$search}%");
        }

        if ($kategori->isNotEmpty()) {
            $query->where('kategori', $kategori);
        }

        $supplies = $query->orderBy('nama_barang')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('officeSupplies/Index', [
            'supplies' => $supplies,
            'filters' => [
                'search' => $search->toString(),
                'kategori' => $kategori->toString(),
            ],
        ]);
    }

    /**
     * Store a newly created office supply in storage.
     */
    public function store(OfficeSupplyRequest $request): RedirectResponse
    {
        $supply = OfficeSupply::create($request->validated());

        return redirect()
            ->route('office-supplies.index')
            ->with('success', "Bahan kantor {$supply->nama_barang} berhasil ditambahkan.");
    }

    /**
     * Update the specified office supply in storage.
     */
    public function update(OfficeSupplyRequest $request, OfficeSupply $office_supply): RedirectResponse
    {
        $office_supply->update($request->validated());

        return redirect()
            ->route('office-supplies.index')
            ->with('success', "Bahan kantor {$office_supply->nama_barang} berhasil diperbarui.");
    }

    /**
     * Remove the specified office supply from storage.
     */
    public function destroy(OfficeSupply $office_supply): RedirectResponse
    {
        $office_supply->delete();

        return redirect()
            ->route('office-supplies.index')
            ->with('success', 'Bahan kantor berhasil dihapus.');
    }

    /**
     * Display stock mutations for the specified office supply.
     */
    public function mutations(OfficeSupply $office_supply): Response
    {
        $query = $office_supply->mutations()->latest();

        $jenis = request()->string('jenis')->trim();
        if ($jenis->isNotEmpty() && in_array($jenis->toString(), ['masuk', 'keluar'])) {
            $query->where('jenis_mutasi', $jenis->toString());
        }

        $mutations = $query->paginate(20)->withQueryString();

        return Inertia::render('officeSupplies/Mutations', [
            'supply' => $office_supply,
            'mutations' => $mutations,
            'filters' => [
                'jenis' => $jenis->toString(),
            ],
        ]);
    }
}
