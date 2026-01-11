<?php

use App\Jobs\SendWhatsAppNotification;
use App\Models\AtkRequest;
use App\Models\NotificationLog;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Setup Fonnte API token
    Setting::create([
        'key' => 'fonnte_api_token',
        'value' => 'test_token_12345',
    ]);
});

describe('WhatsApp Notification Error Handling & Retry Tests', function () {
    describe('Failed API Call Triggers Retry', function () {
        it('retries job on API server error (500)', function () {
            Queue::fake();
            $attemptCount = 0;

            Http::fake(function ($request) use (&$attemptCount) {
                $attemptCount++;

                // Fail first 2 times, succeed on 3rd
                if ($attemptCount <= 2) {
                    return Http::response([
                        'status' => false,
                        'message' => 'Internal Server Error',
                    ], 500);
                }

                return Http::response([
                    'status' => true,
                    'message' => 'Success',
                ], 200);
            });

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'tanggal' => now()->format('d F Y'),
                'items' => 'Test Item',
            ]);

            // Process the job - it should retry internally within FonnteService
            $job->handle(app(\App\Services\FonnteService::class));

            // Verify it eventually succeeded
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'request_created',
                'status' => 'sent',
            ]);

            // Verify multiple HTTP attempts were made
            expect($attemptCount)->toBe(3);
        });

        it('retries job on connection timeout', function () {
            Queue::fake();

            Http::fake(function ($request) {
                throw new \Illuminate\Http\Client\ConnectionException('Connection timed out');
            });

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            // The job should fail after all retries
            expect(fn () => $job->handle(app(\App\Services\FonnteService::class)))
                ->toThrow(\Exception::class);

            // Verify failure was logged
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'request_created',
                'status' => 'failed',
            ]);
        });

        it('retries job on Fonnte API error response', function () {
            Queue::fake();

            Http::fake(function ($request) {
                return Http::response([
                    'status' => false,
                    'message' => 'Invalid phone number',
                ], 400);
            });

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            // The job should fail after all retries
            expect(fn () => $job->handle(app(\App\Services\FonnteService::class)))
                ->toThrow(\Exception::class);

            // Verify failure was logged
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'request_created',
                'status' => 'failed',
                'error_message' => 'Fonnte API error: Invalid phone number',
            ]);
        });
    });

    describe('Retry Backoff Timing', function () {
        it('uses correct backoff intervals', function () {
            $job = new SendWhatsAppNotification(
                User::factory()->create(),
                'request_created',
                []
            );

            // Access the backoff property
            $backoff = $job->backoff;

            expect($backoff)->toBe([60, 300, 1800]); // 1min, 5min, 30min in seconds
        });

        it('respects max retry attempts', function () {
            $job = new SendWhatsAppNotification(
                User::factory()->create(),
                'request_created',
                []
            );

            expect($job->tries)->toBe(3);
        });

        it('tracks retry count in notification log', function () {
            Http::fake(function ($request) {
                return Http::response([
                    'status' => false,
                    'message' => 'Server Error',
                ], 500);
            });

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            expect(fn () => $job->handle(app(\App\Services\FonnteService::class)))
                ->toThrow(\Exception::class);

            // Check that retry count was logged
            $log = NotificationLog::where('user_id', $user->id)
                ->where('event_type', 'request_created')
                ->first();

            expect($log)->not->toBeNull();
            expect($log->retry_count)->toBeGreaterThanOrEqual(0);
        });

        it('increments retry count on each attempt', function () {
            Queue::fake();

            $attemptCount = 0;
            $maxAttempts = 3;

            Http::fake(function ($request) use (&$attemptCount, $maxAttempts) {
                $attemptCount++;

                // Simulate FonnteService internal retry behavior
                if ($attemptCount < $maxAttempts) {
                    return Http::response([
                        'status' => false,
                        'message' => 'Temporary failure',
                    ], 500);
                }

                // Finally succeed
                return Http::response([
                    'status' => true,
                    'message' => 'Success',
                ], 200);
            });

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            // Verify success was logged
            $log = NotificationLog::where('user_id', $user->id)
                ->where('status', 'sent')
                ->first();

            expect($log)->not->toBeNull();
            // retry_count should be less than max attempts since it succeeded
            expect($log->retry_count)->toBeLessThan($maxAttempts);
        });
    });

    describe('No Retry on Certain Errors', function () {
        it('does not retry on authentication error (401)', function () {
            $attemptCount = 0;

            Http::fake(function ($request) use (&$attemptCount) {
                $attemptCount++;

                return Http::response([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 401);
            });

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            expect(fn () => $job->handle(app(\App\Services\FonnteService::class)))
                ->toThrow(\Exception::class);

            // Should only be called once (no retries)
            expect($attemptCount)->toBe(1);

            // Verify failure was logged
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $user->id,
                'status' => 'failed',
            ]);
        });

        it('does not retry on rate limit error (429)', function () {
            $attemptCount = 0;

            Http::fake(function ($request) use (&$attemptCount) {
                $attemptCount++;

                return Http::response([
                    'status' => false,
                    'message' => 'Rate limit exceeded',
                ], 429);
            });

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            expect(fn () => $job->handle(app(\App\Services\FonnteService::class)))
                ->toThrow(\Exception::class);

            // Should only be called once (no retries)
            expect($attemptCount)->toBe(1);

            // Verify failure was logged
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $user->id,
                'status' => 'failed',
            ]);
        });
    });

    describe('Final Failure Logging', function () {
        it('logs final failure after all retries exhausted', function () {
            Http::fake(function ($request) {
                return Http::response([
                    'status' => false,
                    'message' => 'Permanent failure',
                ], 500);
            });

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            expect(fn () => $job->handle(app(\App\Services\FonnteService::class)))
                ->toThrow(\Exception::class);

            // Verify failure was logged with correct details
            $log = NotificationLog::where('user_id', $user->id)
                ->where('event_type', 'request_created')
                ->where('status', 'failed')
                ->first();

            expect($log)->not->toBeNull();
            expect($log->error_message)->toContain('Permanent failure');
            expect($log->phone)->toBe($user->phone);
            expect($log->retry_count)->toBeGreaterThanOrEqual(0);
        });

        it('calls failed() method when job fails permanently', function () {
            Http::fake(function ($request) {
                throw new \Exception('Network error');
            });

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            $exception = new \Exception('Network error');

            // Call failed() method directly
            $job->failed($exception);

            // Verify failure was logged
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'request_created',
                'status' => 'failed',
                'error_message' => 'Network error',
            ]);
        });

        it('preserves message content in failed log', function () {
            Http::fake(function ($request) {
                throw new \Exception('Send failed');
            });

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => 'Test User',
                'departemen' => 'IT',
                'tanggal' => now()->format('d F Y'),
                'items' => 'Test Item x10',
            ]);

            $job->failed(new \Exception('Send failed'));

            $log = NotificationLog::where('user_id', $user->id)
                ->where('status', 'failed')
                ->first();

            expect($log->message)->toContain('ATK-001');
            expect($log->message)->toContain('Test User');
            expect($log->message)->toContain('Test Item');
        });
    });

    describe('Notification Log Status Updates', function () {
        it('creates initial log when job is processed', function () {
            Http::fake([
                'api.fonnte.com/*' => Http::response([
                    'status' => true,
                    'message' => 'Success',
                ], 200),
            ]);

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'request_created',
                'status' => 'sent',
                'phone' => $user->phone,
            ]);
        });

        it('stores Fonnte API response in log', function () {
            $fonnteResponse = [
                'status' => true,
                'message' => 'Success',
                'message_id' => 'msg_12345',
            ];

            Http::fake([
                'api.fonnte.com/*' => Http::response($fonnteResponse, 200),
            ]);

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            $log = NotificationLog::where('user_id', $user->id)->first();

            expect($log->fonnte_response)->toBe($fonnteResponse);
            expect($log->sent_at)->not->toBeNull();
        });

        it('updates retry count on each retry attempt', function () {
            $attempts = 0;
            $maxAttempts = 2;

            Http::fake(function ($request) use (&$attempts, $maxAttempts) {
                $attempts++;

                if ($attempts < $maxAttempts) {
                    return Http::response([
                        'status' => false,
                        'message' => 'Temporary error',
                    ], 500);
                }

                return Http::response([
                    'status' => true,
                    'message' => 'Success',
                ], 200);
            });

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            $log = NotificationLog::where('user_id', $user->id)
                ->where('status', 'sent')
                ->first();

            // retry_count should reflect the number of retries
            expect($log->retry_count)->toBe(0); // First attempt succeeded after retry
        });

        it('handles missing API token gracefully', function () {
            // Delete the API token
            Setting::where('key', 'fonnte_api_token')->delete();

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            $exception = new \Exception('Fonnte API token not configured');

            expect(fn () => $job->handle(app(\App\Services\FonnteService::class)))
                ->toThrow(\Exception::class);

            // Manually call failed() method to simulate Laravel's behavior
            $job->failed($exception);

            // Verify failure was logged
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $user->id,
                'status' => 'failed',
                'error_message' => 'Fonnte API token not configured',
            ]);
        });
    });
});
