<?php

use App\Models\NotificationLog;
use App\Models\NotificationSetting;
use App\Models\User;

describe('Model Relationships', function () {
    describe('User relationships', function () {
        test('user has one notification setting', function () {
            $user = User::factory()->create();
            $setting = NotificationSetting::factory()->for($user)->create();

            expect($user->notificationSetting)->not->toBeNull();
            expect($user->notificationSetting->id)->toBe($setting->id);
            expect($user->notificationSetting->user_id)->toBe($user->id);
        });

        test('user can have many notification logs', function () {
            $user = User::factory()->create();

            NotificationLog::factory()->for($user)->count(3)->create();

            expect($user->notificationLogs)->toHaveCount(3);
            expect($user->notificationLogs->first()->user_id)->toBe($user->id);
        });

        test('user can have zero notification logs', function () {
            $user = User::factory()->create();

            expect($user->notificationLogs)->toHaveCount(0);
        });
    });

    describe('NotificationSetting relationships', function () {
        test('notification setting belongs to a user', function () {
            $user = User::factory()->create();
            $setting = NotificationSetting::factory()->for($user)->create();

            expect($setting->user)->not->toBeNull();
            expect($setting->user->id)->toBe($user->id);
        });
    });

    describe('NotificationLog relationships', function () {
        test('notification log belongs to a user', function () {
            $user = User::factory()->create();
            $log = NotificationLog::factory()->for($user)->create();

            expect($log->user)->not->toBeNull();
            expect($log->user->id)->toBe($user->id);
        });
    });

    describe('Relationship cascading', function () {
        test('notification setting is deleted when user is deleted', function () {
            $user = User::factory()->create();
            $setting = NotificationSetting::factory()->for($user)->create();

            $user->delete();

            expect(NotificationSetting::find($setting->id))->toBeNull();
        });

        test('notification logs are deleted when user is deleted', function () {
            $user = User::factory()->create();
            $logs = NotificationLog::factory()->for($user)->count(3)->create();

            $user->delete();

            foreach ($logs as $log) {
                expect(NotificationLog::find($log->id))->toBeNull();
            }
        });
    });
});
