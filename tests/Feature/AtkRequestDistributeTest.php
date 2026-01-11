<?php

use App\Models\AtkRequest;
use App\Models\RequestDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    Event::fake();
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(\Database\Seeders\PermissionsSeeder::class);
    $this->seed(\Database\Seeders\RolesSeeder::class);
});

it('shows distribute button when user can distribute and status is level3_approved', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('atk.requests.distribute');
    $user->assignRole('kpa'); // Need role for authorization

    $atkRequest = AtkRequest::factory()
        ->for($user, 'user')
        ->level3Approved()
        ->has(RequestDetail::factory()->count(2), 'requestDetails')
        ->create();

    $this->actingAs($user)
        ->get(route('atk-requests.show', $atkRequest))
        ->assertInertia(fn ($page) => $page
            ->component('atk-requests/show')
            ->has('atkRequest')
            ->has('atkRequest.request_details', 2)
            ->where('can.distribute', true)
        );
});

it('does not show distribute button when status is not level3_approved', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('atk.requests.distribute');
    $user->assignRole('kpa');

    $atkRequest = AtkRequest::factory()
        ->for($user, 'user')
        ->pending()
        ->has(RequestDetail::factory()->count(2), 'requestDetails')
        ->create();

    $this->actingAs($user)
        ->get(route('atk-requests.show', $atkRequest))
        ->assertInertia(fn ($page) => $page
            ->component('atk-requests/show')
            ->where('can.distribute', false)
        );
});

it('does not show distribute button when user does not have permission', function () {
    $user = User::factory()->create();

    $atkRequest = AtkRequest::factory()
        ->for($user, 'user')
        ->level3Approved()
        ->has(RequestDetail::factory()->count(2), 'requestDetails')
        ->create();

    $this->actingAs($user)
        ->get(route('atk-requests.show', $atkRequest))
        ->assertInertia(fn ($page) => $page
            ->component('atk-requests/show')
            ->where('can.distribute', false)
        );
});

it('can distribute items with valid data', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('atk.requests.distribute');
    $user->assignRole('kpa');

    $atkRequest = AtkRequest::factory()
        ->for($user, 'user')
        ->level3Approved()
        ->has(
            RequestDetail::factory()
                ->state(function () {
                    return ['jumlah_disetujui' => 10];
                })
                ->count(2),
            'requestDetails'
        )
        ->create();

    $details = $atkRequest->requestDetails;

    $this->actingAs($user)
        ->post(route('atk-requests.distribute', $atkRequest), [
            'items' => [
                [
                    'detail_id' => $details[0]->id,
                    'jumlah_diberikan' => 5,
                ],
                [
                    'detail_id' => $details[1]->id,
                    'jumlah_diberikan' => 8,
                ],
            ],
        ])
        ->assertRedirect();

    expect($atkRequest->fresh()->status)->toBe('diserahkan');
    expect($atkRequest->fresh()->distributed_by)->toBe($user->id);
    expect($details[0]->fresh()->jumlah_diberikan)->toBe(5);
    expect($details[1]->fresh()->jumlah_diberikan)->toBe(8);
});

it('validates jumlah_diberikan does not exceed jumlah_disetujui', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('atk.requests.distribute');
    $user->assignRole('kpa');

    $atkRequest = AtkRequest::factory()
        ->for($user, 'user')
        ->level3Approved()
        ->has(
            RequestDetail::factory()
                ->state(function () {
                    return ['jumlah_disetujui' => 10];
                })
                ->count(1),
            'requestDetails'
        )
        ->create();

    $detail = $atkRequest->requestDetails->first();

    $this->actingAs($user)
        ->post(route('atk-requests.distribute', $atkRequest), [
            'items' => [
                [
                    'detail_id' => $detail->id,
                    'jumlah_diberikan' => 15, // Exceeds jumlah_disetujui
                ],
            ],
        ])
        ->assertSessionHasErrors();
});
