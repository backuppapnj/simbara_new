<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

final readonly class NotificationLogController extends Controller
{
    /**
     * Display a listing of notification logs.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', NotificationLog::class);

        $logs = NotificationLog::query()
            ->with('user')
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->input('status')))
            ->when($request->filled('event_type'), fn ($query) => $query->where('event_type', $request->input('event_type')))
            ->when($request->filled('user_id'), fn ($query) => $query->where('user_id', $request->input('user_id')))
            ->when($request->filled('date_from'), fn ($query) => $query->whereDate('created_at', '>=', $request->input('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query->whereDate('created_at', '<=', $request->input('date_to')))
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 50));

        return Inertia::render('Admin/NotificationLogs', [
            'logs' => $logs,
            'filters' => $request->only(['status', 'event_type', 'user_id', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Display the specified notification log.
     */
    public function show(NotificationLog $log): Response
    {
        $this->authorize('view', $log);

        $log->load('user');

        return Inertia::render('Admin/NotificationLogDetail', [
            'log' => $log,
        ]);
    }
}
