<?php

namespace App\Http\Controllers;

use App\Events\OfficeRequestCreated;
use App\Http\Requests\RejectOfficeRequestRequest;
use App\Http\Requests\StoreOfficeRequestRequest;
use App\Http\Resources\OfficeRequestCollection;
use App\Http\Resources\OfficeRequestResource;
use App\Models\OfficeMutation;
use App\Models\OfficeRequest;
use App\Models\OfficeRequestDetail;
use App\Models\OfficeSupply;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OfficeRequestController extends Controller
{
    /**
     * Display a listing of the requests.
     */
    public function index(Request $request): OfficeRequestCollection
    {
        $user = auth()->user();

        $query = OfficeRequest::query()->with(['user', 'department', 'details.supply']);

        // Regular users can only see their own requests
        // Admin/approvers can see all requests
        $hasAdminRole = false;
        try {
            $hasAdminRole = $user->hasAnyRole(['Operator Persediaan', 'Kasubag Umum', 'KPA']);
        } catch (\Exception $e) {
            // Role system not set up, treat as regular user
        }

        if (! $hasAdminRole) {
            $query->where('user_id', $user->id);
        }

        $requests = $query->latest()->paginate(20);

        return new OfficeRequestCollection($requests);
    }

    /**
     * Store a newly created request in storage.
     */
    public function store(StoreOfficeRequestRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $officeRequest = DB::transaction(function () use ($validated) {
            $user = auth()->user();

            // Generate request number
            $noPermintaan = 'REQ-'.date('Ymd').'-'.strtoupper(substr((string) Str::ulid(), -6));

            // Create the main request
            $officeRequest = OfficeRequest::create([
                'id' => (string) Str::ulid(),
                'no_permintaan' => $noPermintaan,
                'user_id' => $user->id,
                'department_id' => $validated['department_id'],
                'tanggal' => $validated['tanggal'],
                'status' => 'pending',
                'keterangan' => $validated['keterangan'] ?? null,
            ]);

            // Create request details
            foreach ($validated['items'] as $item) {
                OfficeRequestDetail::create([
                    'id' => (string) Str::ulid(),
                    'request_id' => $officeRequest->id,
                    'supply_id' => $item['supply_id'],
                    'jumlah' => $item['jumlah'],
                    'jumlah_diberikan' => null, // Will be set when approved
                ]);
            }

            return $officeRequest;
        });

        // Dispatch event after request is created
        OfficeRequestCreated::dispatch($officeRequest);

        return (new OfficeRequestResource($officeRequest->load(['details.supply'])))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified request.
     */
    public function show(OfficeRequest $officeRequest): OfficeRequestResource
    {
        $user = auth()->user();

        // Regular users can only view their own requests
        // Admin/approvers can view all requests
        $hasAdminRole = false;
        try {
            $hasAdminRole = $user->hasAnyRole(['Operator Persediaan', 'Kasubag Umum', 'KPA']);
        } catch (\Exception $e) {
            // Role system not set up or no roles assigned, treat as regular user
            $hasAdminRole = false;
        }

        // Check if user can view this request
        $canView = false;
        if ($hasAdminRole) {
            $canView = true;
        } else {
            // Use loose comparison because user_id may be cast to string from DB
            $canView = $officeRequest->user_id == $user->id;
        }

        if (! $canView) {
            abort(403, 'You do not have permission to view this request.');
        }

        $officeRequest->load(['user', 'department', 'approvedBy', 'details.supply']);

        return new OfficeRequestResource($officeRequest);
    }

    /**
     * Approve request and distribute items (Direct approval for Office Supplies).
     * Unlike ATK which has 3-level approval, Office Supplies use direct approval.
     */
    public function approve(OfficeRequest $officeRequest): OfficeRequestResource
    {
        $user = auth()->user();

        // Validate status - can only approve pending requests
        if ($officeRequest->status !== 'pending') {
            abort(422, 'Request can only be approved if status is pending.');
        }

        $officeRequest = DB::transaction(function () use ($officeRequest, $user) {
            // Update request status
            $officeRequest->update([
                'status' => 'completed',
                'approved_by' => $user->id,
                'approved_at' => now(),
                'completed_at' => now(),
            ]);

            // Process each detail item
            foreach ($officeRequest->details as $detail) {
                $supply = OfficeSupply::findOrFail($detail->supply_id);
                $stokSebelum = $supply->stok;

                // Calculate amount to give (handle insufficient stock)
                $jumlahDiberikan = min($detail->jumlah, $stokSebelum);
                $stokSesudah = $stokSebelum - $jumlahDiberikan;

                // Update detail with jumlah_diberikan
                $detail->update(['jumlah_diberikan' => $jumlahDiberikan]);

                // Update stock
                $supply->update(['stok' => $stokSesudah]);

                // Create mutation (keluar) only if items were given
                if ($jumlahDiberikan > 0) {
                    OfficeMutation::create([
                        'supply_id' => $detail->supply_id,
                        'jenis_mutasi' => 'keluar',
                        'jumlah' => $jumlahDiberikan,
                        'stok_sebelum' => $stokSebelum,
                        'stok_sesudah' => $stokSesudah,
                        'tipe' => 'permintaan',
                        'referensi_id' => $officeRequest->id,
                        'user_id' => $user->id,
                        'keterangan' => "Permintaan {$officeRequest->no_permintaan}",
                    ]);
                }
            }

            return $officeRequest;
        });

        $officeRequest->load(['user', 'department', 'approvedBy', 'details.supply']);

        return new OfficeRequestResource($officeRequest);
    }

    /**
     * Reject request.
     */
    public function reject(RejectOfficeRequestRequest $request, OfficeRequest $officeRequest): OfficeRequestResource
    {
        $validated = $request->validated();

        // Validate status - can only reject pending requests
        if ($officeRequest->status !== 'pending') {
            abort(422, 'Request can only be rejected if it is pending.');
        }

        $officeRequest->update([
            'status' => 'rejected',
            'alasan_penolakan' => $validated['alasan_penolakan'],
        ]);

        $officeRequest->load(['user', 'department', 'approvedBy', 'details.supply']);

        return new OfficeRequestResource($officeRequest);
    }
}
