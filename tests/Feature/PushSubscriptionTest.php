<?php

use App\Models\User;
use App\Models\PushSubscription;
use App\Models\NotificationSetting;

beforeEach(function () {
    $this->user = User::factory()->create();
    NotificationSetting::factory()->for($this->user)->create();
});

test('user can create push subscription', function () {
    $response = $this->actingAs($this->user)
        ->post('/push-subscriptions', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
            'key' => 'test-key',
            'token' => 'test-token',
            'content_encoding' => 'aesgcm',
        ]);

    $response->assertStatus(201);
    $response->assertJson([
        'message' => 'Subscription saved successfully',
    ]);

    $this->assertDatabaseHas('push_subscriptions', [
        'user_id' => $this->user->id,
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
        'key' => 'test-key',
        'token' => 'test-token',
        'content_encoding' => 'aesgcm',
        'is_active' => true,
    ]);
});

test('user can update existing push subscription', function () {
    $subscription = PushSubscription::factory()->for($this->user)->create([
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
        'key' => 'old-key',
        'token' => 'old-token',
    ]);

    $response = $this->actingAs($this->user)
        ->post('/push-subscriptions', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
            'key' => 'new-key',
            'token' => 'new-token',
            'content_encoding' => 'aesgcm',
        ]);

    $response->assertStatus(201);

    $this->assertDatabaseHas('push_subscriptions', [
        'id' => $subscription->id,
        'key' => 'new-key',
        'token' => 'new-token',
    ]);
});

test('user can delete push subscription', function () {
    PushSubscription::factory()->for($this->user)->create([
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
    ]);

    $response = $this->actingAs($this->user)
        ->delete('/push-subscriptions', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
        ]);

    $response->assertStatus(200);
    $response->assertJson([
        'message' => 'Subscription deleted successfully',
    ]);

    $this->assertDatabaseMissing('push_subscriptions', [
        'user_id' => $this->user->id,
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
    ]);
});

test('user can get vapid public key', function () {
    config(['webpush.vapid.public_key' => 'test-public-key']);

    $response = $this->actingAs($this->user)
        ->get('/push-subscriptions/vapid-key');

    $response->assertStatus(200);
    $response->assertJson([
        'public_key' => 'test-public-key',
    ]);
});

test('guest cannot access push subscription endpoints', function () {
    $response = $this->post('/push-subscriptions', [
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
    ]);

    $response->assertRedirect();

    $response = $this->delete('/push-subscriptions', [
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
    ]);

    $response->assertRedirect();

    $response = $this->get('/push-subscriptions/vapid-key');

    $response->assertRedirect();
});

test('push subscription validation works correctly', function () {
    $response = $this->actingAs($this->user)
        ->post('/push-subscriptions', [
            'key' => 'test-key',
            'token' => 'test-token',
        ]);

    $response->assertSessionHasErrors('endpoint');
});

test('user can only delete their own subscriptions', function () {
    $otherUser = User::factory()->create();
    NotificationSetting::factory()->for($otherUser)->create();

    PushSubscription::factory()->for($otherUser)->create([
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
    ]);

    $response = $this->actingAs($this->user)
        ->delete('/push-subscriptions', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
        ]);

    $response->assertStatus(404);

    $this->assertDatabaseHas('push_subscriptions', [
        'user_id' => $otherUser->id,
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint',
    ]);
});
