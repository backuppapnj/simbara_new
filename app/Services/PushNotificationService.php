<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    /**
     * Send a push notification to a user.
     */
    public function sendToUser(User $user, array $data): void
    {
        $notificationSetting = $user->notificationSetting;

        // Check if user has push notifications enabled
        if (! $notificationSetting || ! $notificationSetting->push_enabled) {
            return;
        }

        // Get active subscriptions for the user
        $subscriptions = $user->pushSubscriptions()->active()->get();

        foreach ($subscriptions as $subscription) {
            $this->sendToSubscription($subscription, $data);
        }
    }

    /**
     * Send a push notification to a specific subscription.
     */
    protected function sendToSubscription(PushSubscription $subscription, array $data): void
    {
        $payload = [
            'title' => $data['title'] ?? 'Aset PA PPU',
            'body' => $data['body'] ?? 'Anda memiliki notifikasi baru',
            'icon' => $data['icon'] ?? '/icons/icon-192x192.png',
            'badge' => $data['badge'] ?? '/icons/icon-96x96.png',
            'tag' => $data['tag'] ?? 'default-notification',
            'url' => $data['url'] ?? '/',
        ];

        if (isset($data['image'])) {
            $payload['image'] = $data['image'];
        }

        if (isset($data['actions'])) {
            $payload['actions'] = $data['actions'];
        }

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'TTL' => config('webpush.ttl', 3600),
                'Urgency' => config('webpush.urgency', 'normal'),
            ])->post($subscription->endpoint, [
                'message' => json_encode($payload),
            ]);

            if ($response->successful()) {
                $subscription->updateLastUsed();
                Log::info('Push notification sent successfully', [
                    'subscription_id' => $subscription->id,
                    'user_id' => $subscription->user_id,
                ]);
            } else {
                Log::error('Failed to send push notification', [
                    'subscription_id' => $subscription->id,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                // Mark subscription as inactive if it's permanently invalid
                if ($response->status() === 404 || $response->status() === 410) {
                    $subscription->markAsInactive();
                }
            }
        } catch (\Exception $e) {
            Log::error('Error sending push notification', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send a reorder alert notification.
     */
    public function sendReorderAlert(User $user, string $itemName, int $currentStock, int $minStock): void
    {
        $notificationSetting = $user->notificationSetting;

        if (! $notificationSetting || ! $notificationSetting->notify_reorder_alert) {
            return;
        }

        $this->sendToUser($user, [
            'title' => 'Peringatan Stok Minimum',
            'body' => "Stok {$itemName} telah mencapai batas minimum ({$currentStock} / {$minStock})",
            'tag' => 'reorder-alert',
            'url' => '/items',
        ]);
    }

    /**
     * Send an approval needed notification.
     */
    public function sendApprovalNeeded(User $user, string $requestType, int $requestId): void
    {
        $notificationSetting = $user->notificationSetting;

        if (! $notificationSetting || ! $notificationSetting->notify_approval_needed) {
            return;
        }

        $this->sendToUser($user, [
            'title' => 'Persetujuan Diperlukan',
            'body' => "Ada permintaan {$requestType} yang menunggu persetujuan Anda",
            'tag' => 'approval-needed',
            'url' => "/requests/{$requestId}",
        ]);
    }

    /**
     * Send a request status update notification.
     */
    public function sendRequestStatusUpdate(User $user, string $requestType, string $status): void
    {
        $notificationSetting = $user->notificationSetting;

        if (! $notificationSetting || ! $notificationSetting->notify_request_update) {
            return;
        }

        $statusText = match ($status) {
            'approved' => 'disetujui',
            'rejected' => 'ditolak',
            default => $status,
        };

        $this->sendToUser($user, [
            'title' => 'Status Permintaan Diperbarui',
            'body' => "Permintaan {$requestType} Anda telah {$statusText}",
            'tag' => 'request-status',
            'url' => '/requests',
        ]);
    }

    /**
     * Send notification to multiple users.
     *
     * @param  array<int, User>  $users
     */
    public function sendToUsers(array $users, array $data): void
    {
        foreach ($users as $user) {
            $this->sendToUser($user, $data);
        }
    }

    /**
     * Send notification to all users with a specific role.
     */
    public function sendToRole(string $role, array $data): void
    {
        $users = User::role($role)->get();

        foreach ($users as $user) {
            $this->sendToUser($user, $data);
        }
    }
}
