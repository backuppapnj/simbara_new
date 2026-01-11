<?php

namespace App\Http\Controllers;

use App\Events\ApprovalNeeded;
use App\Events\RequestCreated;
use App\Http\Requests\DistributeAtkRequest;
use App\Http\Requests\RejectAtkRequest;
use App\Http\Requests\StoreAtkRequest;
use App\Models\AtkRequest;
use App\Models\Department;
use App\Models\Item;
use App\Models\RequestDetail;
use App\Models\StockMutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AtkRequestController extends Controller
{
    /**
     * Display a listing of the requests.
     */
    public function index(Request $request)
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

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by department
        if ($request->has('department_id') && $request->department_id) {
            $query->where('department_id', $request->department_id);
        }

        // Search by requester name or request number
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('no_permintaan', 'like', "%{$searchTerm}%")
                    ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                        $userQuery->where('name', 'like', "%{$searchTerm}%");
                    });
            });
        }

        $requests = $query->latest()->paginate(20);

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => $requests->items(),
                'meta' => [
                    'current_page' => $requests->currentPage(),
                    'per_page' => $requests->perPage(),
                    'total' => $requests->total(),
                ],
            ]);
        }

        return Inertia::render('atk-requests/index', [
            'requests' => $requests,
            'filters' => $request->only(['status', 'department_id', 'search']),
            'can' => [
                'approve_level1' => $user->can('approve_request_l1'),
                'approve_level2' => $user->can('approve_request_l2'),
                'approve_level3' => $user->can('approve_request_l3'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new request.
     */
    public function create()
    {
        $user = auth()->user();

        $items = Item::query()
            ->where('stok', '>', 0)
            ->orderBy('kategori')
            ->orderBy('nama_barang')
            ->get();

        $departments = Department::orderBy('name')->get();

        return Inertia::render('atk-requests/create', [
            'items' => $items,
            'departments' => $departments,
            'user_department_id' => $user->department_id,
        ]);
    }

    /**
     * Store a newly created request in storage.
     */
    public function store(StoreAtkRequest $request)
    {
        $validated = $request->validated();

        $atkRequest = DB::transaction(function () use ($validated) {
            $user = auth()->user();

            // Generate request number
            $count = AtkRequest::whereDate('created_at', today())->count() + 1;
            $noPermintaan = 'REQ-'.date('Ymd').'-'.str_pad((string) $count, 4, '0', STR_PAD_LEFT);

            // Create the main request
            $atkRequest = AtkRequest::create([
                'no_permintaan' => $noPermintaan,
                'user_id' => $user->id,
                'department_id' => $validated['department_id'],
                'tanggal' => $validated['tanggal'],
                'status' => 'pending',
                'keterangan' => $validated['keterangan'] ?? null,
            ]);

            // Create request details
            foreach ($validated['items'] as $item) {
                RequestDetail::create([
                    'id' => (string) Str::ulid(),
                    'request_id' => $atkRequest->id,
                    'item_id' => $item['item_id'],
                    'jumlah_diminta' => $item['jumlah_diminta'],
                    'jumlah_disetujui' => $item['jumlah_diminta'], // Initially same as requested
                ]);
            }

            return $atkRequest;
        });

        // Dispatch event after request is created
        if (class_exists(RequestCreated::class)) {
            RequestCreated::dispatch($atkRequest);
        }

        // Return JSON for API requests, redirect for Inertia requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => $atkRequest->load('requestDetails.item'),
            ], 201);
        }

        return redirect()->route('atk-requests.show', $atkRequest)
            ->with('success', 'Permintaan ATK berhasil dibuat.');
    }

    /**
     * Display the specified request.
     */
    public function show(Request $request, AtkRequest $atkRequest)
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

        $atkRequest->load(['user', 'department', 'level1Approver', 'level2Approver', 'level3Approver', 'distributedBy', 'requestDetails.item']);

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => $atkRequest,
            ]);
        }

        return Inertia::render('atk-requests/show', [
            'atkRequest' => $atkRequest,
            'can' => [
                'approve_level1' => $user->can('approve_request_l1'),
                'approve_level2' => $user->can('approve_request_l2'),
                'approve_level3' => $user->can('approve_request_l3'),
                'distribute' => $user->can('manage_atk_requests'),
                'confirm_receive' => $atkRequest->user_id == $user->id,
            ],
        ]);
    }

    /**
     * Approve request at level 1 (Operator Persediaan).
     */
    public function approveLevel1(Request $request, AtkRequest $atkRequest)
    {
        $user = auth()->user();

        // Validate status
        if ($atkRequest->status !== 'pending') {
            abort(422, 'Request can only be approved at level 1 if status is pending.');
        }

        $atkRequest->update([
            'status' => 'level1_approved',
            'level1_approval_by' => $user->id,
            'level1_approval_at' => now(),
        ]);

        // Dispatch event for level 2 approval
        if (class_exists(ApprovalNeeded::class)) {
            ApprovalNeeded::dispatch($atkRequest, 2, 'Kasubag Umum');
        }

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => $atkRequest->fresh(),
            ]);
        }

        return redirect()->back()->with('success', 'Permintaan disetujui di Level 1.');
    }

    /**
     * Approve request at level 2 (Kasubag Umum).
     */
    public function approveLevel2(Request $request, AtkRequest $atkRequest)
    {
        $user = auth()->user();

        // Validate status
        if ($atkRequest->status !== 'level1_approved') {
            abort(422, 'Request can only be approved at level 2 if status is level1_approved.');
        }

        $atkRequest->update([
            'status' => 'level2_approved',
            'level2_approval_by' => $user->id,
            'level2_approval_at' => now(),
        ]);

        // Dispatch event for level 3 approval
        if (class_exists(ApprovalNeeded::class)) {
            ApprovalNeeded::dispatch($atkRequest, 3, 'KPA');
        }

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => $atkRequest->fresh(),
            ]);
        }

        return redirect()->back()->with('success', 'Permintaan disetujui di Level 2.');
    }

    /**
     * Approve request at level 3 (KPA).
     */
    public function approveLevel3(Request $request, AtkRequest $atkRequest)
    {
        $user = auth()->user();

        // Validate status
        if ($atkRequest->status !== 'level2_approved') {
            abort(422, 'Request can only be approved at level 3 if status is level2_approved.');
        }

        $atkRequest->update([
            'status' => 'level3_approved',
            'level3_approval_by' => $user->id,
            'level3_approval_at' => now(),
        ]);

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => $atkRequest->fresh(),
            ]);
        }

        return redirect()->back()->with('success', 'Permintaan disetujui di Level 3.');
    }

    /**
     * Reject request.
     */
    public function reject(RejectAtkRequest $request, AtkRequest $atkRequest)
    {
        $validated = $request->validated();

        // Validate status - can only reject pending or approved requests
        $validStatuses = ['pending', 'level1_approved', 'level2_approved'];
        if (! in_array($atkRequest->status, $validStatuses)) {
            abort(422, 'Request can only be rejected if it is pending or approved.');
        }

        $atkRequest->update([
            'status' => 'rejected',
            'alasan_penolakan' => $validated['alasan_penolakan'],
        ]);

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => $atkRequest->fresh(),
            ]);
        }

        return redirect()->back()->with('success', 'Permintaan ditolak.');
    }

    /**
     * Distribute items to request.
     */
    public function distribute(DistributeAtkRequest $request, AtkRequest $atkRequest)
    {
        $validated = $request->validated();
        $user = auth()->user();

        // Validate status
        if ($atkRequest->status !== 'level3_approved') {
            abort(422, 'Request can only be distributed if status is level3_approved.');
        }

        $atkRequest = DB::transaction(function () use ($atkRequest, $validated, $user) {
            // Update request details with jumlah diberikan
            foreach ($validated['items'] as $item) {
                $detail = RequestDetail::where('id', $item['detail_id'])
                    ->where('request_id', $atkRequest->id)
                    ->firstOrFail();

                $detail->update([
                    'jumlah_diberikan' => $item['jumlah_diberikan'],
                ]);
            }

            // Update request status
            $atkRequest->update([
                'status' => 'diserahkan',
                'distributed_by' => $user->id,
                'distributed_at' => now(),
            ]);

            return $atkRequest;
        });

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => $atkRequest->fresh(),
            ]);
        }

        return redirect()->back()->with('success', 'Barang berhasil didistribusikan.');
    }

    /**
     * Confirm receipt of distributed items.
     */
    public function confirmReceive(Request $request, AtkRequest $atkRequest)
    {
        $user = auth()->user();

        // Validate status
        if ($atkRequest->status !== 'diserahkan') {
            abort(422, 'Request can only be confirmed if status is diserahkan.');
        }

        // Only the request owner can confirm
        if ($atkRequest->user_id != $user->id) {
            abort(403, 'Only the request owner can confirm receipt.');
        }

        $atkRequest = DB::transaction(function () use ($atkRequest) {
            // Get all request details with items
            $details = RequestDetail::with('item')
                ->where('request_id', $atkRequest->id)
                ->whereNotNull('jumlah_diberikan')
                ->get();

            // Create stock mutations and update item stock
            foreach ($details as $detail) {
                $item = $detail->item;
                $jumlahDiberikan = $detail->jumlah_diberikan;

                if ($jumlahDiberikan > 0 && $item) {
                    $stokSebelum = $item->stok;
                    $stokSesudah = $stokSebelum - $jumlahDiberikan;

                    // Create stock mutation
                    StockMutation::create([
                        'item_id' => $item->id,
                        'jenis_mutasi' => 'keluar',
                        'jumlah' => $jumlahDiberikan,
                        'stok_sebelum' => $stokSebelum,
                        'stok_sesudah' => $stokSesudah,
                        'referensi_id' => $atkRequest->id,
                        'referensi_tipe' => 'atk_request',
                        'keterangan' => "Distribusi ATK Permintaan {$atkRequest->no_permintaan}",
                    ]);

                    // Update item stock
                    $item->update([
                        'stok' => $stokSesudah,
                    ]);
                }
            }

            // Update request status
            $atkRequest->update([
                'status' => 'diterima',
                'received_at' => now(),
            ]);

            return $atkRequest;
        });

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json([
                'data' => $atkRequest->fresh(),
            ]);
        }

        return redirect()->back()->with('success', 'Barang berhasil dikonfirmasi diterima.');
    }
}
