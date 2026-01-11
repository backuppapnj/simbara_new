<?php

use App\Events\ApprovalNeeded;
use App\Events\ReorderPointAlert;
use App\Events\RequestCreated;
use App\Jobs\SendWhatsAppNotification;
use App\Models\AtkRequest;
use App\Models\Item;
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

describe('End-to-End WhatsApp Notification Tests', function () {
    describe('RequestCreated Flow', function () {
        it('dispatches job when request event is fired', function () {
            Queue::fake();

            $user = User::factory()->create(['phone' => '08123456789']);
            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);
            Event::dispatch(new RequestCreated($request));

            Queue::assertPushed(SendWhatsAppNotification::class);
        });

        it('processes notification job and creates success log', function () {
            $user = User::factory()->create(['phone' => '08123456789']);
            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => $request->no_permintaan,
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'tanggal' => now()->format('d F Y'),
                'items' => 'Test Item x10',
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'request_created',
                'status' => 'sent',
                'phone' => $user->phone,
            ]);
        });

        it('generates correct message content', function () {
            $user = User::factory()->create(['phone' => '08123456789']);
            $user->notificationSetting()->create(['whatsapp_enabled' => true, 'notify_request_update' => true]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => 'John Doe',
                'departemen' => 'IT',
                'items' => 'Test Item',
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            $log = $user->notificationLogs()->where('event_type', 'request_created')->first();
            expect($log->message)->toContain('ATK-001');
            expect($log->message)->toContain('John Doe');
            expect($log->message)->toContain('IT');
        });
    });

    describe('ApprovalNeeded Flow', function () {
        it('dispatches job for L2 approval', function () {
            Queue::fake();

            $user = User::factory()->create(['phone' => '08123456789']);
            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_approval_needed' => true,
            ]);

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);
            Event::dispatch(new ApprovalNeeded($request, 2, 'kasubag'));

            Queue::assertPushed(SendWhatsAppNotification::class, function ($job) {
                return $job->eventType === 'approval_needed' && $job->data['level'] === 2;
            });
        });

        it('dispatches job for L3 approval', function () {
            Queue::fake();

            $user = User::factory()->create(['phone' => '08123456789']);
            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_approval_needed' => true,
            ]);

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);
            Event::dispatch(new ApprovalNeeded($request, 3, 'kpa'));

            Queue::assertPushed(SendWhatsAppNotification::class, function ($job) {
                return $job->eventType === 'approval_needed' && $job->data['level'] === 3;
            });
        });

        it('processes approval notification successfully', function () {
            $user = User::factory()->create(['phone' => '08123456789']);
            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_approval_needed' => true,
            ]);

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);

            $job = new SendWhatsAppNotification($user, 'approval_needed', [
                'request_no' => $request->no_permintaan,
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'level' => 3,
                'items' => 'Test Item x10',
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'approval_needed',
                'status' => 'sent',
            ]);
        });
    });

    describe('ReorderPointAlert Flow', function () {
        it('dispatches job when stock is low', function () {
            Queue::fake();

            $user = User::factory()->create(['phone' => '08123456789']);
            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_reorder_alert' => true,
            ]);

            $item = Item::factory()->create(['stok' => 5, 'stok_minimal' => 10]);
            Event::dispatch(new ReorderPointAlert($item));

            Queue::assertPushed(SendWhatsAppNotification::class, function ($job) {
                return $job->eventType === 'reorder_alert';
            });
        });

        it('processes reorder alert successfully', function () {
            $user = User::factory()->create(['phone' => '08123456789']);
            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_reorder_alert' => true,
            ]);

            $item = Item::factory()->create(['stok' => 5, 'stok_minimal' => 10]);

            $job = new SendWhatsAppNotification($user, 'reorder_alert', [
                'item_name' => $item->nama_barang,
                'current_stock' => 5,
                'min_stock' => 10,
                'unit' => 'pcs',
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'reorder_alert',
                'status' => 'sent',
            ]);
        });

        it('generates correct reorder alert message', function () {
            $user = User::factory()->create(['phone' => '08123456789']);
            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_reorder_alert' => true,
            ]);

            $job = new SendWhatsAppNotification($user, 'reorder_alert', [
                'item_name' => 'Pulpen Hitam',
                'current_stock' => 5,
                'min_stock' => 20,
                'unit' => 'pcs',
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            $log = $user->notificationLogs()->where('event_type', 'reorder_alert')->first();
            expect($log->message)->toContain('Pulpen Hitam');
            expect($log->message)->toContain('5 pcs');
            expect($log->message)->toContain('20 pcs');
        });
    });

    describe('Quiet Hours', function () {
        it('skips notification during quiet hours', function () {
            $user = User::factory()->create(['phone' => '08123456789']);
            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
                'quiet_hours_start' => '22:00',
                'quiet_hours_end' => '06:00',
            ]);

            $this->travelTo(now()->setHour(23)->setMinute(0));

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            $this->assertDatabaseMissing('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'request_created',
            ]);

            $this->travelBack();
        });

        it('sends notification outside quiet hours', function () {
            $user = User::factory()->create(['phone' => '08123456789']);
            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
                'quiet_hours_start' => '22:00',
                'quiet_hours_end' => '06:00',
            ]);

            $this->travelTo(now()->setHour(10)->setMinute(0));

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);

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
            ]);

            $this->travelBack();
        });
    });

    describe('Disabled Settings Skip', function () {
        it('skips when WhatsApp is disabled', function () {
            $user = User::factory()->create(['phone' => '08123456789']);
            $user->notificationSetting()->create([
                'whatsapp_enabled' => false,
                'notify_request_update' => true,
            ]);

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            $this->assertDatabaseMissing('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'request_created',
            ]);
        });

        it('skips when specific event is disabled', function () {
            $user = User::factory()->create(['phone' => '08123456789']);
            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_reorder_alert' => false,
            ]);

            $item = Item::factory()->create(['stok' => 5, 'stok_minimal' => 10]);

            $job = new SendWhatsAppNotification($user, 'reorder_alert', [
                'item_name' => $item->nama_barang,
                'current_stock' => 5,
                'min_stock' => 10,
                'unit' => 'pcs',
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            $this->assertDatabaseMissing('notification_logs', [
                'user_id' => $user->id,
                'event_type' => 'reorder_alert',
            ]);
        });

        it('skips when user has no phone', function () {
            $user = User::factory()->create(['phone' => null]);
            $user->notificationSetting()->create([
                'whatsapp_enabled' => true,
                'notify_request_update' => true,
            ]);

            $request = AtkRequest::factory()->create(['user_id' => $user->id]);

            $job = new SendWhatsAppNotification($user, 'request_created', [
                'request_no' => 'ATK-001',
                'pemohon' => $user->name,
                'departemen' => 'IT',
                'items' => 'Test',
            ]);

            $job->handle(app(\App\Services\FonnteService::class));

            $this->assertDatabaseMissing('notification_logs', ['user_id' => $user->id]);
        });
    });
});
