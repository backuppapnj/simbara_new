<?php

use App\Models\AuditLog;
use App\Models\User;
use Database\Seeders\AuditLogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('AuditLogSeeder', function () {
    beforeEach(function () {
        // Seed roles and users first
        $this->seed(\Database\Seeders\RolesSeeder::class);
        $this->seed(\Database\Seeders\UsersSeeder::class);
    });

    it('creates sample audit logs', function () {
        $seeder = new AuditLogSeeder;
        $seeder->run();

        $count = AuditLog::count();

        expect($count)->toBeGreaterThan(0);
    });

    it('creates audit logs with valid user and actor references', function () {
        $seeder = new AuditLogSeeder;
        $seeder->run();

        $logs = AuditLog::with(['user', 'actor'])->get();

        foreach ($logs as $log) {
            expect($log->user)->not->toBeNull();
            expect($log->actor)->not->toBeNull();
        }
    });

    it('creates audit logs with different actions', function () {
        $seeder = new AuditLogSeeder;
        $seeder->run();

        $actions = AuditLog::pluck('action')->unique();

        expect($actions)->toContain('user_created');
        expect($actions)->toContain('user_updated');
        expect($actions)->toContain('role_assigned');
    });

    it('creates audit logs with proper changes structure', function () {
        $seeder = new AuditLogSeeder;
        $seeder->run();

        $logs = AuditLog::whereNotNull('changes')->get();

        foreach ($logs as $log) {
            expect($log->changes)->toBeArray();
        }
    });

    it('does not create duplicate logs on multiple runs', function () {
        // Run seeder first time
        $seeder = new AuditLogSeeder;
        $seeder->run();

        $countAfterFirstRun = AuditLog::count();

        // Run seeder second time
        $seeder->run();

        $countAfterSecondRun = AuditLog::count();

        expect($countAfterSecondRun)->toBe($countAfterFirstRun);
    });

    it('associates logs with existing users', function () {
        $userCount = User::count();

        $seeder = new AuditLogSeeder;
        $seeder->run();

        $logs = AuditLog::all();
        $userIds = User::pluck('id')->toArray();

        foreach ($logs as $log) {
            expect(in_array($log->user_id, $userIds))->toBeTrue();
            expect(in_array($log->actor_id, $userIds))->toBeTrue();
        }
    });

    it('creates a reasonable number of sample logs', function () {
        $seeder = new AuditLogSeeder;
        $seeder->run();

        $count = AuditLog::count();

        // Should create between 10 and 50 sample logs
        expect($count)->toBeGreaterThanOrEqual(10);
        expect($count)->toBeLessThanOrEqual(50);
    });
});
