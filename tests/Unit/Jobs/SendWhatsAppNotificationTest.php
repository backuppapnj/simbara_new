<?php

use App\Jobs\SendWhatsAppNotification;
use App\Models\NotificationLog;
use App\Models\NotificationSetting;
use App\Models\Setting;
use App\Models\User;
use App\Services\FonnteService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

describe('SendWhatsAppNotification Job', function () {
    beforeEach(function () {
        // Create Fonnte API token setting
        Setting::create([
            'key' => 'fonnte_api_token',
            'value' => 'test_token',
            'type' => 'whatsapp_config',
        ]);

        // Create a user with phone and notification settings
        $this->user = User::factory()->create([
            'phone' => '+6281234567890',
        ]);

        $this->notificationSetting = NotificationSetting::create([
            'user_id' => $this->user->id,
            'whatsapp_enabled' => true,
            'notify_reorder_alert' => true,
            'notify_approval_needed' => true,
            'notify_request_update' => false,
            'quiet_hours_start' => null,
            'quiet_hours_end' => null,
        ]);
    });

    describe('job properties', function () {
        test('has correct retry configuration', function () {
            $job = new SendWhatsAppNotification(
                $this->user,
                'test_event',
                ['data' => 'test']
            );

            expect($job->tries)->toBe(3);
            expect($job->backoff)->toBe([60, 300, 1800]); // 1min, 5min, 30min
        });

        test('uses whatsapp queue', function () {
            Queue::fake();

            $job = new SendWhatsAppNotification(
                $this->user,
                'test_event',
                ['data' => 'test']
            );

            // Job is queued to 'whatsapp' queue via onQueue() in constructor
            $this->assertNotNull($job->queue);
        });
    });

    describe('handle()', function () {
        test('sends whatsapp message via FonnteService', function () {
            Http::fake([
                'api.fonnte.com/send' => Http::response([
                    'status' => true,
                    'message' => 'Success',
                ], 200),
            ]);

            $job = new SendWhatsAppNotification(
                $this->user,
                'request_created',
                ['request_no' => 'PRQ-001', 'items' => 'Test items']
            );

            $job->handle(new FonnteService);

            Http::assertSent(function ($request) {
                return $request->url() === 'https://api.fonnte.com/send'
                    && $request['target'] === '+6281234567890';
            });
        });

        test('creates notification log on success', function () {
            Http::fake([
                'api.fonnte.com/send' => Http::response([
                    'status' => true,
                    'message' => 'Success',
                ], 200),
            ]);

            $job = new SendWhatsAppNotification(
                $this->user,
                'request_created',
                ['request_no' => 'PRQ-001']
            );

            $job->handle(new FonnteService);

            $log = NotificationLog::where('user_id', $this->user->id)
                ->where('event_type', 'request_created')
                ->first();

            expect($log)->not->toBeNull();
            expect($log->status)->toBe('sent');
            expect($log->phone)->toBe('+6281234567890');
            expect($log->retry_count)->toBe(0);
            expect($log->sent_at)->not->toBeNull();
        });

        test('skips if whatsapp is disabled for user', function () {
            Http::fake([
                'api.fonnte.com/send' => Http::response([
                    'status' => true,
                ], 200),
            ]);

            $this->notificationSetting->update(['whatsapp_enabled' => false]);

            $job = new SendWhatsAppNotification(
                $this->user,
                'request_created',
                ['request_no' => 'PRQ-001']
            );

            $job->handle(new FonnteService);

            Http::assertNothingSent();

            $log = NotificationLog::where('user_id', $this->user->id)
                ->where('event_type', 'request_created')
                ->first();

            expect($log)->toBeNull();
        });

        test('skips if in quiet hours', function () {
            Http::fake([
                'api.fonnte.com/send' => Http::response([
                    'status' => true,
                ], 200),
            ]);

            // Set quiet hours to current time
            $currentTime = now()->format('H:i');
            $this->notificationSetting->update([
                'quiet_hours_start' => $currentTime,
                'quiet_hours_end' => $currentTime,
            ]);

            $job = new SendWhatsAppNotification(
                $this->user,
                'request_created',
                ['request_no' => 'PRQ-001']
            );

            $job->handle(new FonnteService);

            Http::assertNothingSent();
        });

        test('checks specific notification type settings', function () {
            Http::fake([
                'api.fonnte.com/send' => Http::response([
                    'status' => true,
                ], 200),
            ]);

            // Disable reorder alerts
            $this->notificationSetting->update(['notify_reorder_alert' => false]);

            $job = new SendWhatsAppNotification(
                $this->user,
                'reorder_alert',
                ['item_name' => 'Test Item']
            );

            $job->handle(new FonnteService);

            Http::assertNothingSent();
        });

        test('formats message based on event type', function () {
            Http::fake([
                'api.fonnte.com/send' => Http::response([
                    'status' => true,
                ], 200),
            ]);

            $job = new SendWhatsAppNotification(
                $this->user,
                'request_created',
                [
                    'request_no' => 'PRQ-2024001',
                    'pemohon' => 'Budi Santoso',
                    'departemen' => 'Keuangan',
                    'items' => "• Kertas A4 - 5 rim\n• Pulpen Hitam - 10 pcs",
                ]
            );

            $job->handle(new FonnteService);

            Http::assertSent(function ($request) {
                $message = $request['message'];

                return str_contains($message, 'PRQ-2024001')
                    && str_contains($message, 'Budi Santoso')
                    && str_contains($message, 'Keuangan')
                    && str_contains($message, 'Kertas A4');
            });
        });
    });

    describe('failed()', function () {
        test('creates failed notification log on exception', function () {
            $job = new SendWhatsAppNotification(
                $this->user,
                'request_created',
                ['request_no' => 'PRQ-001']
            );

            $exception = new \Exception('API Error: Connection timeout');

            $job->failed($exception);

            $log = NotificationLog::where('user_id', $this->user->id)
                ->where('event_type', 'request_created')
                ->first();

            expect($log)->not->toBeNull();
            expect($log->status)->toBe('failed');
            expect($log->error_message)->toBe('API Error: Connection timeout');
        });

        test('logs retry count in failed notification log', function () {
            $job = new SendWhatsAppNotification(
                $this->user,
                'request_created',
                ['request_no' => 'PRQ-001']
            );

            $exception = new \Exception('API Error');

            $job->failed($exception);

            $log = NotificationLog::where('user_id', $this->user->id)
                ->where('event_type', 'request_created')
                ->first();

            // When calling failed() directly, attempts() returns 1, so retry_count = 1 - 1 = 0
            expect($log->retry_count)->toBe(0);
        });
    });

    describe('queue behavior', function () {
        test('can be dispatched to queue', function () {
            Queue::fake();

            SendWhatsAppNotification::dispatch(
                $this->user,
                'test_event',
                ['data' => 'test']
            );

            Queue::assertPushed(SendWhatsAppNotification::class, function ($job) {
                return $job->user->id === $this->user->id
                    && $job->eventType === 'test_event';
            });
        });

        test('uses exponential backoff', function () {
            $job = new SendWhatsAppNotification(
                $this->user,
                'test_event',
                ['data' => 'test']
            );

            expect($job->backoff)->toBe([60, 300, 1800]);
        });
    });

    describe('isQuietHours()', function () {
        test('returns false when quiet hours not set', function () {
            $job = new SendWhatsAppNotification(
                $this->user,
                'test_event',
                ['data' => 'test']
            );

            expect($job->isQuietHours())->toBeFalse();
        });

        test('returns true when current time is within quiet hours', function () {
            $currentTime = now()->format('H:i');

            $this->notificationSetting->update([
                'quiet_hours_start' => $currentTime,
                'quiet_hours_end' => $currentTime,
            ]);

            $job = new SendWhatsAppNotification(
                $this->user,
                'test_event',
                ['data' => 'test']
            );

            expect($job->isQuietHours())->toBeTrue();
        });

        test('handles overnight quiet hours (22:00 - 06:00)', function () {
            // Test at 23:00 (should be in quiet hours)
            $this->travelTo(now()->setHour(23)->setMinute(0));

            $this->notificationSetting->update([
                'quiet_hours_start' => '22:00',
                'quiet_hours_end' => '06:00',
            ]);

            $job = new SendWhatsAppNotification(
                $this->user,
                'test_event',
                ['data' => 'test']
            );

            expect($job->isQuietHours())->toBeTrue();

            $this->travelBack();
        });

        test('returns false when outside overnight quiet hours', function () {
            // Test at 10:00 (should not be in quiet hours)
            $this->travelTo(now()->setHour(10)->setMinute(0));

            $this->notificationSetting->update([
                'quiet_hours_start' => '22:00',
                'quiet_hours_end' => '06:00',
            ]);

            $job = new SendWhatsAppNotification(
                $this->user,
                'test_event',
                ['data' => 'test']
            );

            expect($job->isQuietHours())->toBeFalse();

            $this->travelBack();
        });
    });

    describe('generateMessage()', function () {
        test('generates message for request_created event', function () {
            $job = new SendWhatsAppNotification(
                $this->user,
                'request_created',
                [
                    'request_no' => 'PRQ-2024001',
                    'pemohon' => 'Budi Santoso',
                    'departemen' => 'Keuangan',
                    'tanggal' => '11 Januari 2026',
                    'items' => "• Kertas A4 - 5 rim\n• Pulpen Hitam - 10 pcs",
                ]
            );

            $message = $job->generateMessage();

            expect($message)->toContain('PERMINTAAN ATK BARU');
            expect($message)->toContain('PRQ-2024001');
            expect($message)->toContain('Budi Santoso');
            expect($message)->toContain('Keuangan');
            expect($message)->toContain('11 Januari 2026');
            expect($message)->toContain('Kertas A4');
        });

        test('generates message for approval_needed event', function () {
            $job = new SendWhatsAppNotification(
                $this->user,
                'approval_needed',
                [
                    'request_no' => 'PRQ-2024001',
                    'pemohon' => 'Budi Santoso',
                    'departemen' => 'Keuangan',
                    'level' => 'Level 2 (Kasubag Umum)',
                    'items' => '• Kertas A4 - 5 rim',
                ]
            );

            $message = $job->generateMessage();

            expect($message)->toContain('PERMINTAAN BUTUH APPROVAL');
            expect($message)->toContain('PRQ-2024001');
            expect($message)->toContain('Level 2 (Kasubag Umum)');
        });

        test('generates message for reorder_alert event', function () {
            $job = new SendWhatsAppNotification(
                $this->user,
                'reorder_alert',
                [
                    'item_name' => 'Kertas A4 (Sinar Dunia)',
                    'current_stock' => 15,
                    'min_stock' => 20,
                    'unit' => 'rim',
                ]
            );

            $message = $job->generateMessage();

            expect($message)->toContain('REORDER POINT ALERT');
            expect($message)->toContain('Kertas A4 (Sinar Dunia)');
            expect($message)->toContain('15 rim');
            expect($message)->toContain('20 rim');
        });

        test('throws exception for unknown event type', function () {
            $job = new SendWhatsAppNotification(
                $this->user,
                'unknown_event',
                ['data' => 'test']
            );

            $this->expectException(\InvalidArgumentException::class);

            $job->generateMessage();
        });
    });
});
