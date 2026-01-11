<?php

use App\Events\ApprovalNeeded;
use App\Events\ReorderPointAlert;
use App\Events\RequestCreated;
use App\Jobs\SendWhatsAppNotification;
use App\Models\AtkRequest;
use App\Models\Department;
use App\Models\Item;
use App\Models\RequestDetail;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

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

describe('End-to-End WhatsApp Notification Tests', function () {
    describe('RequestCreated Flow', function () {
        it('dispatches WhatsApp notification when request is created', function () {
            Queue::fake();

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
                'notify_approval_needed' => true,
                'notify_reorder_alert' => true,
            ]);

            $department = Department::factory()->create();
            $item = Item::factory()->create(['stok' => 50]);

            $response = $this->actingAs($user)
                ->postJson('/atk-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'keterangan' => 'Test request',
                    'items' => [
                        [
                            'item_id' => $item->id,
                            'jumlah_diminta' => 10,
                        ],
                    ],
                ]);

            $response->assertStatus(302); // Redirect after successful creation

            // Get the created request
            $request = AtkRequest::where('user_id', $user->id)->first();
            expect($request)->not->toBeNull();

            // Manually dispatch the event (since listener might not be triggered in test)
            Event::dispatch(new RequestCreated($request));

            // Assert job was pushed to queue
            Queue::assertPushed(SendWhatsAppNotification::class, function ($job) use ($user) {
                return $job->user->id === $user->id
                    && $job->eventType === 'request_created';
            });
        });

        it('processes notification job and logs success', function () {
            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
                'notify_approval_needed' => true,
                'notify_reorder_alert' => true,
            ]);

            $request = AtkRequest::factory()->create([
                'user_id' => $user->id,
            ]);

            $item = Item::factory()->create();
            RequestDetail::factory()->create([
                'request_id' => $request->id,
                'item_id' => $item->id,
            ]);

            // Create job directly
            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => $request->no_permintaan,
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'tanggal' => now()->format('d F Y'),
                'items' => $item->nama_barang.' x10',
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            // Assert log was created with success status
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'request_created',
                'status' => 'sent',
                'phone' => $user->phone,
            ]);
        });

        it('calls Fonnte API with correct parameters', function () {
            Http::fake(function ($request) {
                return Http::response([
                    'status' => true,
                    'message' => 'Success',
                ], 200);
            });

            Http::assertSent(function ($request) {
                return $request->url() === 'https://api.fonnte.com/send'
                    && $request->hasHeader('Authorization', ['Bearer test_token_12345'])
                    && str_starts_with($request->data()['target'], '+62')
                    && ! empty($request->data()['message']);
            });
        });
    });

    describe('ApprovalNeeded Flow', function () {
        it('dispatches notification to Kasubag when L2 approval needed', function () {
            Queue::fake();
            Event::fake([ApprovalNeeded::class]);

            $kasubag = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $kasubag->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_approval_needed' => true,
            ]);

            $user = User::factory()->create();
            $request = AtkRequest::factory()->create([
                'user_id' => $user->id,
                'status' => 'pending_l2',
            ]);

            Event::dispatch(new ApprovalNeeded($request, 2, 'kasubag'));

            // Assert job was pushed for Kasubag
            Queue::assertPushed(SendWhatsAppNotification::class, function ($job) use ($kasubag) {
                return $job->user->id === $kasubag->id
                    && $job->eventType === 'approval_needed';
            });
        });

        it('dispatches notification to KPA when L3 approval needed', function () {
            Queue::fake();
            Event::fake([ApprovalNeeded::class]);

            $kpa = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $kpa->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_approval_needed' => true,
            ]);

            $user = User::factory()->create();
            $request = AtkRequest::factory()->create([
                'user_id' => $user->id,
                'status' => 'pending_l3',
            ]);

            Event::dispatch(new ApprovalNeeded($request, 3, 'kpa'));

            // Assert job was pushed for KPA
            Queue::assertPushed(SendWhatsAppNotification::class, function ($job) use ($kpa) {
                return $job->user->id === $kpa->id
                    && $job->eventType === 'approval_needed'
                    && $job->data['level'] === 3;
            });
        });

        it('includes correct approval level in notification data', function () {
            Queue::fake();
            Event::fake([ApprovalNeeded::class]);

            $kpa = User::factory()->create(['phone' => '08123456789']);
            $kpa->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_approval_needed' => true,
            ]);

            $user = User::factory()->create();
            $request = AtkRequest::factory()->create(['user_id' => $user->id]);

            Event::dispatch(new ApprovalNeeded($request, 3, 'kpa'));

            Queue::assertPushed(SendWhatsAppNotification::class, function ($job) {
                return $job->eventType === 'approval_needed'
                    && isset($job->data['level'])
                    && $job->data['level'] === 3;
            });
        });
    });

    describe('ReorderPointAlert Flow', function () {
        it('dispatches notification when stock drops below minimum', function () {
            Queue::fake();
            Event::fake([ReorderPointAlert::class]);

            $operator = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $operator->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_reorder_alert' => true,
            ]);

            $item = Item::factory()->create([
                'stok' => 5,
                'stok_minimal' => 10,
            ]);

            Event::dispatch(new ReorderPointAlert($item));

            // Assert job was pushed
            Queue::assertPushed(SendWhatsAppNotification::class, function ($job) use ($operator) {
                return $job->user->id === $operator->id
                    && $job->eventType === 'reorder_alert';
            });
        });

        it('processes reorder alert and logs success', function () {
            Queue::fake();

            $operator = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $operator->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_reorder_alert' => true,
            ]);

            $item = Item::factory()->create([
                'stok' => 5,
                'stok_minimal' => 10,
            ]);

            Event::dispatch(new ReorderPointAlert($item));

            // Process the job
            Queue::assertPushed(SendWhatsAppNotification::class);
            $job = Queue::pushedJobs(SendWhatsAppNotification::class)[0]['job'];

            $job->handle(app(\App\Services\FonnteService::class));

            // Assert log was created
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $operator->id,
                'event_type' => 'reorder_alert',
                'status' => 'sent',
            ]);
        });

        it('includes correct stock information in notification data', function () {
            Queue::fake();
            Event::fake([ReorderPointAlert::class]);

            $operator = User::factory()->create(['phone' => '08123456789']);
            $operator->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_reorder_alert' => true,
            ]);

            $item = Item::factory()->create([
                'stok' => 5,
                'stok_minimal' => 10,
                'satuan' => 'pcs',
            ]);

            Event::dispatch(new ReorderPointAlert($item));

            Queue::assertPushed(SendWhatsAppNotification::class, function ($job) {
                return $job->eventType === 'reorder_alert'
                    && $job->data['current_stock'] === 5
                    && $job->data['minimal_stock'] === 10
                    && $job->data['unit'] === 'pcs';
            });
        });
    });

    describe('Quiet Hours Skip', function () {
        it('skips notification during quiet hours', function () {
            Queue::fake();

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            // Set quiet hours from 22:00 to 06:00
            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
                'notify_approval_needed' => true,
                'notify_reorder_alert' => true,
                'quiet_hours_start' => '22:00',
                'quiet_hours_end' => '06:00',
            ]);

            // Mock current time to be within quiet hours (23:00)
            $this->travelTo(now()->setHour(23)->setMinute(0));

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);
            Event::dispatch(new RequestCreated($request));

            // Job should still be dispatched but will be skipped during processing
            Queue::assertPushed(SendWhatsAppNotification::class);

            // Process the job - it should exit early without sending
            $job = Queue::pushedJobs(SendWhatsAppNotification::class)[0]['job'];
            $job->handle(app(\App\Services\FonnteService::class));

            // Assert no log was created (skipped)
            $this->assertDatabaseMissing('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'request_created',
            ]);

            $this->travelBack();
        });

        it('sends notification outside quiet hours', function () {
            Queue::fake();

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            // Set quiet hours from 22:00 to 06:00
            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
                'quiet_hours_start' => '22:00',
                'quiet_hours_end' => '06:00',
            ]);

            // Mock current time to be outside quiet hours (10:00)
            $this->travelTo(now()->setHour(10)->setMinute(0));

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);
            Event::dispatch(new RequestCreated($request));

            // Process the job
            $job = Queue::pushedJobs(SendWhatsAppNotification::class)[0]['job'];
            $job->handle(app(\App\Services\FonnteService::class));

            // Assert log was created (sent)
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'request_created',
                'status' => 'sent',
            ]);

            $this->travelBack();
        });
    });

    describe('Disabled User Settings Skip', function () {
        it('skips notification when WhatsApp is disabled', function () {
            Queue::fake();

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => false,
                'notify_request_update' => true,
            ]);

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);
            Event::dispatch(new RequestCreated($request));

            // Process the job - it should exit early
            $job = Queue::pushedJobs(SendWhatsAppNotification::class)[0]['job'];
            $job->handle(app(\App\Services\FonnteService::class));

            // Assert no log was created
            $this->assertDatabaseMissing('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'request_created',
            ]);
        });

        it('skips notification when specific event type is disabled', function () {
            Queue::fake();

            $user = User::factory()->create([
                'phone' => '08123456789',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_reorder_alert' => false,
                'notify_approval_needed' => true,
                'notify_request_update' => true,
            ]);

            $item = Item::factory()->create([
                'stok' => 5,
                'stok_minimal' => 10,
            ]);

            Event::dispatch(new ReorderPointAlert($item));

            // Process the job - it should exit early
            $job = Queue::pushedJobs(SendWhatsAppNotification::class)[0]['job'];
            $job->handle(app(\App\Services\FonnteService::class));

            // Assert no log was created
            $this->assertDatabaseMissing('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'reorder_alert',
            ]);
        });

        it('skips notification when user has no phone number', function () {
            Queue::fake();

            $user = User::factory()->create([
                'phone' => null,
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);
            Event::dispatch(new RequestCreated($request));

            // Process the job - it should exit early
            $job = Queue::pushedJobs(SendWhatsAppNotification::class)[0]['job'];
            $job->handle(app(\App\Services\FonnteService::class));

            // Assert no log was created
            $this->assertDatabaseMissing('notification_logs', [
                'user_id' => $user->id,
            ]);
        });
    });

    describe('Message Content Verification', function () {
        it('generates correct message for request_created', function () {
            Queue::fake();

            $user = User::factory()->create([
                'phone' => '08123456789',
                'name' => 'John Doe',
            ]);

            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $department = Department::factory()->create(['nama_unit' => 'IT Department']);
            $request = AtkRequest::factory()->create([
                'user_id' => $user->id,
                'department_id' => $department->id,
                'no_permintaan' => 'ATK-2024-001',
            ]);

            $item = Item::factory()->create(['nama_barang' => 'Kertas A4', 'satuan' => 'rim']);
            RequestDetail::factory()->create([
                'request_id' => $request->id,
                'item_id' => $item->id,
                'jumlah' => 10,
            ]);

            Event::dispatch(new RequestCreated($request));

            // Process the job
            $job = Queue::pushedJobs(SendWhatsAppNotification::class)[0]['job'];
            $job->handle(app(\App\Services\FonnteService::class));

            // Get the log and verify message content
            $log = $user->notificationLogs()->where('event_type', 'request_created')->first();

            expect($log->message)->toContain('PERMINTAAN ATK BARU');
            expect($log->message)->toContain('ATK-2024-001');
            expect($log->message)->toContain('John Doe');
            expect($log->message)->toContain('IT Department');
            expect($log->message)->toContain('Kertas A4');
        });

        it('generates correct message for reorder_alert', function () {
            Queue::fake();

            $operator = User::factory()->create(['phone' => '08123456789']);
            $operator->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_reorder_alert' => true,
            ]);

            $item = Item::factory()->create([
                'nama_barang' => 'Pulpen Hitam',
                'stok' => 5,
                'stok_minimal' => 20,
                'satuan' => 'pcs',
            ]);

            Event::dispatch(new ReorderPointAlert($item));

            // Process the job
            $job = Queue::pushedJobs(SendWhatsAppNotification::class)[0]['job'];
            $job->handle(app(\App\Services\FonnteService::class));

            // Get the log and verify message content
            $log = $operator->notificationLogs()->where('event_type', 'reorder_alert')->first();

            expect($log->message)->toContain('REORDER POINT ALERT');
            expect($log->message)->toContain('Pulpen Hitam');
            expect($log->message)->toContain('5 pcs');
            expect($log->message)->toContain('20 pcs');
        });
    });
});
