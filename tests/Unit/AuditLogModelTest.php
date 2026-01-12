<?php

use App\Models\AuditLog;
use App\Models\User;

describe('AuditLog Model', function () {
    it('can be instantiated', function () {
        $auditLog = new AuditLog;

        expect($auditLog)->not->toBeNull();
    });

    it('has correct table name', function () {
        $auditLog = new AuditLog;

        expect($auditLog->getTable())->toBe('audit_logs');
    });

    it('has fillable attributes', function () {
        $auditLog = new AuditLog;

        expect($auditLog->getFillable())->toContain('user_id');
        expect($auditLog->getFillable())->toContain('actor_id');
        expect($auditLog->getFillable())->toContain('action');
        expect($auditLog->getFillable())->toContain('changes');
    });

    it('has casts attribute', function () {
        $auditLog = new AuditLog;

        expect($auditLog->getCasts())->toHaveKey('changes', 'array');
    });

    it('has timestamps', function () {
        $auditLog = new AuditLog;

        expect($auditLog->timestamps)->toBeTrue();
    });

    it('belongs to a user', function () {
        $user = User::factory()->create();
        $actor = User::factory()->create();

        $auditLog = AuditLog::factory()->create([
            'user_id' => $user->id,
            'actor_id' => $actor->id,
        ]);

        expect($auditLog->user)->toBeInstanceOf(User::class);
        expect($auditLog->user->id)->toBe($user->id);
    });

    it('belongs to an actor', function () {
        $user = User::factory()->create();
        $actor = User::factory()->create();

        $auditLog = AuditLog::factory()->create([
            'user_id' => $user->id,
            'actor_id' => $actor->id,
        ]);

        expect($auditLog->actor)->toBeInstanceOf(User::class);
        expect($auditLog->actor->id)->toBe($actor->id);
    });

    it('stores changes as JSON', function () {
        $changes = [
            'before' => ['name' => 'John Doe', 'email' => 'john@example.com'],
            'after' => ['name' => 'Jane Doe', 'email' => 'jane@example.com'],
        ];

        $auditLog = AuditLog::factory()->create([
            'changes' => $changes,
        ]);

        expect($auditLog->changes)->toBe($changes);
    });

    it('can be created with factory', function () {
        $auditLog = AuditLog::factory()->create();

        expect($auditLog)->toBeInstanceOf(AuditLog::class);
        expect($auditLog)->exists->toBeTrue();
    });

    it('has correct relationship with User model', function () {
        $user = User::factory()->create();
        $actor = User::factory()->create();

        $auditLog = AuditLog::factory()->create([
            'user_id' => $user->id,
            'actor_id' => $actor->id,
        ]);

        // Test user relationship
        expect($user->auditLogs)->toHaveCount(1);
        expect($user->auditLogs->first()->id)->toBe($auditLog->id);

        // Test actor relationship
        expect($actor->actorLogs)->toHaveCount(1);
        expect($actor->actorLogs->first()->id)->toBe($auditLog->id);
    });
});
