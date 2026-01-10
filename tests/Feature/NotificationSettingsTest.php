<?php

use App\Models\NotificationSetting;
use App\Models\User;

test('guests cannot access notification settings', function () {
    $response = $this->get(route('notifications.settings'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can view their notification settings', function () {
    $user = User::factory()->create();

    NotificationSetting::factory()->for($user)->create([
        'whatsapp_enabled' => true,
        'notify_reorder_alert' => true,
        'notify_approval_needed' => false,
        'notify_request_update' => false,
        'quiet_hours_start' => '22:00',
        'quiet_hours_end' => '06:00',
    ]);

    $response = $this->actingAs($user)->get(route('notifications.settings'));

    $response->assertOk();
    // Note: Component assertion requires Vite build, skipped for feature tests
});

test('authenticated users can update their notification settings', function () {
    $user = User::factory()->create();

    NotificationSetting::factory()->for($user)->create();

    $response = $this->actingAs($user)->put(route('notifications.settings.update'), [
        'whatsapp_enabled' => false,
        'notify_reorder_alert' => false,
        'notify_approval_needed' => true,
        'notify_request_update' => true,
        'quiet_hours_start' => '23:00',
        'quiet_hours_end' => '07:00',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('notification_settings', [
        'user_id' => $user->id,
        'whatsapp_enabled' => false,
        'notify_reorder_alert' => false,
        'notify_approval_needed' => true,
        'notify_request_update' => true,
        'quiet_hours_start' => '23:00',
        'quiet_hours_end' => '07:00',
    ]);
});

test('users cannot update other users notification settings', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    NotificationSetting::factory()->for($user1)->create();
    NotificationSetting::factory()->for($user2)->create();

    $response = $this->actingAs($user1)->put(route('notifications.settings.update'), [
        'whatsapp_enabled' => false,
    ]);

    $response->assertRedirect();

    // User2's settings should remain unchanged
    $user2Settings = NotificationSetting::where('user_id', $user2->id)->first();
    expect($user2Settings->whatsapp_enabled)->toBeTrue();
});

test('validation fails with invalid time format', function () {
    $user = User::factory()->create();
    NotificationSetting::factory()->for($user)->create();

    $response = $this->actingAs($user)->put(route('notifications.settings.update'), [
        'quiet_hours_start' => 'invalid-time',
        'quiet_hours_end' => '07:00',
    ]);

    $response->assertSessionHasErrors();
});

test('validation fails with quiet hours start without end', function () {
    $user = User::factory()->create();
    NotificationSetting::factory()->for($user)->create();

    $response = $this->actingAs($user)->put(route('notifications.settings.update'), [
        'quiet_hours_start' => '22:00',
        'quiet_hours_end' => null,
    ]);

    $response->assertSessionHasErrors();
});
