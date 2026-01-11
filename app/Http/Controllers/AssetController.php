<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ImportAssetRequest;
use App\Http\Requests\StoreAssetPhotoRequest;
use App\Http\Requests\StoreMaintenanceRequest;
use App\Http\Requests\UpdateAssetPhotoRequest;
use App\Http\Requests\UpdateLocationRequest;
use App\Http\Requests\UpdateMaintenanceRequest;
use App\Models\Asset;
use App\Models\AssetMaintenance;
use App\Models\AssetPhoto;
use App\Models\Location;
use App\Services\AssetImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class AssetController extends Controller
{
    public function __construct(
        protected AssetImportService $importService
    ) {}

    /**
     * Display the import page.
     */
    public function import()
    {
        return Inertia::render('Assets/Import');
    }

    /**
     * Process the import file.
     */
    public function processImport(ImportAssetRequest $request)
    {
        try {
            // Upload and get file content
            $file = $request->validated()['json_file'];
            $content = file_get_contents($file->getRealPath());
            $jsonData = json_decode($content, true, 512, JSON_THROW_ON_ERROR);

            // Get preview
            $preview = $this->importService->getPreview($jsonData);
            $metadata = $this->importService->getMetadata($jsonData);

            return back()->with([
                'preview' => $preview,
                'metadata' => $metadata,
                'data' => $jsonData,
                'success' => 'File berhasil diparse. Silakan konfirmasi untuk import.',
            ]);
        } catch (\JsonException $e) {
            return back()->withErrors([
                'json_file' => 'Format JSON tidak valid: '.$e->getMessage(),
            ]);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors([
                'json_file' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'json_file' => 'Terjadi kesalahan: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Confirm and execute the import.
     */
    public function confirmImport(Request $request)
    {
        $request->validate([
            'data' => ['required', 'array'],
        ]);

        try {
            $result = $this->importService->import($request->input('data'));

            return back()->with([
                'import_result' => $result,
                'success' => "Import selesai: {$result['success']} berhasil, {$result['errors']} gagal.",
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'import' => 'Gagal melakukan import: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Display a listing of the assets.
     */
    public function index(Request $request)
    {
        $query = Asset::query()->with(['location', 'penanggungJawab']);

        // Search
        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        // Filter by condition
        if ($request->filled('kondisi')) {
            $query->byCondition($request->input('kondisi'));
        }

        // Filter by location
        if ($request->filled('lokasi')) {
            $query->byLocation($request->input('lokasi'));
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->byStatus($request->input('status'));
        }

        // Sort
        $sortField = $request->input('sort', 'nama');
        $sortDirection = $request->input('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        // Paginate
        $assets = $query->paginate(50);

        // Get filter options
        $locations = Cache::remember('locations-list', 3600, function () {
            return Location::orderBy('nama_ruangan')->get(['id', 'nama_ruangan', 'gedung', 'lantai']);
        });

        $kondisiOptions = [
            ['value' => '1', 'label' => 'Baik'],
            ['value' => '2', 'label' => 'Rusak Ringan'],
            ['value' => '3', 'label' => 'Rusak Berat'],
        ];

        $statusOptions = [
            ['value' => '01', 'label' => 'Di atas kertas'],
            ['value' => '02', 'label' => 'Digunakan sendiri untuk operasional'],
            ['value' => '03', 'label' => 'Disewakan untuk operasional'],
            ['value' => '04', 'label' => 'Dipinjamkan untuk operasional'],
            ['value' => '05', 'label' => 'Tidak dipakai'],
            ['value' => '06', 'label' => 'Dihibahkan'],
            ['value' => '07', 'label' => 'Dijual'],
            ['value' => '08', 'label' => 'Sudah dimusnahkan'],
        ];

        return Inertia::render('Assets/Index', [
            'assets' => $assets,
            'filters' => $request->only(['search', 'kondisi', 'lokasi', 'status', 'sort', 'direction']),
            'filterOptions' => [
                'locations' => $locations,
                'kondisi' => $kondisiOptions,
                'status' => $statusOptions,
            ],
        ]);
    }

    /**
     * Display the specified asset.
     */
    public function show(string $id)
    {
        $asset = Asset::with(['location', 'penanggungJawab', 'histories', 'maintenances', 'conditionLogs', 'photos'])
            ->findOrFail($id);

        return Inertia::render('Assets/Show', [
            'asset' => $asset,
        ]);
    }

    /**
     * Display the asset histories.
     */
    public function histories(string $id)
    {
        $asset = Asset::findOrFail($id);

        $histories = $asset->histories()
            ->with(['lokasiLama', 'lokasiBaru', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($histories);
    }

    /**
     * Update asset location.
     */
    public function updateLocation(UpdateLocationRequest $request, string $id)
    {
        $asset = Asset::findOrFail($id);
        $oldLocationId = $asset->lokasi_id;

        $asset->update([
            'lokasi_id' => $request->validated('lokasi_id'),
        ]);

        // Create history record
        $asset->histories()->create([
            'lokasi_id_lama' => $oldLocationId,
            'lokasi_id_baru' => $request->validated('lokasi_id'),
            'user_id' => $request->user()->id,
            'keterangan' => $request->validated('keterangan'),
        ]);

        return back()->with('success', 'Lokasi aset berhasil diperbarui');
    }

    /**
     * Get photos for an asset.
     */
    public function photosIndex(string $id)
    {
        $asset = Asset::findOrFail($id);

        $photos = $asset->photos()
            ->orderBy('is_primary', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($photos);
    }

    /**
     * Store a new photo for an asset.
     */
    public function photosStore(StoreAssetPhotoRequest $request, string $id)
    {
        $asset = Asset::findOrFail($id);

        $file = $request->file('photo');
        $path = $file->store('asset-photos', 'public');

        $isFirstPhoto = $asset->photos()->count() === 0;
        $isPrimary = $request->input('is_primary', $isFirstPhoto);

        $photo = $asset->photos()->create([
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'caption' => $request->input('caption'),
            'is_primary' => $isPrimary,
        ]);

        // Update asset's jml_photo count
        $asset->update([
            'jml_photo' => $asset->photos()->count(),
        ]);

        return response()->json([
            'message' => 'Photo uploaded successfully',
            'photo' => $photo->load('asset'),
        ], 201);
    }

    /**
     * Update a photo.
     */
    public function photosUpdate(UpdateAssetPhotoRequest $request, string $assetId, string $photoId)
    {
        $asset = Asset::findOrFail($assetId);
        $photo = AssetPhoto::where('asset_id', $assetId)->findOrFail($photoId);

        $validated = $request->validated();

        // If marking as primary, unmark other photos
        if (isset($validated['is_primary']) && $validated['is_primary']) {
            $asset->photos()->where('id', '!=', $photoId)->update(['is_primary' => false]);
        }

        $photo->update($validated);

        return response()->json([
            'message' => 'Photo updated successfully',
            'photo' => $photo->load('asset'),
        ]);
    }

    /**
     * Delete a photo.
     */
    public function photosDestroy(string $assetId, string $photoId)
    {
        $asset = Asset::findOrFail($assetId);
        $photo = AssetPhoto::where('asset_id', $assetId)->findOrFail($photoId);

        $wasPrimary = $photo->is_primary;
        $photo->delete();

        // If deleted photo was primary, mark another photo as primary
        if ($wasPrimary) {
            $newPrimary = $asset->photos()->first();
            if ($newPrimary) {
                $newPrimary->update(['is_primary' => true]);
            }
        }

        // Update asset's jml_photo count
        $asset->update([
            'jml_photo' => $asset->photos()->count(),
        ]);

        return response()->json([
            'message' => 'Photo deleted successfully',
        ]);
    }

    /**
     * Store a new maintenance record for an asset.
     */
    public function maintenanceStore(StoreMaintenanceRequest $request, string $id)
    {
        $asset = Asset::findOrFail($id);

        $maintenance = $asset->maintenances()->create($request->validated());

        return back()->with('success', 'Perawatan aset berhasil ditambahkan');
    }

    /**
     * Get maintenances for an asset.
     */
    public function maintenancesIndex(string $id)
    {
        $asset = Asset::findOrFail($id);

        $maintenances = $asset->maintenances()
            ->orderBy('tanggal', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($maintenances);
    }

    /**
     * Update a maintenance record.
     */
    public function maintenancesUpdate(UpdateMaintenanceRequest $request, string $assetId, string $maintenanceId)
    {
        $asset = Asset::findOrFail($assetId);
        $maintenance = AssetMaintenance::where('asset_id', $assetId)->findOrFail($maintenanceId);

        $maintenance->update($request->validated());

        return back()->with('success', 'Perawatan aset berhasil diperbarui');
    }

    /**
     * Delete a maintenance record.
     */
    public function maintenancesDestroy(string $assetId, string $maintenanceId)
    {
        $asset = Asset::findOrFail($assetId);
        $maintenance = AssetMaintenance::where('asset_id', $assetId)->findOrFail($maintenanceId);

        $maintenance->delete();

        return back()->with('success', 'Perawatan aset berhasil dihapus');
    }
}
