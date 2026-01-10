<?php

use App\Events\ApprovalNeeded;
use App\Models\AtkRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

describe('ApprovalNeeded Event', function () {
    it('can be instantiated with an AtkRequest and approval level', function () {
        $request = AtkRequest::factory()->create();
        $event = new ApprovalNeeded($request, 2, 'Kasubag Umum');

        expect($event->request->id)->toBe($request->id);
        expect($event->level)->toBe(2);
        expect($event->role)->toBe('Kasubag Umum');
    });

    it('is dispatchable', function () {
        $request = AtkRequest::factory()->create();

        Event::fake();

        ApprovalNeeded::dispatch($request, 2, 'Kasubag Umum');

        Event::assertDispatched(ApprovalNeeded::class, function ($event) use ($request) {
            return $event->request->id === $request->id
                && $event->level === 2
                && $event->role === 'Kasubag Umum';
        });
    });

    it('contains request and approval data accessible via public properties', function () {
        $user = User::factory()->create(['name' => 'Test User']);
        $request = AtkRequest::factory()->for($user)->create([
            'no_permintaan' => 'PRQ-2026001',
            'status' => 'level1_approved',
        ]);

        $event = new ApprovalNeeded($request, 2, 'Kasubag Umum');

        expect($event->request->no_permintaan)->toBe('PRQ-2026001');
        expect($event->request->status)->toBe('level1_approved');
        expect($event->level)->toBe(2);
        expect($event->role)->toBe('Kasubag Umum');
    });

    it('has access to request details relationship', function () {
        $request = AtkRequest::factory()
            ->hasRequestDetails(3)
            ->create();

        $event = new ApprovalNeeded($request, 2, 'Kasubag Umum');

        expect($event->request->requestDetails)->toHaveCount(3);
    });

    it('supports different approval levels', function () {
        $request = AtkRequest::factory()->create();

        $eventLevel2 = new ApprovalNeeded($request, 2, 'Kasubag Umum');
        $eventLevel3 = new ApprovalNeeded($request, 3, 'KPA');

        expect($eventLevel2->level)->toBe(2);
        expect($eventLevel2->role)->toBe('Kasubag Umum');
        expect($eventLevel3->level)->toBe(3);
        expect($eventLevel3->role)->toBe('KPA');
    });
});
