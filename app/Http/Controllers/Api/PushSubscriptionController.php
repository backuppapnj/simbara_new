<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    /**
     * Store a new push subscription.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string|max:500',
            'key' => 'nullable|string',
            'token' => 'nullable|string',
            'content_encoding' => 'nullable|string',
        ]);

        $subscription = PushSubscription::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'endpoint' => $validated['endpoint'],
            ],
            [
                'key' => $validated['key'] ?? null,
                'token' => $validated['token'] ?? null,
                'content_encoding' => $validated['content_encoding'] ?? null,
                'user_agent' => $request->userAgent(),
                'is_active' => true,
                'last_used_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Subscription saved successfully',
            'subscription' => $subscription,
        ], 201);
    }

    /**
     * Delete a push subscription.
     */
    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string',
        ]);

        $deleted = PushSubscription::where('user_id', auth()->id())
            ->where('endpoint', $validated['endpoint'])
            ->delete();

        if ($deleted) {
            return response()->json([
                'message' => 'Subscription deleted successfully',
            ]);
        }

        return response()->json([
            'message' => 'Subscription not found',
        ], 404);
    }

    /**
     * Get VAPID public key.
     */
    public function vapidKey(): JsonResponse
    {
        $publicKey = config('webpush.vapid.public_key');

        if (! $publicKey) {
            return response()->json([
                'message' => 'VAPID public key not configured',
            ], 500);
        }

        return response()->json([
            'public_key' => $publicKey,
        ]);
    }
}
