<?php

use App\Models\NotificationLog;
use App\Models\User;

describe('NotificationLog Model', function () {
    describe('fillable attributes', function () {
        test('user_id field is fillable', function () {
            $log = new NotificationLog;
            expect(in_array('user_id', $log->getFillable()))->toBeTrue();
        });

        test('event_type field is fillable', function () {
            $log = new NotificationLog;
            expect(in_array('event_type', $log->getFillable()))->toBeTrue();
        });

        test('phone field is fillable', function () {
            $log = new NotificationLog;
            expect(in_array('phone', $log->getFillable()))->toBeTrue();
        });

        test('message field is fillable', function () {
            $log = new NotificationLog;
            expect(in_array('message', $log->getFillable()))->toBeTrue();
        });

        test('status field is fillable', function () {
            $log = new NotificationLog;
            expect(in_array('status', $log->getFillable()))->toBeTrue();
        });

        test('fonnte_response field is fillable', function () {
            $log = new NotificationLog;
            expect(in_array('fonnte_response', $log->getFillable()))->toBeTrue();
        });

        test('error_message field is fillable', function () {
            $log = new NotificationLog;
            expect(in_array('error_message', $log->getFillable()))->toBeTrue();
        });

        test('retry_count field is fillable', function () {
            $log = new NotificationLog;
            expect(in_array('retry_count', $log->getFillable()))->toBeTrue();
        });

        test('sent_at field is fillable', function () {
            $log = new NotificationLog;
            expect(in_array('sent_at', $log->getFillable()))->toBeTrue();
        });
    });

    describe('casts configuration', function () {
        test('fonnte_response should be cast to array', function () {
            $log = new NotificationLog;
            $casts = $log->getCasts();
            expect($casts['fonnte_response'])->toBe('array');
        });

        test('sent_at should be cast to datetime', function () {
            $log = new NotificationLog;
            $casts = $log->getCasts();
            expect($casts['sent_at'])->toBe('datetime');
        });

        test('retry_count should be cast to integer', function () {
            $log = new NotificationLog;
            $casts = $log->getCasts();
            expect($casts['retry_count'])->toBe('int');
        });
    });

    describe('relationships', function () {
        test('belongs to a user', function () {
            $user = User::factory()->create();
            $log = NotificationLog::factory()->for($user)->create();

            expect($log->user)->not->toBeNull();
            expect($log->user->id)->toBe($user->id);
        });
    });

    describe('database interactions', function () {
        test('can create a notification log', function () {
            $user = User::factory()->create();

            $log = NotificationLog::create([
                'user_id' => $user->id,
                'event_type' => 'request_created',
                'phone' => '+6281234567890',
                'message' => 'Test message',
                'status' => 'sent',
                'fonnte_response' => ['status' => 'success'],
                'error_message' => null,
                'retry_count' => 0,
                'sent_at' => now(),
            ]);

            expect($log->event_type)->toBe('request_created');
            expect($log->phone)->toBe('+6281234567890');
            expect($log->message)->toBe('Test message');
            expect($log->status)->toBe('sent');
            expect($log->fonnte_response)->toBe(['status' => 'success']);
            expect($log->retry_count)->toBe(0);
        });

        test('can create a failed notification log', function () {
            $user = User::factory()->create();

            $log = NotificationLog::create([
                'user_id' => $user->id,
                'event_type' => 'approval_needed',
                'phone' => '+6281234567890',
                'message' => 'Test message',
                'status' => 'failed',
                'fonnte_response' => null,
                'error_message' => 'API Error: Connection timeout',
                'retry_count' => 3,
                'sent_at' => null,
            ]);

            expect($log->status)->toBe('failed');
            expect($log->error_message)->toBe('API Error: Connection timeout');
            expect($log->retry_count)->toBe(3);
        });

        test('can filter logs by status', function () {
            $user = User::factory()->create();

            NotificationLog::factory()->for($user)->create(['status' => 'sent']);
            NotificationLog::factory()->for($user)->create(['status' => 'failed']);
            NotificationLog::factory()->for($user)->create(['status' => 'sent']);

            $sentLogs = NotificationLog::where('status', 'sent')->get();
            $failedLogs = NotificationLog::where('status', 'failed')->get();

            expect($sentLogs->count())->toBe(2);
            expect($failedLogs->count())->toBe(1);
        });

        test('can filter logs by event type', function () {
            $user = User::factory()->create();

            NotificationLog::factory()->for($user)->create(['event_type' => 'request_created']);
            NotificationLog::factory()->for($user)->create(['event_type' => 'approval_needed']);
            NotificationLog::factory()->for($user)->create(['event_type' => 'request_created']);

            $requestLogs = NotificationLog::where('event_type', 'request_created')->get();
            $approvalLogs = NotificationLog::where('event_type', 'approval_needed')->get();

            expect($requestLogs->count())->toBe(2);
            expect($approvalLogs->count())->toBe(1);
        });

        test('can filter logs by user', function () {
            $user1 = User::factory()->create();
            $user2 = User::factory()->create();

            NotificationLog::factory()->for($user1)->count(3)->create();
            NotificationLog::factory()->for($user2)->count(2)->create();

            $user1Logs = NotificationLog::where('user_id', $user1->id)->get();
            $user2Logs = NotificationLog::where('user_id', $user2->id)->get();

            expect($user1Logs->count())->toBe(3);
            expect($user2Logs->count())->toBe(2);
        });
    });

    describe('status enum', function () {
        test('status can be pending', function () {
            $user = User::factory()->create();
            $log = NotificationLog::factory()->for($user)->create(['status' => 'pending']);
            expect($log->status)->toBe('pending');
        });

        test('status can be sent', function () {
            $user = User::factory()->create();
            $log = NotificationLog::factory()->for($user)->create(['status' => 'sent']);
            expect($log->status)->toBe('sent');
        });

        test('status can be failed', function () {
            $user = User::factory()->create();
            $log = NotificationLog::factory()->for($user)->create(['status' => 'failed']);
            expect($log->status)->toBe('failed');
        });

        test('status can be retrying', function () {
            $user = User::factory()->create();
            $log = NotificationLog::factory()->for($user)->create(['status' => 'retrying']);
            expect($log->status)->toBe('retrying');
        });
    });
});
