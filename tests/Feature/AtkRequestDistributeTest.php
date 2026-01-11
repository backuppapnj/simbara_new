<?php

use App\Models\AtkRequest;
use App\Models\RequestDetail;
use App\Models\User;
use Illuminate\Support\Facades\Event;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    Event::fake();
});

it('shows distribute button when user can distribute and status is level3_approved', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('manage_atk_requests');

    $atkRequest = AtkRequest::factory()
        ->for($user, 'user')
        ->level3Approved()
        ->has(RequestDetail::factory()->count(2), 'requestDetails')
        ->create();

    actingAs($user)
        ->get(route('atk-requests.show', $atkRequest))
        ->assertSee('Distribute')
        ->assertSee('Serahkan Barang');
});

it('does not show distribute button when status is not level3_approved', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('manage_atk_requests');

    $atkRequest = AtkRequest::factory()
        ->for($user, 'user')
        ->pending()
        ->has(RequestDetail::factory()->count(2), 'requestDetails')
        ->create();

    actingAs($user)
        ->get(route('atk-requests.show', $atkRequest))
        ->assertDontSee('Distribute')
        ->assertDontSee('Serahkan Barang');
});

it('does not show distribute button when user does not have permission', function () {
    $user = User::factory()->create();

    $atkRequest = AtkRequest::factory()
        ->for($user, 'user')
        ->level3Approved()
        ->has(RequestDetail::factory()->count(2), 'requestDetails')
        ->create();

    actingAs($user)
        ->get(route('atk-requests.show', $atkRequest))
        ->assertDontSee('Distribute')
        ->assertDontSee('Serahkan Barang');
});

it('can distribute items with valid data', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('manage_atk_requests');

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

    actingAs($user)
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
    $user->givePermissionTo('manage_atk_requests');

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

    actingAs($user)
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
