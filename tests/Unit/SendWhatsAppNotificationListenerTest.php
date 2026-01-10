<?php

use App\Events\ApprovalNeeded;
use App\Events\ReorderPointAlert;
use App\Events\RequestCreated;
use App\Listeners\SendWhatsAppNotificationListener;
use App\Models\AtkRequest;
use App\Models\Item;
use App\Models\NotificationSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

describe('SendWhatsAppNotificationListener', function () {
    beforeEach(function () {
        // Clear any previous fakes
        Event::fake();
        Queue::fake();
    });

    it('handles RequestCreated event', function () {
        $user = User::factory()->create(['phone' => '+6281234567890']);
        $department = \App\Models\Department::create([
            'nama_unit' => 'Test Department',
            'singkat' => 'TST',
            'kepala_unit' => 'Test User',
        ]);
        $request = AtkRequest::factory()->for($user)->for($department)->create();
        NotificationSetting::factory()->for($user)->create([
            'whatsapp_enabled' => true,
            'notify_request_update' => true,
        ]);

        $event = new RequestCreated($request);
        $listener = new SendWhatsAppNotificationListener;

        $listener->handle($event);

        // Verify job was dispatched
        Queue::assertPushed(\App\Jobs\SendWhatsAppNotification::class, function ($job) use ($user) {
            return $job->user->id === $user->id
                && $job->eventType === 'request_created';
        });
    });

    it('handles ApprovalNeeded event', function () {
        $user = User::factory()->create(['phone' => '+6281234567890']);
        $department = \App\Models\Department::create([
            'nama_unit' => 'Test Department',
            'singkat' => 'TST',
            'kepala_unit' => 'Test User',
        ]);
        $request = AtkRequest::factory()->for($user)->for($department)->create();
        NotificationSetting::factory()->for($user)->create([
            'whatsapp_enabled' => true,
            'notify_approval_needed' => true,
        ]);

        $event = new ApprovalNeeded($request, 2, 'Kasubag Umum');
        $listener = new SendWhatsAppNotificationListener;

        $listener->handle($event);

        // Verify job was dispatched
        Queue::assertPushed(\App\Jobs\SendWhatsAppNotification::class, function ($job) use ($user) {
            return $job->user->id === $user->id
                && $job->eventType === 'approval_needed';
        });
    });

    it('handles ReorderPointAlert event', function () {
        // Create an operator user who should receive reorder alerts
        $operator = User::factory()->create(['phone' => '+6281234567890']);
        NotificationSetting::factory()->for($operator)->create([
            'whatsapp_enabled' => true,
            'notify_reorder_alert' => true,
        ]);

        $item = Item::create([
            'kode_barang' => 'ATK-TEST',
            'nama_barang' => 'Test Item',
            'satuan' => 'pcs',
            'kategori' => 'atk',
            'stok' => 15,
            'stok_minimal' => 20,
            'stok_maksimal' => 100,
        ]);

        $event = new ReorderPointAlert($item);
        $listener = new SendWhatsAppNotificationListener;

        $listener->handle($event);

        // Verify job was dispatched
        Queue::assertPushed(\App\Jobs\SendWhatsAppNotification::class, function ($job) use ($operator) {
            return $job->user->id === $operator->id
                && $job->eventType === 'reorder_alert';
        });
    });

    it('does not dispatch job if user has whatsapp disabled', function () {
        $user = User::factory()->create(['phone' => '+6281234567890']);
        $department = \App\Models\Department::create([
            'nama_unit' => 'Test Department',
            'singkat' => 'TST',
            'kepala_unit' => 'Test User',
        ]);
        $request = AtkRequest::factory()->for($user)->for($department)->create();
        NotificationSetting::factory()->for($user)->create([
            'whatsapp_enabled' => false,
            'notify_request_update' => true,
        ]);

        $event = new RequestCreated($request);
        $listener = new SendWhatsAppNotificationListener;

        $listener->handle($event);

        // Verify job was NOT dispatched
        Queue::assertNotPushed(\App\Jobs\SendWhatsAppNotification::class);
    });

    it('does not dispatch job if user has notification type disabled', function () {
        $user = User::factory()->create(['phone' => '+6281234567890']);
        $department = \App\Models\Department::create([
            'nama_unit' => 'Test Department',
            'singkat' => 'TST',
            'kepala_unit' => 'Test User',
        ]);
        $request = AtkRequest::factory()->for($user)->for($department)->create();
        NotificationSetting::factory()->for($user)->create([
            'whatsapp_enabled' => true,
            'notify_request_update' => false,
        ]);

        $event = new RequestCreated($request);
        $listener = new SendWhatsAppNotificationListener;

        $listener->handle($event);

        // Verify job was NOT dispatched
        Queue::assertNotPushed(\App\Jobs\SendWhatsAppNotification::class);
    });

    it('does not dispatch job if user has no phone number', function () {
        $user = User::factory()->create(['phone' => null]);
        $department = \App\Models\Department::create([
            'nama_unit' => 'Test Department',
            'singkat' => 'TST',
            'kepala_unit' => 'Test User',
        ]);
        $request = AtkRequest::factory()->for($user)->for($department)->create();
        NotificationSetting::factory()->for($user)->create([
            'whatsapp_enabled' => true,
            'notify_request_update' => true,
        ]);

        $event = new RequestCreated($request);
        $listener = new SendWhatsAppNotificationListener;

        $listener->handle($event);

        // Verify job was NOT dispatched
        Queue::assertNotPushed(\App\Jobs\SendWhatsAppNotification::class);
    });

    it('checks quiet hours before dispatching job', function () {
        $user = User::factory()->create(['phone' => '+6281234567890']);
        $department = \App\Models\Department::create([
            'nama_unit' => 'Test Department',
            'singkat' => 'TST',
            'kepala_unit' => 'Test User',
        ]);
        $request = AtkRequest::factory()->for($user)->for($department)->create();
        NotificationSetting::factory()->for($user)->create([
            'whatsapp_enabled' => true,
            'notify_request_update' => true,
            'quiet_hours_start' => '22:00',
            'quiet_hours_end' => '06:00',
        ]);

        $event = new RequestCreated($request);
        $listener = new SendWhatsAppNotificationListener;

        $listener->handle($event);

        // Quiet hours check is done in the job, so job should still be dispatched
        // The job itself will handle the quiet hours logic
        Queue::assertPushed(\App\Jobs\SendWhatsAppNotification::class);
    });
});
