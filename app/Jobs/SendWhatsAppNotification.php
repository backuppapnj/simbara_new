<?php

namespace App\Jobs;

use App\Models\NotificationLog;
use App\Models\NotificationSetting;
use App\Models\User;
use App\Services\FonnteService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class SendWhatsAppNotification implements ShouldQueue
{
    use Queueable;

    public $tries = 3;

    public $backoff = [60, 300, 1800]; // 1min, 5min, 30min

    /**
     * Create a new job instance.
     */
    public function __construct(
        public User $user,
        public string $eventType,
        public array $data
    ) {
        $this->onQueue('whatsapp');
    }

    /**
     * Execute the job.
     */
    public function handle(FonnteService $fonnte): void
    {
        // Check if user has phone number
        if (! $this->user->phone) {
            return;
        }

        // Get user notification settings
        $setting = $this->user->notificationSetting;

        // Create default settings if not exists
        if (! $setting) {
            $setting = NotificationSetting::create([
                'user_id' => $this->user->id,
                'whatsapp_enabled' => true,
                'notify_reorder_alert' => true,
                'notify_approval_needed' => true,
                'notify_request_update' => false,
            ]);
        }

        // Check if WhatsApp is enabled
        if (! $setting->whatsapp_enabled) {
            return;
        }

        // Check if specific notification type is enabled
        if (! $this->isNotificationTypeEnabled($setting)) {
            return;
        }

        // Check quiet hours
        if ($this->isQuietHours()) {
            return;
        }

        // Generate message
        $message = $this->generateMessage();

        // Send message
        try {
            $response = $fonnte->send($this->user->phone, $message);

            // Log success
            NotificationLog::create([
                'user_id' => $this->user->id,
                'event_type' => $this->eventType,
                'phone' => $this->user->phone,
                'message' => $message,
                'status' => 'sent',
                'fonnte_response' => $response,
                'retry_count' => $this->attempts() - 1, // attempts() starts at 1, so subtract 1
                'sent_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Log failure
            NotificationLog::create([
                'user_id' => $this->user->id,
                'event_type' => $this->eventType,
                'phone' => $this->user->phone,
                'message' => $message,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'retry_count' => $this->attempts(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        // Generate message for logging purposes
        $message = '';
        try {
            $message = $this->generateMessage();
        } catch (\Exception $e) {
            // If message generation fails, use a default
            $message = 'Failed to generate message';
        }

        // Log failure
        NotificationLog::create([
            'user_id' => $this->user->id,
            'event_type' => $this->eventType,
            'phone' => $this->user->phone ?? null,
            'message' => $message,
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
            'retry_count' => $this->attempts() - 1, // attempts() starts at 1, so subtract 1
        ]);
    }

    /**
     * Check if current time is within quiet hours.
     */
    public function isQuietHours(): bool
    {
        $setting = $this->user->notificationSetting;

        if (! $setting || ! $setting->quiet_hours_start || ! $setting->quiet_hours_end) {
            return false;
        }

        $now = now()->format('H:i');
        $start = $setting->quiet_hours_start;
        $end = $setting->quiet_hours_end;

        // Check if now is within quiet hours range
        if ($start <= $end) {
            // Normal range (e.g., 22:00 - 06:00 same day)
            return $now >= $start && $now <= $end;
        } else {
            // Overnight range (e.g., 22:00 - 06:00 next day)
            return $now >= $start || $now <= $end;
        }
    }

    /**
     * Check if the specific notification type is enabled.
     */
    protected function isNotificationTypeEnabled(NotificationSetting $setting): bool
    {
        return match ($this->eventType) {
            'reorder_alert' => $setting->notify_reorder_alert,
            'approval_needed' => $setting->notify_approval_needed,
            'request_created' => true, // Always send to operators
            'request_approved', 'request_rejected' => $setting->notify_request_update,
            default => true,
        };
    }

    /**
     * Generate WhatsApp message based on event type.
     */
    public function generateMessage(): string
    {
        return match ($this->eventType) {
            'request_created' => $this->generateRequestCreatedMessage(),
            'approval_needed' => $this->generateApprovalNeededMessage(),
            'reorder_alert' => $this->generateReorderAlertMessage(),
            default => throw new \InvalidArgumentException("Unknown event type: {$this->eventType}"),
        };
    }

    /**
     * Generate message for request_created event.
     */
    protected function generateRequestCreatedMessage(): string
    {
        $requestNo = $this->data['request_no'] ?? 'N/A';
        $pemohon = $this->data['pemohon'] ?? 'N/A';
        $departemen = $this->data['departemen'] ?? 'N/A';
        $tanggal = $this->data['tanggal'] ?? now()->translatedFormat('d F Y');
        $items = $this->data['items'] ?? 'N/A';

        return "🔔 PERMINTAAN ATK BARU\n\n"
            ."No: {$requestNo}\n"
            ."Pemohon: {$pemohon}\n"
            ."Departemen: {$departemen}\n"
            ."Tanggal: {$tanggal}\n\n"
            ."Items:\n{$items}\n\n"
            ."Silakan cek dan proses permintaan.\n\n"
            ."---\n"
            ."Sistem Manajemen Aset & Persediaan\n"
            .'Pengadilan Agama Penajam Paser Utara';
    }

    /**
     * Generate message for approval_needed event.
     */
    protected function generateApprovalNeededMessage(): string
    {
        $requestNo = $this->data['request_no'] ?? 'N/A';
        $pemohon = $this->data['pemohon'] ?? 'N/A';
        $departemen = $this->data['departemen'] ?? 'N/A';
        $level = $this->data['level'] ?? 'N/A';
        $items = $this->data['items'] ?? 'N/A';

        return "✋ PERMINTAAN BUTUH APPROVAL\n\n"
            ."No: {$requestNo}\n"
            ."Pemohon: {$pemohon}\n"
            ."Departemen: {$departemen}\n"
            ."Level: {$level}\n\n"
            ."Items:\n{$items}\n\n"
            ."Mohon review dan approval.\n\n"
            ."---\n"
            ."Sistem Manajemen Aset & Persediaan\n"
            .'Pengadilan Agama Penajam Paser Utara';
    }

    /**
     * Generate message for reorder_alert event.
     */
    protected function generateReorderAlertMessage(): string
    {
        $itemName = $this->data['item_name'] ?? 'N/A';
        $currentStock = $this->data['current_stock'] ?? 0;
        $minStock = $this->data['min_stock'] ?? 0;
        $unit = $this->data['unit'] ?? 'unit';
        $diff = $minStock - $currentStock;

        return "⚠️ REORDER POINT ALERT\n\n"
            ."Barang berikut di bawah stok minimal:\n\n"
            ."{$itemName}\n"
            ."• Stok saat ini: {$currentStock} {$unit}\n"
            ."• Stok minimal: {$minStock} {$unit}\n"
            ."• Kurang: {$diff} {$unit}\n\n"
            ."Silakan lakukan pembelian.\n\n"
            ."---\n"
            ."Sistem Manajemen Aset & Persediaan\n"
            .'Pengadilan Agama Penajam Paser Utara';
    }
}
