<?php

use App\Models\NotificationSetting;
use App\Models\User;

test('returns false when quiet hours are not set', function () {
    $user = User::factory()->create();

    $setting = NotificationSetting::factory()->for($user)->create([
        'quiet_hours_start' => null,
        'quiet_hours_end' => null,
    ]);

    expect($setting->isQuietHours())->toBeFalse();
});

test('returns true when current time is within normal quiet hours range', function () {
    $user = User::factory()->create();

    // Quiet hours: 22:00 - 23:00
    $setting = NotificationSetting::factory()->for($user)->create([
        'quiet_hours_start' => '22:00',
        'quiet_hours_end' => '23:00',
    ]);

    // Mock current time to 22:30
    $this->travelTo('2026-01-11 22:30:00');

    expect($setting->isQuietHours())->toBeTrue();
});

test('returns false when current time is outside normal quiet hours range', function () {
    $user = User::factory()->create();

    // Quiet hours: 22:00 - 23:00
    $setting = NotificationSetting::factory()->for($user)->create([
        'quiet_hours_start' => '22:00',
        'quiet_hours_end' => '23:00',
    ]);

    // Mock current time to 21:00
    $this->travelTo('2026-01-11 21:00:00');

    expect($setting->isQuietHours())->toBeFalse();
});

test('returns true when current time is within overnight quiet hours range', function () {
    $user = User::factory()->create();

    // Quiet hours: 22:00 - 06:00 (overnight)
    $setting = NotificationSetting::factory()->for($user)->create([
        'quiet_hours_start' => '22:00',
        'quiet_hours_end' => '06:00',
    ]);

    // Mock current time to 23:00 (should be quiet)
    $this->travelTo('2026-01-11 23:00:00');

    expect($setting->isQuietHours())->toBeTrue();
});

test('returns true when current time is early morning during overnight quiet hours', function () {
    $user = User::factory()->create();

    // Quiet hours: 22:00 - 06:00 (overnight)
    $setting = NotificationSetting::factory()->for($user)->create([
        'quiet_hours_start' => '22:00',
        'quiet_hours_end' => '06:00',
    ]);

    // Mock current time to 05:00 (should be quiet)
    $this->travelTo('2026-01-11 05:00:00');

    expect($setting->isQuietHours())->toBeTrue();
});

test('returns false when current time is outside overnight quiet hours range', function () {
    $user = User::factory()->create();

    // Quiet hours: 22:00 - 06:00 (overnight)
    $setting = NotificationSetting::factory()->for($user)->create([
        'quiet_hours_start' => '22:00',
        'quiet_hours_end' => '06:00',
    ]);

    // Mock current time to 10:00 (should NOT be quiet)
    $this->travelTo('2026-01-11 10:00:00');

    expect($setting->isQuietHours())->toBeFalse();
});

test('returns true exactly at quiet hours start time', function () {
    $user = User::factory()->create();

    // Quiet hours: 22:00 - 06:00
    $setting = NotificationSetting::factory()->for($user)->create([
        'quiet_hours_start' => '22:00',
        'quiet_hours_end' => '06:00',
    ]);

    // Mock current time to exactly 22:00:00
    $this->travelTo('2026-01-11 22:00:00');

    expect($setting->isQuietHours())->toBeTrue();
});

test('returns true exactly at quiet hours end time', function () {
    $user = User::factory()->create();

    // Quiet hours: 22:00 - 06:00
    $setting = NotificationSetting::factory()->for($user)->create([
        'quiet_hours_start' => '22:00',
        'quiet_hours_end' => '06:00',
    ]);

    // Mock current time to exactly 06:00:00
    $this->travelTo('2026-01-11 06:00:00');

    expect($setting->isQuietHours())->toBeTrue();
});
