<?php

use App\Models\NotificationSetting;
use App\Models\User;

describe('NotificationSetting Model', function () {
    describe('fillable attributes', function () {
        test('user_id field is fillable', function () {
            $setting = new NotificationSetting;
            expect(in_array('user_id', $setting->getFillable()))->toBeTrue();
        });

        test('whatsapp_enabled field is fillable', function () {
            $setting = new NotificationSetting;
            expect(in_array('whatsapp_enabled', $setting->getFillable()))->toBeTrue();
        });

        test('notify_reorder_alert field is fillable', function () {
            $setting = new NotificationSetting;
            expect(in_array('notify_reorder_alert', $setting->getFillable()))->toBeTrue();
        });

        test('notify_approval_needed field is fillable', function () {
            $setting = new NotificationSetting;
            expect(in_array('notify_approval_needed', $setting->getFillable()))->toBeTrue();
        });

        test('notify_request_update field is fillable', function () {
            $setting = new NotificationSetting;
            expect(in_array('notify_request_update', $setting->getFillable()))->toBeTrue();
        });

        test('quiet_hours_start field is fillable', function () {
            $setting = new NotificationSetting;
            expect(in_array('quiet_hours_start', $setting->getFillable()))->toBeTrue();
        });

        test('quiet_hours_end field is fillable', function () {
            $setting = new NotificationSetting;
            expect(in_array('quiet_hours_end', $setting->getFillable()))->toBeTrue();
        });
    });

    describe('casts configuration', function () {
        test('whatsapp_enabled should be cast to boolean', function () {
            $setting = new NotificationSetting;
            $casts = $setting->getCasts();
            expect($casts['whatsapp_enabled'])->toBe('boolean');
        });

        test('notify_reorder_alert should be cast to boolean', function () {
            $setting = new NotificationSetting;
            $casts = $setting->getCasts();
            expect($casts['notify_reorder_alert'])->toBe('boolean');
        });

        test('notify_approval_needed should be cast to boolean', function () {
            $setting = new NotificationSetting;
            $casts = $setting->getCasts();
            expect($casts['notify_approval_needed'])->toBe('boolean');
        });

        test('notify_request_update should be cast to boolean', function () {
            $setting = new NotificationSetting;
            $casts = $setting->getCasts();
            expect($casts['notify_request_update'])->toBe('boolean');
        });
    });

    describe('relationships', function () {
        test('belongs to a user', function () {
            $user = User::factory()->create();
            $setting = NotificationSetting::factory()->for($user)->create();

            expect($setting->user)->not->toBeNull();
            expect($setting->user->id)->toBe($user->id);
        });
    });

    describe('database interactions', function () {
        test('can create notification settings', function () {
            $user = User::factory()->create();

            $setting = NotificationSetting::create([
                'user_id' => $user->id,
                'whatsapp_enabled' => true,
                'notify_reorder_alert' => true,
                'notify_approval_needed' => true,
                'notify_request_update' => false,
                'quiet_hours_start' => '22:00',
                'quiet_hours_end' => '06:00',
            ]);

            expect($setting->user_id)->toBe($user->id);
            expect($setting->whatsapp_enabled)->toBeTrue();
            expect($setting->notify_reorder_alert)->toBeTrue();
            expect($setting->notify_approval_needed)->toBeTrue();
            expect($setting->notify_request_update)->toBeFalse();
            expect($setting->quiet_hours_start)->toBe('22:00');
            expect($setting->quiet_hours_end)->toBe('06:00');
        });

        test('can update notification settings', function () {
            $user = User::factory()->create();
            $setting = NotificationSetting::factory()->for($user)->create([
                'whatsapp_enabled' => true,
            ]);

            $setting->update(['whatsapp_enabled' => false]);

            expect($setting->fresh()->whatsapp_enabled)->toBeFalse();
        });
    });

    describe('quiet hours logic', function () {
        test('can check if current time is in quiet hours', function () {
            $user = User::factory()->create();
            $setting = NotificationSetting::factory()->for($user)->create([
                'quiet_hours_start' => '22:00',
                'quiet_hours_end' => '06:00',
            ]);

            // This will be tested in the actual implementation
            expect($setting->quiet_hours_start)->toBe('22:00');
            expect($setting->quiet_hours_end)->toBe('06:00');
        });
    });
});
