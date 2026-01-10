<?php

namespace App\Http\Controllers;

use App\Http\Requests\ItemRequest;
use App\Models\Item;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    /**
     * Display a listing of the items.
     */
    public function index(): Response
    {
        $query = Item::query()->with('stockMutations');

        $search = request()->string('search')->trim();
        $kategori = request()->string('kategori')->trim();

        if ($search->isNotEmpty()) {
            $query->where('nama_barang', 'like', "%{$search}%")
                ->orWhere('kode_barang', 'like', "%{$search}%");
        }

        if ($kategori->isNotEmpty()) {
            $query->where('kategori', $kategori);
        }

        $items = $query->orderBy('nama_barang')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('items/Index', [
            'items' => $items,
            'filters' => [
                'search' => $search->toString(),
                'kategori' => $kategori->toString(),
            ],
        ]);
    }

    /**
     * Store a newly created item in storage.
     */
    public function store(ItemRequest $request): RedirectResponse
    {
        $item = Item::create($request->validated());

        return redirect()
            ->route('items.index')
            ->with('success', "Item {$item->nama_barang} berhasil ditambahkan.");
    }

    /**
     * Update the specified item in storage.
     */
    public function update(ItemRequest $request, Item $item): RedirectResponse
    {
        $item->update($request->validated());

        return redirect()
            ->route('items.index')
            ->with('success', "Item {$item->nama_barang} berhasil diperbarui.");
    }

    /**
     * Remove the specified item from storage.
     */
    public function destroy(Item $item): RedirectResponse
    {
        $item->delete();

        return redirect()
            ->route('items.index')
            ->with('success', 'Item berhasil dihapus.');
    }

    /**
     * Display stock mutations for the specified item.
     */
    public function mutations(Item $item): Response
    {
        $query = $item->stockMutations()->latest();

        $jenis = request()->string('jenis')->trim();
        if ($jenis->isNotEmpty() && in_array($jenis->toString(), ['masuk', 'keluar', 'adjustment'])) {
            $query->where('jenis_mutasi', $jenis->toString());
        }

        $mutations = $query->paginate(20)->withQueryString();

        return Inertia::render('items/Mutations', [
            'item' => $item,
            'mutations' => $mutations,
            'filters' => [
                'jenis' => $jenis->toString(),
            ],
        ]);
    }
}
