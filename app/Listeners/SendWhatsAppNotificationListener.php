<?php

namespace App\Listeners;

use App\Events\ApprovalNeeded;
use App\Events\ReorderPointAlert;
use App\Events\RequestCreated;
use App\Jobs\SendWhatsAppNotification;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

class SendWhatsAppNotificationListener
{
    /**
     * Handle the event.
     */
    public function handle(RequestCreated|ApprovalNeeded|ReorderPointAlert $event): void
    {
        $user = $this->determineRecipient($event);
        $eventType = $this->getEventType($event);
        $data = $this->getEventData($event);

        if ($this->shouldSendNotification($user, $eventType)) {
            Queue::push(new SendWhatsAppNotification($user, $eventType, $data));
        }
    }

    /**
     * Determine the recipient user for the notification.
     */
    protected function determineRecipient(RequestCreated|ApprovalNeeded|ReorderPointAlert $event): ?User
    {
        return match ($event::class) {
            RequestCreated::class, ApprovalNeeded::class => $event->request->user,
            ReorderPointAlert::class => User::role('operator')->first(),
            default => null,
        };
    }

    /**
     * Get the event type string.
     */
    protected function getEventType(RequestCreated|ApprovalNeeded|ReorderPointAlert $event): string
    {
        return match ($event::class) {
            RequestCreated::class => 'request_created',
            ApprovalNeeded::class => 'approval_needed',
            ReorderPointAlert::class => 'reorder_alert',
            default => 'unknown',
        };
    }

    /**
     * Get event data for the notification.
     *
     * @return array<string, mixed>
     */
    protected function getEventData(RequestCreated|ApprovalNeeded|ReorderPointAlert $event): array
    {
        return match ($event::class) {
            RequestCreated::class => [
                'request_no' => $event->request->no_permintaan,
                'request_id' => $event->request->id,
                'user_name' => $event->request->user->name,
                'department' => $event->request->department->nama_unit,
                'items' => $event->request->requestDetails->map(function ($detail) {
                    return [
                        'item_name' => $detail->item->nama_barang,
                        'quantity' => $detail->jumlah,
                        'unit' => $detail->item->satuan,
                    ];
                })->toArray(),
            ],
            ApprovalNeeded::class => [
                'request_no' => $event->request->no_permintaan,
                'request_id' => $event->request->id,
                'user_name' => $event->request->user->name,
                'department' => $event->request->department->nama_unit,
                'level' => $event->level,
                'role' => $event->role,
                'items' => $event->request->requestDetails->map(function ($detail) {
                    return [
                        'item_name' => $detail->item->nama_barang,
                        'quantity' => $detail->jumlah,
                        'unit' => $detail->item->satuan,
                    ];
                })->toArray(),
            ],
            ReorderPointAlert::class => [
                'item_id' => $event->item->id,
                'item_name' => $event->item->nama_barang,
                'item_code' => $event->item->kode_barang,
                'current_stock' => $event->item->stok,
                'minimal_stock' => $event->item->stok_minimal,
                'unit' => $event->item->satuan,
                'deficit' => $event->item->stok_minimal - $event->item->stok,
            ],
            default => [],
        };
    }

    /**
     * Check if the notification should be sent.
     */
    protected function shouldSendNotification(?User $user, string $eventType): bool
    {
        if ($user === null) {
            return false;
        }

        if ($user->phone === null) {
            return false;
        }

        $settings = $user->notificationSetting;

        if ($settings === null) {
            return false;
        }

        if (!$settings->whatsapp_enabled) {
            return false;
        }

        return match ($eventType) {
            'request_created' => $settings->notify_request_update,
            'approval_needed' => $settings->notify_approval_needed,
            'reorder_alert' => $settings->notify_reorder_alert,
            default => false,
        };
    }
}
