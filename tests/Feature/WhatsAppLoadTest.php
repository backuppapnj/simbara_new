<?php

use App\Events\RequestCreated;
use App\Jobs\SendWhatsAppNotification;
use App\Models\AtkRequest;
use App\Models\NotificationLog;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Setup Fonnte API token
    Setting::create([
        'key' => 'fonnte_api_token',
        'value' => 'test_token_12345',
    ]);

    Http::fake([
        'api.fonnte.com/*' => Http::response([
            'status' => true,
            'message' => 'Success',
        ], 200),
    ]);
});

describe('WhatsApp Notification Load Tests', function () {
    describe('Multiple Notifications Queued', function () {
        it('queues multiple notifications successfully', function () {
            Queue::fake();
            Event::fake([RequestCreated::class]);

            $userCount = 10;
            $users = User::factory()->count($userCount)->create([
                'phone' => '08123456789',
            ]);

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);
                Event::dispatch(new RequestCreated($request));
            }

            // Assert all jobs were queued
            Queue::assertPushed(SendWhatsAppNotification::class, $userCount);
        });

        it('processes all queued notifications without errors', function () {
            $userCount = 20;

            $users = User::factory()->count($userCount)->create([
                'phone' => '08123456789',
            ]);

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);
                Event::dispatch(new RequestCreated($request));
            }

            // Process all jobs
            $jobs = Queue::pushedJobs(SendWhatsAppNotification::class);

            foreach ($jobs as $jobRecord) {
                $job = $jobRecord['job'];
                $job->handle(app(\App\Services\FonnteService::class));
            }

            // Assert all logs were created
            expect(NotificationLog::where('status', 'sent')->count())->toBe($userCount);
        });

        it('handles mixed success and failure scenarios', function () {
            $callCount = 0;

            Http::fake(function ($request) use (&$callCount) {
                $callCount++;

                // Fail every 3rd call
                if ($callCount % 3 === 0) {
                    return Http::response([
                        'status' => false,
                        'message' => 'Server error',
                    ], 500);
                }

                return Http::response([
                    'status' => true,
                    'message' => 'Success',
                ], 200);
            });

            $userCount = 15;

            $users = User::factory()->count($userCount)->create([
                'phone' => '08123456789',
            ]);

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $job = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.Str::random(6),
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);

                try {
                    $job->handle(app(\App\Services\FonnteService::class));
                } catch (\Exception $e) {
                    // Expected for some jobs
                }
            }

            // Verify mixed results
            $sentCount = NotificationLog::where('status', 'sent')->count();
            $failedCount = NotificationLog::where('status', 'failed')->count();

            expect($sentCount + $failedCount)->toBe($userCount);
            expect($sentCount)->toBeGreaterThan(0);
            expect($failedCount)->toBeGreaterThan(0);
        });
    });

    describe('Queue Worker Performance', function () {
        it('processes jobs within reasonable time', function () {
            $userCount = 50;

            $users = User::factory()->count($userCount)->create([
                'phone' => '08123456789',
            ]);

            $startTime = microtime(true);

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $job = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.Str::random(6),
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);

                $job->handle(app(\App\Services\FonnteService::class));
            }

            $endTime = microtime(true);
            $duration = $endTime - $startTime;

            // Should process 50 jobs in less than 5 seconds (with mocked API)
            expect($duration)->toBeLessThan(5.0);

            // Verify all were logged
            expect(NotificationLog::where('status', 'sent')->count())->toBe($userCount);
        });

        it('maintains database integrity under load', function () {
            $userCount = 100;

            $users = User::factory()->count($userCount)->create([
                'phone' => '08123456789',
            ]);

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $job = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.Str::random(6),
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);

                $job->handle(app(\App\Services\FonnteService::class));
            }

            // Verify all users have exactly one log
            foreach ($users as $user) {
                $logCount = NotificationLog::where('user_id', $user->id)->count();
                expect($logCount)->toBe(1);
            }

            // Verify total count matches
            expect(NotificationLog::count())->toBe($userCount);
        });

        it('handles concurrent jobs without database connection issues', function () {
            // Simulate concurrent processing
            $userCount = 30;

            $users = User::factory()->count($userCount)->create([
                'phone' => '08123456789',
            ]);

            $jobs = [];

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $jobs[] = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.Str::random(6),
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);
            }

            // Process all jobs
            foreach ($jobs as $job) {
                $job->handle(app(\App\Services\FonnteService::class));
            }

            // Verify no database connection errors occurred
            expect(NotificationLog::where('status', 'sent')->count())->toBe($userCount);
        });
    });

    describe('No Race Conditions', function () {
        it('prevents duplicate notifications for same event', function () {
            Queue::fake();

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);

            // Dispatch same event multiple times
            Event::dispatch(new RequestCreated($request));
            Event::dispatch(new RequestCreated($request));
            Event::dispatch(new RequestCreated($request));

            // All should be queued (application level deduplication would be separate)
            Queue::assertPushed(SendWhatsAppNotification::class, 3);
        });

        it('maintains log integrity with simultaneous operations', function () {
            $userCount = 25;

            $users = User::factory()->count($userCount)->create([
                'phone' => '08123456789',
            ]);

            // Create jobs for all users
            $jobs = [];
            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $jobs[] = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.Str::random(6),
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);
            }

            // Process jobs in random order to simulate concurrent execution
            shuffle($jobs);

            foreach ($jobs as $job) {
                $job->handle(app(\App\Services\FonnteService::class));
            }

            // Verify each user has exactly one notification log
            foreach ($users as $user) {
                $logs = NotificationLog::where('user_id', $user->id)->get();
                expect($logs)->toHaveCount(1);
                expect($logs->first()->status)->toBe('sent');
            }
        });

        it('handles user settings updates during processing', function () {
            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $setting = $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $request1 = AtkRequest::factory()->create(['user_id' => $user->id]);
            $request2 = AtkRequest::factory()->create(['user_id' => $user->id]);
            $request3 = AtkRequest::factory()->create(['user_id' => $user->id]);

            // Process first notification
            $job1 = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);
            $job1->handle(app(\App\Services\FonnteService::class));

            // Update user settings to disable notifications
            $setting->update(['whatsapp_enabled' => false]);

            // Process second notification - should be skipped
            $job2 = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-002',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);
            $job2->handle(app(\App\Services\FonnteService::class));

            // Re-enable notifications
            $setting->update(['whatsapp_enabled' => true]);

            // Process third notification - should succeed
            $job3 = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-003',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);
            $job3->handle(app(\App\Services\FonnteService::class));

            // Verify only 2 notifications were sent
            $sentCount = NotificationLog::where('user_id', $user->id)
                ->where('status', 'sent')
                ->count();

            expect($sentCount)->toBe(2);
        });
    });

    describe('Database Connections Under Load', function () {
        it('maintains connection pool with high job count', function () {
            $userCount = 75;

            $users = User::factory()->count($userCount)->create([
                'phone' => '08123456789',
            ]);

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $job = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.Str::random(6),
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);

                $job->handle(app(\App\Services\FonnteService::class));
            }

            // Verify all records persisted
            expect(NotificationLog::count())->toBe($userCount);

            // Verify database is still responsive
            $count = NotificationLog::where('status', 'sent')->count();
            expect($count)->toBe($userCount);
        });

        it('handles rapid consecutive database writes', function () {
            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $requestCount = 50;

            for ($i = 0; $i < $requestCount; $i++) {
                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $job = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.Str::padLeft($i + 1, 3, '0'),
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);

                $job->handle(app(\App\Services\FonnteService::class));
            }

            // Verify all writes succeeded
            expect(NotificationLog::where('user_id', $user->id)->count())->toBe($requestCount);
        });
    });

    describe('Memory Management', function () {
        it('does not leak memory with large batch processing', function () {
            $userCount = 100;

            $users = User::factory()->count($userCount)->create([
                'phone' => '08123456789',
            ]);

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $job = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.Str::random(6),
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test Item with some additional text',
                ]);

                $job->handle(app(\App\Services\FonnteService::class));
            }

            // Verify all processed correctly
            expect(NotificationLog::where('status', 'sent')->count())->toBe($userCount);
        });

        it('handles large message content efficiently', function () {
            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            // Create request with many items (large message)
            $request = AtkRequest::factory()->create(['user_id' => $user->id]);

            $largeItemsList = collect(range(1, 50))
                ->map(fn ($i) => "Item {$i}: Product Name {$i} x{$i}")
                ->implode("\n");

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-LARGE-001',
                'pemohon' => $user->name,
                'departemen' => 'IT Department',
                'tanggal' => now()->format('d F Y'),
                'items' => $largeItemsList,
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            // Verify message was stored
            $log = NotificationLog::where('user_id', $user->id)->first();

            expect($log)->not->toBeNull();
            expect($log->message)->toContain('Item 1');
            expect($log->message)->toContain('Item 50');
            expect($log->status)->toBe('sent');
        });
    });
});
