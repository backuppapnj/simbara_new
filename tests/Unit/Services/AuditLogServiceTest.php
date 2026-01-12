<?php

use App\Models\User;
use App\Services\AuditLogService;

describe('AuditLogService', function () {
    beforeEach(function () {
        // Create a test user for each test
        $this->user = User::factory()->create();
        $this->actor = User::factory()->create();
    });

    it('can be instantiated', function () {
        $service = new AuditLogService;

        expect($service)->not->toBeNull();
    });

    it('logs user creation', function () {
        $changes = [
            'before' => null,
            'after' => [
                'name' => 'John Doe',
                'email' => 'john@example.com',
            ],
        ];

        $log = AuditLogService::logUserCreated($this->actor, $this->user, $changes);

        expect($log)->not->toBeNull();
        expect($log->action)->toBe('user_created');
        expect($log->user_id)->toBe($this->user->id);
        expect($log->actor_id)->toBe($this->actor->id);
        expect($log->changes)->toBe($changes);
    });

    it('logs user update', function () {
        $changes = [
            'before' => ['name' => 'John Doe'],
            'after' => ['name' => 'Jane Doe'],
        ];

        $log = AuditLogService::logUserUpdated($this->actor, $this->user, $changes);

        expect($log)->not->toBeNull();
        expect($log->action)->toBe('user_updated');
        expect($log->user_id)->toBe($this->user->id);
        expect($log->actor_id)->toBe($this->actor->id);
        expect($log->changes)->toBe($changes);
    });

    it('logs user deletion', function () {
        $changes = [
            'before' => ['name' => 'John Doe', 'email' => 'john@example.com'],
            'after' => null,
        ];

        $log = AuditLogService::logUserDeleted($this->actor, $this->user, $changes);

        expect($log)->not->toBeNull();
        expect($log->action)->toBe('user_deleted');
        expect($log->user_id)->toBe($this->user->id);
        expect($log->actor_id)->toBe($this->actor->id);
        expect($log->changes)->toBe($changes);
    });

    it('logs role assignment', function () {
        $changes = [
            'before' => ['roles' => ['user']],
            'after' => ['roles' => ['user', 'admin']],
        ];

        $log = AuditLogService::logRoleAssigned($this->actor, $this->user, $changes);

        expect($log)->not->toBeNull();
        expect($log->action)->toBe('role_assigned');
        expect($log->user_id)->toBe($this->user->id);
        expect($log->actor_id)->toBe($this->actor->id);
        expect($log->changes)->toBe($changes);
    });

    it('logs role removal', function () {
        $changes = [
            'before' => ['roles' => ['user', 'admin']],
            'after' => ['roles' => ['user']],
        ];

        $log = AuditLogService::logRoleRemoved($this->actor, $this->user, $changes);

        expect($log)->not->toBeNull();
        expect($log->action)->toBe('role_removed');
        expect($log->user_id)->toBe($this->user->id);
        expect($log->actor_id)->toBe($this->actor->id);
        expect($log->changes)->toBe($changes);
    });

    it('logs impersonate start', function () {
        $changes = [
            'actor' => $this->actor->name,
            'target' => $this->user->name,
        ];

        $log = AuditLogService::logImpersonateStart($this->actor, $this->user, $changes);

        expect($log)->not->toBeNull();
        expect($log->action)->toBe('impersonate_started');
        expect($log->user_id)->toBe($this->user->id);
        expect($log->actor_id)->toBe($this->actor->id);
        expect($log->changes)->toBe($changes);
    });

    it('logs impersonate stop', function () {
        $changes = [
            'actor' => $this->actor->name,
            'target' => $this->user->name,
        ];

        $log = AuditLogService::logImpersonateStop($this->actor, $this->user, $changes);

        expect($log)->not->toBeNull();
        expect($log->action)->toBe('impersonate_stopped');
        expect($log->user_id)->toBe($this->user->id);
        expect($log->actor_id)->toBe($this->actor->id);
        expect($log->changes)->toBe($changes);
    });

    it('logs generic action', function () {
        $action = 'custom_action';
        $changes = [
            'before' => ['status' => 'inactive'],
            'after' => ['status' => 'active'],
        ];

        $log = AuditLogService::log($this->actor, $this->user, $action, $changes);

        expect($log)->not->toBeNull();
        expect($log->action)->toBe($action);
        expect($log->user_id)->toBe($this->user->id);
        expect($log->actor_id)->toBe($this->actor->id);
        expect($log->changes)->toBe($changes);
    });

    it('stores changes as JSON in database', function () {
        $changes = [
            'before' => ['name' => 'John', 'email' => 'john@example.com'],
            'after' => ['name' => 'Jane', 'email' => 'jane@example.com'],
        ];

        $log = AuditLogService::log($this->actor, $this->user, 'user_updated', $changes);

        // Retrieve from database to verify JSON storage
        $retrievedLog = \App\Models\AuditLog::find($log->id);

        expect($retrievedLog->changes)->toBeArray();
        expect($retrievedLog->changes['before'])->toBe($changes['before']);
        expect($retrievedLog->changes['after'])->toBe($changes['after']);
    });

    it('handles null changes gracefully', function () {
        $log = AuditLogService::log($this->actor, $this->user, 'user_viewed', null);

        expect($log)->not->toBeNull();
        expect($log->changes)->toBeNull();
    });

    it('returns AuditLog model instance', function () {
        $changes = ['before' => [], 'after' => []];

        $log = AuditLogService::log($this->actor, $this->user, 'test_action', $changes);

        expect($log)->toBeInstanceOf(\App\Models\AuditLog::class);
        expect($log->exists)->toBeTrue();
    });
});
