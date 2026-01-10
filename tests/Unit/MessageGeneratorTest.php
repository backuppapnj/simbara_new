<?php

use App\Services\MessageGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('MessageGenerator', function () {
    it('generates message for request_created event', function () {
        $generator = new MessageGenerator;
        $data = [
            'request_no' => 'PRQ-2026001',
            'user_name' => 'Budi Santoso',
            'department' => 'Keuangan',
            'items' => [
                ['item_name' => 'Kertas A4', 'quantity' => 5, 'unit' => 'rim'],
                ['item_name' => 'Pulpen Hitam', 'quantity' => 10, 'unit' => 'pcs'],
            ],
        ];

        $message = $generator->generate('request_created', $data);

        expect($message)->toContain('🔔');
        expect($message)->toContain('PERMINTAAN BARU');
        expect($message)->toContain('PRQ-2026001');
        expect($message)->toContain('Budi Santoso');
        expect($message)->toContain('Keuangan');
        expect($message)->toContain('Kertas A4 - 5 rim');
        expect($message)->toContain('Pulpen Hitam - 10 pcs');
    });

    it('generates message for approval_needed event', function () {
        $generator = new MessageGenerator;
        $data = [
            'request_no' => 'PRQ-2026001',
            'user_name' => 'Budi Santoso',
            'department' => 'Keuangan',
            'level' => 2,
            'role' => 'Kasubag Umum',
            'items' => [
                ['item_name' => 'Kertas A4', 'quantity' => 5, 'unit' => 'rim'],
            ],
        ];

        $message = $generator->generate('approval_needed', $data);

        expect($message)->toContain('✋');
        expect($message)->toContain('PERMINTAAN BUTUH APPROVAL');
        expect($message)->toContain('PRQ-2026001');
        expect($message)->toContain('Budi Santoso');
        expect($message)->toContain('Level 2 (Kasubag Umum)');
        expect($message)->toContain('Kertas A4 - 5 rim');
    });

    it('generates message for reorder_alert event', function () {
        $generator = new MessageGenerator;
        $data = [
            'item_name' => 'Kertas A4 (Sinar Dunia)',
            'current_stock' => 15,
            'minimal_stock' => 20,
            'unit' => 'rim',
            'deficit' => 5,
        ];

        $message = $generator->generate('reorder_alert', $data);

        expect($message)->toContain('⚠️');
        expect($message)->toContain('REORDER POINT ALERT');
        expect($message)->toContain('Kertas A4 (Sinar Dunia)');
        expect($message)->toContain('15 rim');
        expect($message)->toContain('20 rim');
        expect($message)->toContain('5 rim');
    });

    it('formats item list correctly', function () {
        $generator = new MessageGenerator;
        $data = [
            'request_no' => 'PRQ-2026001',
            'user_name' => 'Budi Santoso',
            'department' => 'Keuangan',
            'items' => [
                ['item_name' => 'Kertas A4', 'quantity' => 5, 'unit' => 'rim'],
                ['item_name' => 'Pulpen Hitam', 'quantity' => 10, 'unit' => 'pcs'],
                ['item_name' => 'Map Kuning', 'quantity' => 20, 'unit' => 'pcs'],
            ],
        ];

        $message = $generator->generate('request_created', $data);

        expect($message)->toContain('• Kertas A4 - 5 rim');
        expect($message)->toContain('• Pulpen Hitam - 10 pcs');
        expect($message)->toContain('• Map Kuning - 20 pcs');
    });

    it('includes footer in all messages', function () {
        $generator = new MessageGenerator;
        $data = [
            'request_no' => 'PRQ-2026001',
            'user_name' => 'Budi Santoso',
            'department' => 'Keuangan',
            'items' => [
                ['item_name' => 'Kertas A4', 'quantity' => 5, 'unit' => 'rim'],
            ],
        ];

        $message = $generator->generate('request_created', $data);

        expect($message)->toContain('Sistem Manajemen Aset & Persediaan');
        expect($message)->toContain('Pengadilan Agama Penajam Paser Utara');
    });

    it('handles empty items list gracefully', function () {
        $generator = new MessageGenerator;
        $data = [
            'request_no' => 'PRQ-2026001',
            'user_name' => 'Budi Santoso',
            'department' => 'Keuangan',
            'items' => [],
        ];

        $message = $generator->generate('request_created', $data);

        expect($message)->toContain('PRQ-2026001');
        expect($message)->toContain('Budi Santoso');
    });

    it('includes current date in request messages', function () {
        $generator = new MessageGenerator;
        $data = [
            'request_no' => 'PRQ-2026001',
            'user_name' => 'Budi Santoso',
            'department' => 'Keuangan',
            'items' => [
                ['item_name' => 'Kertas A4', 'quantity' => 5, 'unit' => 'rim'],
            ],
        ];

        $message = $generator->generate('request_created', $data);
        $today = now()->translatedFormat('d F Y');

        expect($message)->toContain($today);
    });
});
