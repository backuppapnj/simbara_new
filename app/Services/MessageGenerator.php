<?php

namespace App\Services;

class MessageGenerator
{
    /**
     * Generate a WhatsApp message for the given event type.
     *
     * @param  array<string, mixed>  $data
     */
    public function generate(string $eventType, array $data): string
    {
        return match ($eventType) {
            'request_created' => $this->generateRequestCreatedMessage($data),
            'approval_needed' => $this->generateApprovalNeededMessage($data),
            'reorder_alert' => $this->generateReorderAlertMessage($data),
            default => $this->generateDefaultMessage(),
        };
    }

    /**
     * Generate message for RequestCreated event.
     *
     * @param  array<string, mixed>  $data
     */
    protected function generateRequestCreatedMessage(array $data): string
    {
        $items = $this->formatItemList($data['items'] ?? []);

        return "🔔 PERMINTAAN BARU\n\n".
            "No: {$data['request_no']}\n".
            "Pemohon: {$data['user_name']}\n".
            "Departemen: {$data['department']}\n".
            'Tanggal: '.now()->translatedFormat('d F Y')."\n\n".
            "Items:\n".
            $items."\n".
            "Silakan cek dan proses permintaan.\n\n".
            "Link: {$this->getRequestUrl($data['request_id'])}\n\n".
            "---\n".
            "Sistem Manajemen Aset & Persediaan\n".
            'Pengadilan Agama Penajam Paser Utara';
    }

    /**
     * Generate message for ApprovalNeeded event.
     *
     * @param  array<string, mixed>  $data
     */
    protected function generateApprovalNeededMessage(array $data): string
    {
        $items = $this->formatItemList($data['items'] ?? []);

        return "✋ PERMINTAAN BUTUH APPROVAL\n\n".
            "No: {$data['request_no']}\n".
            "Pemohon: {$data['user_name']}\n".
            "Departemen: {$data['department']}\n".
            "Level: Level {$data['level']} ({$data['role']})\n\n".
            "Items:\n".
            $items."\n".
            "Mohon review dan approval.\n\n".
            "Link: {$this->getRequestUrl($data['request_id'])}\n\n".
            "---\n".
            "Sistem Manajemen Aset & Persediaan\n".
            'Pengadilan Agama Penajam Paser Utara';
    }

    /**
     * Generate message for ReorderPointAlert event.
     *
     * @param  array<string, mixed>  $data
     */
    protected function generateReorderAlertMessage(array $data): string
    {
        return "⚠️ REORDER POINT ALERT\n\n".
            "Barang berikut di bawah stok minimal:\n\n".
            "{$data['item_name']}\n".
            "• Stok saat ini: {$data['current_stock']} {$data['unit']}\n".
            "• Stok minimal: {$data['minimal_stock']} {$data['unit']}\n".
            "• Kurang: {$data['deficit']} {$data['unit']}\n\n".
            "Silakan lakukan pembelian.\n\n".
            "Link: {$this->getItemsUrl()}\n\n".
            "---\n".
            "Sistem Manajemen Aset & Persediaan\n".
            'Pengadilan Agama Penajam Paser Utara';
    }

    /**
     * Generate default message for unknown event types.
     */
    protected function generateDefaultMessage(): string
    {
        return "📱 Notifikasi\n\n".
            "Anda menerima notifikasi baru dari sistem.\n\n".
            "---\n".
            "Sistem Manajemen Aset & Persediaan\n".
            'Pengadilan Agama Penajam Paser Utara';
    }

    /**
     * Format items list for display.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    protected function formatItemList(array $items): string
    {
        if (empty($items)) {
            return '• Tidak ada items';
        }

        return collect($items)
            ->map(fn ($item) => "• {$item['item_name']} - {$item['quantity']} {$item['unit']}")
            ->implode("\n");
    }

    /**
     * Get the URL for a request.
     */
    protected function getRequestUrl(string $requestId): string
    {
        // In production, this should use config('app.url') or route()
        return config('app.url')."/requests/{$requestId}";
    }

    /**
     * Get the URL for the items page.
     */
    protected function getItemsUrl(): string
    {
        // In production, this should use config('app.url') or route()
        return config('app.url').'/items';
    }
}
