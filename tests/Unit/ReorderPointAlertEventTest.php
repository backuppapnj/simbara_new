<?php

use App\Events\ReorderPointAlert;
use App\Models\Item;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

describe('ReorderPointAlert Event', function () {
    it('can be instantiated with an Item', function () {
        $item = Item::factory()->create();
        $event = new ReorderPointAlert($item);

        expect($event->item->id)->toBe($item->id);
    });

    it('is dispatchable', function () {
        $item = Item::factory()->create();

        Event::fake();

        ReorderPointAlert::dispatch($item);

        Event::assertDispatched(ReorderPointAlert::class, function ($event) use ($item) {
            return $event->item->id === $item->id;
        });
    });

    it('contains item data accessible via public property', function () {
        $item = Item::factory()->create([
            'nama_barang' => 'Kertas A4',
            'stok' => 15,
            'stok_minimal' => 20,
            'satuan' => 'rim',
        ]);

        $event = new ReorderPointAlert($item);

        expect($event->item->nama_barang)->toBe('Kertas A4');
        expect($event->item->stok)->toBe(15);
        expect($event->item->stok_minimal)->toBe(20);
        expect($event->item->satuan)->toBe('rim');
    });

    it('calculates stock deficit correctly', function () {
        $item = Item::factory()->create([
            'stok' => 15,
            'stok_minimal' => 20,
        ]);

        $event = new ReorderPointAlert($item);

        $deficit = $event->item->stok_minimal - $event->item->stok;
        expect($deficit)->toBe(5);
    });

    it('supports items with different categories', function () {
        $atkItem = Item::factory()->create(['kategori' => 'atk']);
        $officeItem = Item::factory()->create(['kategori' => 'office_supply']);

        $atkEvent = new ReorderPointAlert($atkItem);
        $officeEvent = new ReorderPointAlert($officeItem);

        expect($atkEvent->item->kategori)->toBe('atk');
        expect($officeEvent->item->kategori)->toBe('office_supply');
    });

    it('includes item information', function () {
        $item = Item::factory()->create([
            'kode_barang' => 'ATK-001',
            'nama_barang' => 'Kertas A4',
        ]);

        $event = new ReorderPointAlert($item);

        expect($event->item->kode_barang)->toBe('ATK-001');
        expect($event->item->nama_barang)->toBe('Kertas A4');
    });
});
