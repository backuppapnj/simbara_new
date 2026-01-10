<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAtkRequest;
use App\Http\Resources\AtkRequestCollection;
use App\Http\Resources\AtkRequestResource;
use App\Models\AtkRequest;
use App\Models\RequestDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AtkRequestController extends Controller
{
    /**
     * Display a listing of the requests.
     */
    public function index(): AtkRequestCollection
    {
        $user = auth()->user();

        $query = AtkRequest::query()->with(['user', 'department', 'requestDetails.item']);

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

        return new AtkRequestCollection($requests);
    }

    /**
     * Store a newly created request in storage.
     */
    public function store(StoreAtkRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $atkRequest = DB::transaction(function () use ($validated) {
            $user = auth()->user();

            // Create the main request
            $atkRequest = AtkRequest::create([
                'user_id' => $user->id,
                'department_id' => $validated['department_id'],
                'tanggal' => $validated['tanggal'],
                'status' => 'pending',
                'keterangan' => $validated['keterangan'] ?? null,
            ]);

            // Create request details
            foreach ($validated['items'] as $item) {
                RequestDetail::create([
                    'request_id' => $atkRequest->id,
                    'item_id' => $item['item_id'],
                    'jumlah_diminta' => $item['jumlah_diminta'],
                    'jumlah_disetujui' => $item['jumlah_diminta'], // Initially same as requested
                ]);
            }

            return $atkRequest;
        });

        return (new AtkRequestResource($atkRequest->load(['requestDetails.item'])))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified request.
     */
    public function show(AtkRequest $atkRequest): AtkRequestResource
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
            $canView = $atkRequest->user_id == $user->id;
        }

        if (! $canView) {
            abort(403, 'You do not have permission to view this request.');
        }

        $atkRequest->load(['user', 'department', 'level1Approver', 'level2Approver', 'level3Approver', 'requestDetails.item']);

        return new AtkRequestResource($atkRequest);
    }
}
