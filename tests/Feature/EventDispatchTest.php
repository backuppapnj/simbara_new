<?php

use App\Events\ApprovalNeeded;
use App\Events\OfficeRequestCreated;
use App\Events\OfficeSupplyReorderPointAlert;
use App\Events\ReorderPointAlert;
use App\Events\RequestCreated;
use App\Models\AtkRequest;
use App\Models\Department;
use App\Models\Item;
use App\Models\OfficeSupply;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'phone' => '628123456789',
    ]);
    $this->department = Department::factory()->create();
});

test('request created event is dispatched when atk request is created', function () {
    Event::fake();

    $item = Item::factory()->create();

    $this->actingAs($this->user)
        ->postJson('/atk-requests', [
            'department_id' => $this->department->id,
            'tanggal' => now()->format('Y-m-d'),
            'keterangan' => 'Test request',
            'items' => [
                [
                    'item_id' => $item->id,
                    'jumlah_diminta' => 5,
                ],
            ],
        ])
        ->assertCreated();

    Event::assertDispatched(RequestCreated::class);
});

test('approval needed event is dispatched when level 1 approval is done', function () {
    Event::fake();

    $item = Item::factory()->create();
    $atkRequest = AtkRequest::factory()->create([
        'user_id' => $this->user->id,
        'department_id' => $this->department->id,
        'status' => 'pending',
    ]);

    $this->actingAs($this->user)
        ->postJson("/atk-requests/{$atkRequest->id}/approve-level1")
        ->assertSuccessful();

    Event::assertDispatched(ApprovalNeeded::class, function ($event) use ($atkRequest) {
        return $event->request->id === $atkRequest->id
            && $event->level === 2
            && $event->role === 'Kasubag Umum';
    });
});

test('approval needed event is dispatched when level 2 approval is done', function () {
    Event::fake();

    $item = Item::factory()->create();
    $atkRequest = AtkRequest::factory()->create([
        'user_id' => $this->user->id,
        'department_id' => $this->department->id,
        'status' => 'level1_approved',
    ]);

    $this->actingAs($this->user)
        ->postJson("/atk-requests/{$atkRequest->id}/approve-level2")
        ->assertSuccessful();

    Event::assertDispatched(ApprovalNeeded::class, function ($event) use ($atkRequest) {
        return $event->request->id === $atkRequest->id
            && $event->level === 3
            && $event->role === 'KPA';
    });
});

test('reorder point alert event is dispatched when item stock drops below minimum', function () {
    // Don't use Event::fake() initially as it prevents observers from running
    $item = Item::factory()->create([
        'stok' => 100,
        'stok_minimal' => 50,
    ]);

    Event::fake([ReorderPointAlert::class]);

    // Update stock to below minimum
    $item->update(['stok' => 45]);

    Event::assertDispatched(ReorderPointAlert::class, function ($event) use ($item) {
        return $event->item->id === $item->id
            && $event->item->stok === 45;
    });
});

test('reorder point alert event is not dispatched when item stock is above minimum', function () {
    Event::fake([ReorderPointAlert::class]);

    $item = Item::factory()->create([
        'stok' => 100,
        'stok_minimal' => 50,
    ]);

    // Update stock but still above minimum
    $item->update(['stok' => 60]);

    Event::assertNotDispatched(ReorderPointAlert::class);
});

test('reorder point alert event is not dispatched when stock field is not changed', function () {
    Event::fake([ReorderPointAlert::class]);

    $item = Item::factory()->create([
        'stok' => 45,
        'stok_minimal' => 50,
    ]);

    // Update another field, not stock
    $item->update(['nama_barang' => 'Updated Name']);

    Event::assertNotDispatched(ReorderPointAlert::class);
});

test('office request created event is dispatched when office request is created', function () {
    Event::fake();

    $supply = OfficeSupply::factory()->raw();
    $supply['id'] = (string) Str::ulid();

    $createdSupply = OfficeSupply::create($supply);

    $this->actingAs($this->user)
        ->postJson(route('office-requests.store'), [
            'department_id' => $this->department->id,
            'tanggal' => now()->format('Y-m-d'),
            'keterangan' => 'Test office request',
            'items' => [
                [
                    'supply_id' => $createdSupply->id,
                    'jumlah' => 3,
                ],
            ],
        ])
        ->assertCreated();

    Event::assertDispatched(OfficeRequestCreated::class);
});

test('office supply reorder point alert event is dispatched when stock drops below minimum', function () {
    // Don't use Event::fake() initially
    $supplyData = OfficeSupply::factory()->raw();
    $supplyData['id'] = (string) Str::ulid();
    $supply = OfficeSupply::create($supplyData);
    $supply->stok = 100;
    $supply->stok_minimal = 50;
    $supply->save();

    Event::fake([OfficeSupplyReorderPointAlert::class]);

    // Update stock to below minimum
    $supply->update(['stok' => 45]);

    Event::assertDispatched(OfficeSupplyReorderPointAlert::class, function ($event) use ($supply) {
        return $event->supply->id === $supply->id
            && $event->supply->stok === 45;
    });
});

test('office supply reorder point alert event is not dispatched when stock is above minimum', function () {
    // Don't use Event::fake() initially
    $supplyData = OfficeSupply::factory()->raw();
    $supplyData['id'] = (string) Str::ulid();
    $supply = OfficeSupply::create($supplyData);
    $supply->stok = 100;
    $supply->stok_minimal = 50;
    $supply->save();

    Event::fake([OfficeSupplyReorderPointAlert::class]);

    // Update stock but still above minimum
    $supply->update(['stok' => 60]);

    Event::assertNotDispatched(OfficeSupplyReorderPointAlert::class);
});
