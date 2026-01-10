<?php

use App\Events\RequestCreated;
use App\Models\AtkRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

describe('RequestCreated Event', function () {
    it('can be instantiated with an AtkRequest', function () {
        $request = AtkRequest::factory()->create();
        $event = new RequestCreated($request);

        expect($event->request->id)->toBe($request->id);
    });

    it('is dispatchable', function () {
        $request = AtkRequest::factory()->create();

        Event::fake();

        RequestCreated::dispatch($request);

        Event::assertDispatched(RequestCreated::class, function ($event) use ($request) {
            return $event->request->id === $request->id;
        });
    });

    it('contains request data accessible via public property', function () {
        $user = User::factory()->create(['name' => 'Test User']);
        $request = AtkRequest::factory()->for($user)->create([
            'no_permintaan' => 'PRQ-2026001',
            'status' => 'pending',
        ]);

        $event = new RequestCreated($request);

        expect($event->request->no_permintaan)->toBe('PRQ-2026001');
        expect($event->request->status)->toBe('pending');
        expect($event->request->user->name)->toBe('Test User');
    });

    it('has access to request details relationship', function () {
        $request = AtkRequest::factory()
            ->hasRequestDetails(3)
            ->create();

        $event = new RequestCreated($request);

        expect($event->request->requestDetails)->toHaveCount(3);
    });
});
