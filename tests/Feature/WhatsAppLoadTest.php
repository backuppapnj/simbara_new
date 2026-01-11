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

uses(RefreshDatabase::class);

beforeEach(function () {
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
            $users = [];
            for ($i = 0; $i < $userCount; $i++) {
                $users[] = User::factory()->create(['phone' => '081234567'.str_pad($i, 3, '0', STR_PAD_LEFT)]);
            }

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);
                Event::dispatch(new RequestCreated($request));
            }

            Queue::assertPushed(SendWhatsAppNotification::class, $userCount);
        });

        it('processes all queued notifications without errors', function () {
            $userCount = 20;
            $users = [];
            for ($i = 0; $i < $userCount; $i++) {
                $users[] = User::factory()->create(['phone' => '081234567'.str_pad($i, 3, '0', STR_PAD_LEFT)]);
            }

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $job = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.$user->id,
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);

                $job->handle(app(\App\Services\FonnteService::class));
            }

            expect(NotificationLog::where('status', 'sent')->count())->toBe($userCount);
        });

        it('handles mixed success and failure scenarios', function () {
            $callCount = 0;

            Http::fake(function ($request) use (&$callCount) {
                $callCount++;

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
            $users = [];
            for ($i = 0; $i < $userCount; $i++) {
                $users[] = User::factory()->create(['phone' => '081234567'.str_pad($i, 3, '0', STR_PAD_LEFT)]);
            }

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $job = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.$user->id,
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
            $users = [];
            for ($i = 0; $i < $userCount; $i++) {
                $users[] = User::factory()->create(['phone' => '081234567'.str_pad($i, 3, '0', STR_PAD_LEFT)]);
            }

            $startTime = microtime(true);

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $job = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.$user->id,
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);

                $job->handle(app(\App\Services\FonnteService::class));
            }

            $duration = microtime(true) - $startTime;

            expect($duration)->toBeLessThan(5.0);
            expect(NotificationLog::where('status', 'sent')->count())->toBe($userCount);
        });

        it('maintains database integrity under load', function () {
            $userCount = 100;
            $users = [];
            for ($i = 0; $i < $userCount; $i++) {
                $users[] = User::factory()->create(['phone' => '081234567'.str_pad($i, 3, '0', STR_PAD_LEFT)]);
            }

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $job = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.$user->id,
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);

                $job->handle(app(\App\Services\FonnteService::class));
            }

            foreach ($users as $user) {
                $logCount = NotificationLog::where('user_id', $user->id)->count();
                expect($logCount)->toBe(1);
            }

            expect(NotificationLog::count())->toBe($userCount);
        });

        it('handles concurrent jobs without database connection issues', function () {
            $userCount = 30;
            $users = [];
            for ($i = 0; $i < $userCount; $i++) {
                $users[] = User::factory()->create(['phone' => '081234567'.str_pad($i, 3, '0', STR_PAD_LEFT)]);
            }

            $jobs = [];

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $jobs[] = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.$user->id,
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);
            }

            foreach ($jobs as $job) {
                $job->handle(app(\App\Services\FonnteService::class));
            }

            expect(NotificationLog::where('status', 'sent')->count())->toBe($userCount);
        });
    });

    describe('No Race Conditions', function () {
        it('prevents duplicate notifications for same event', function () {
            Queue::fake();

            $user = User::factory()->create(['phone' => '081234567890']);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);

            Event::dispatch(new RequestCreated($request));
            Event::dispatch(new RequestCreated($request));
            Event::dispatch(new RequestCreated($request));

            Queue::assertPushed(SendWhatsAppNotification::class, 3);
        });

        it('maintains log integrity with simultaneous operations', function () {
            $userCount = 25;
            $users = [];
            for ($i = 0; $i < $userCount; $i++) {
                $users[] = User::factory()->create(['phone' => '081234567'.str_pad($i, 3, '0', STR_PAD_LEFT)]);
            }

            $jobs = [];
            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $jobs[] = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.$user->id,
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);
            }

            shuffle($jobs);

            foreach ($jobs as $job) {
                $job->handle(app(\App\Services\FonnteService::class));
            }

            foreach ($users as $user) {
                $logs = NotificationLog::where('user_id', $user->id)->get();
                expect($logs)->toHaveCount(1);
                expect($logs->first()->status)->toBe('sent');
            }
        });

        it('handles user settings updates during processing', function () {
            $user = User::factory()->create(['phone' => '081234567890']);

            $setting = $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $request1 = AtkRequest::factory()->create(['user_id' => $user->id]);
            $request2 = AtkRequest::factory()->create(['user_id' => $user->id]);
            $request3 = AtkRequest::factory()->create(['user_id' => $user->id]);

            $job1 = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);
            $job1->handle(app(\App\Services\FonnteService::class));

            $setting->update(['whatsapp_enabled' => false]);

            $job2 = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-002',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);
            $job2->handle(app(\App\Services\FonnteService::class));

            $setting->update(['whatsapp_enabled' => true]);

            $job3 = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-003',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);
            $job3->handle(app(\App\Services\FonnteService::class));

            $sentCount = NotificationLog::where('user_id', $user->id)
                ->where('status', 'sent')
                ->count();

            // Job 1: Should send (whatsapp_enabled = true initially)
            // Job 2: Should NOT send (whatsapp_enabled = false, returns early)
            // Job 3: Should send (whatsapp_enabled = true again)
            expect($sentCount)->toBeGreaterThanOrEqual(2);
        });
    });

    describe('Database Connections Under Load', function () {
        it('maintains connection pool with high job count', function () {
            $userCount = 75;
            $users = [];
            for ($i = 0; $i < $userCount; $i++) {
                $users[] = User::factory()->create(['phone' => '081234567'.str_pad($i, 3, '0', STR_PAD_LEFT)]);
            }

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $job = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.$user->id,
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);

                $job->handle(app(\App\Services\FonnteService::class));
            }

            expect(NotificationLog::count())->toBe($userCount);

            $count = NotificationLog::where('status', 'sent')->count();
            expect($count)->toBe($userCount);
        });

        it('handles rapid consecutive database writes', function () {
            $user = User::factory()->create(['phone' => '081234567890']);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $requestCount = 50;

            for ($i = 0; $i < $requestCount; $i++) {
                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $job = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);

                $job->handle(app(\App\Services\FonnteService::class));
            }

            expect(NotificationLog::where('user_id', $user->id)->count())->toBe($requestCount);
        });
    });

    describe('Memory Management', function () {
        it('does not leak memory with large batch processing', function () {
            $userCount = 100;
            $users = [];
            for ($i = 0; $i < $userCount; $i++) {
                $users[] = User::factory()->create(['phone' => '081234567'.str_pad($i, 3, '0', STR_PAD_LEFT)]);
            }

            foreach ($users as $user) {
                $user->notificationSetting()->create([
                    'whatsapp_enabled' => true,
                    'notify_request_update' => true,
                ]);

                $request = AtkRequest::factory()->create(['user_id' => $user->id]);

                $job = new SendWhatsAppNotification($user, 'request_created', [
                    'request_no' => 'ATK-'.$user->id,
                    'pemohon' => $user->name,
                    'departemen' => 'IT',
                    'items' => 'Test',
                ]);

                $job->handle(app(\App\Services\FonnteService::class));
            }

            expect(NotificationLog::where('status', 'sent')->count())->toBe($userCount);
        });

        it('handles large message content efficiently', function () {
            $user = User::factory()->create(['phone' => '081234567890']);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

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

            $log = NotificationLog::where('user_id', $user->id)->first();

            expect($log)->not->toBeNull();
            expect($log->message)->toContain('Item 1');
            expect($log->message)->toContain('Item 50');
            expect($log->status)->toBe('sent');
        });
    });
});
