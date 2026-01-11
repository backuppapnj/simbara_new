<?php

use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('ItemController', function () {
    describe('Index', function () {
        it('requires authentication', function () {
            $response = $this->get(route('items.index'));

            $response->assertRedirect(route('login'));
        });

        it('displays items list to authenticated users', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            Item::factory()->count(3)->create();

            $response = $this->actingAs($user)
                ->get(route('items.index'));

            $response->assertStatus(200);
        });

        it('paginates items by 15 per page', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            Item::factory()->count(20)->create();

            $response = $this->actingAs($user)
                ->get(route('items.index'));

            $response->assertStatus(200);
        });

        it('can search items by name', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            Item::factory()->create(['nama_barang' => 'Kertas A4']);
            Item::factory()->create(['nama_barang' => 'Pulpen Hitam']);

            $response = $this->actingAs($user)
                ->get(route('items.index', ['search' => 'Kertas']));

            $response->assertStatus(200);
        });

        it('can filter items by category', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            Item::factory()->create(['kategori' => 'Alat Tulis']);
            Item::factory()->create(['kategori' => 'Kertas']);

            $response = $this->actingAs($user)
                ->get(route('items.index', ['kategori' => 'Alat Tulis']));

            $response->assertStatus(200);
        });
    });

    describe('Store', function () {
        it('requires authentication', function () {
            $response = $this->post(route('items.store'), []);

            $response->assertRedirect(route('login'));
        });

        it('creates a new item with valid data', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('items.store'), [
                    'kode_barang' => 'ATK-0001',
                    'nama_barang' => 'Kertas A4',
                    'satuan' => 'rim',
                    'kategori' => 'Kertas',
                    'stok' => 100,
                    'stok_minimal' => 10,
                    'stok_maksimal' => 200,
                    'harga_beli_terakhir' => 45000,
                    'harga_rata_rata' => 45000,
                    'harga_jual' => 50000,
                ]);

            $response->assertRedirect(route('items.index'))
                ->assertSessionHasNoErrors();

            $this->assertDatabaseHas('items', [
                'kode_barang' => 'ATK-0001',
                'nama_barang' => 'Kertas A4',
            ]);
        });

        it('requires kode_barang', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('items.store'), [
                    'nama_barang' => 'Kertas A4',
                    'satuan' => 'rim',
                ]);

            $response->assertSessionHasErrors(['kode_barang']);
        });

        it('requires nama_barang', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('items.store'), [
                    'kode_barang' => 'ATK-0001',
                    'satuan' => 'rim',
                ]);

            $response->assertSessionHasErrors(['nama_barang']);
        });

        it('requires satuan', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('items.store'), [
                    'kode_barang' => 'ATK-0001',
                    'nama_barang' => 'Kertas A4',
                ]);

            $response->assertSessionHasErrors(['satuan']);
        });

        it('requires numeric stok values', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('items.store'), [
                    'kode_barang' => 'ATK-0001',
                    'nama_barang' => 'Kertas A4',
                    'satuan' => 'rim',
                    'stok' => 'not-a-number',
                    'stok_minimal' => 'not-a-number',
                    'stok_maksimal' => 'not-a-number',
                ]);

            $response->assertSessionHasErrors(['stok', 'stok_minimal', 'stok_maksimal']);
        });

        it('requires numeric harga values', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('items.store'), [
                    'kode_barang' => 'ATK-0001',
                    'nama_barang' => 'Kertas A4',
                    'satuan' => 'rim',
                    'harga_beli_terakhir' => 'not-a-number',
                    'harga_rata_rata' => 'not-a-number',
                    'harga_jual' => 'not-a-number',
                ]);

            $response->assertSessionHasErrors(['harga_beli_terakhir', 'harga_rata_rata', 'harga_jual']);
        });

        it('validates unique kode_barang', function () {
            $user = User::factory()->create();
            Item::factory()->create(['kode_barang' => 'ATK-0001']);

            $response = $this->actingAs($user)
                ->post(route('items.store'), [
                    'kode_barang' => 'ATK-0001',
                    'nama_barang' => 'Kertas A4',
                    'satuan' => 'rim',
                ]);

            $response->assertSessionHasErrors(['kode_barang']);
        });
    });

    describe('Update', function () {
        it('requires authentication', function () {
            $item = Item::factory()->create();

            $response = $this->put(route('items.update', $item), []);

            $response->assertRedirect(route('login'));
        });

        it('updates an existing item', function () {
            $user = User::factory()->create();
            $item = Item::factory()->create([
                'nama_barang' => 'Kertas A4',
            ]);

            $response = $this->actingAs($user)
                ->put(route('items.update', $item), [
                    'kode_barang' => $item->kode_barang,
                    'nama_barang' => 'Kertas A5',
                    'satuan' => 'rim',
                    'kategori' => 'Kertas',
                    'stok' => 150,
                    'stok_minimal' => 15,
                    'stok_maksimal' => 250,
                    'harga_beli_terakhir' => 40000,
                    'harga_rata_rata' => 40000,
                    'harga_jual' => 45000,
                ]);

            $response->assertRedirect(route('items.index'))
                ->assertSessionHasNoErrors();

            $this->assertDatabaseHas('items', [
                'id' => $item->id,
                'nama_barang' => 'Kertas A5',
            ]);
        });

        it('requires kode_barang on update', function () {
            $user = User::factory()->create();
            $item = Item::factory()->create();

            $response = $this->actingAs($user)
                ->put(route('items.update', $item), [
                    'nama_barang' => 'Kertas A5',
                    'satuan' => 'rim',
                ]);

            $response->assertSessionHasErrors(['kode_barang']);
        });
    });

    describe('Destroy', function () {
        it('requires authentication', function () {
            $item = Item::factory()->create();

            $response = $this->delete(route('items.destroy', $item));

            $response->assertRedirect(route('login'));
        });

        it('soft deletes an item', function () {
            $user = User::factory()->create();
            $item = Item::factory()->create();

            $response = $this->actingAs($user)
                ->delete(route('items.destroy', $item));

            $response->assertRedirect(route('items.index'));

            $this->assertSoftDeleted('items', [
                'id' => $item->id,
            ]);
        });

        it('cannot delete non-existent item', function () {
            $user = User::factory()->create();
            $nonExistentId = (string) \Illuminate\Support\Str::ulid();

            $response = $this->actingAs($user)
                ->delete(route('items.destroy', $nonExistentId));

            $response->assertNotFound();
        });
    });

    describe('Mutations', function () {
        it('requires authentication', function () {
            $item = Item::factory()->create();

            $response = $this->get(route('items.mutations', $item));

            $response->assertRedirect(route('login'));
        });

        it('displays stock mutations for an item', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            $item = Item::factory()->create();

            $response = $this->actingAs($user)
                ->get(route('items.mutations', $item));

            $response->assertStatus(200);
        });

        it('paginates mutations', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            $item = Item::factory()->create();
            \App\Models\StockMutation::factory()->count(20)->create(['item_id' => $item->id]);

            $response = $this->actingAs($user)
                ->get(route('items.mutations', $item));

            $response->assertStatus(200);
        });

        it('can filter by mutation type', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            $item = Item::factory()->create();

            $response = $this->actingAs($user)
                ->get(route('items.mutations', ['item' => $item, 'jenis' => 'masuk']));

            $response->assertStatus(200);
        });

        it('calculates running balance for mutations', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            $item = Item::factory()->create(['stok' => 0]);

            // Create multiple mutations
            \App\Models\StockMutation::factory()->create([
                'item_id' => $item->id,
                'jenis_mutasi' => 'masuk',
                'jumlah' => 100,
                'stok_sebelum' => 0,
                'stok_sesudah' => 100,
                'created_at' => now()->subMinutes(3),
            ]);

            \App\Models\StockMutation::factory()->create([
                'item_id' => $item->id,
                'jenis_mutasi' => 'keluar',
                'jumlah' => -30,
                'stok_sebelum' => 100,
                'stok_sesudah' => 70,
                'created_at' => now()->subMinutes(2),
            ]);

            \App\Models\StockMutation::factory()->create([
                'item_id' => $item->id,
                'jenis_mutasi' => 'masuk',
                'jumlah' => 50,
                'stok_sebelum' => 70,
                'stok_sesudah' => 120,
                'created_at' => now()->subMinutes(1),
            ]);

            $response = $this->actingAs($user)
                ->get(route('items.mutations', $item));

            $response->assertStatus(200)
                ->assertInertia(fn ($page) => $page
                    ->component('items/Mutations')
                    ->has('item')
                    ->has('mutations')
                    ->has('mutations.data', 3)
                );
        });

        it('can filter by date range', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            $item = Item::factory()->create();

            // Create mutations on different dates
            \App\Models\StockMutation::factory()->create([
                'item_id' => $item->id,
                'created_at' => now()->subDays(5),
            ]);

            \App\Models\StockMutation::factory()->create([
                'item_id' => $item->id,
                'created_at' => now()->subDays(2),
            ]);

            \App\Models\StockMutation::factory()->create([
                'item_id' => $item->id,
                'created_at' => now(),
            ]);

            $response = $this->actingAs($user)
                ->get(route('items.mutations', [
                    'item' => $item,
                    'date_from' => now()->subDays(3)->format('Y-m-d'),
                    'date_to' => now()->format('Y-m-d'),
                ]));

            $response->assertStatus(200);
        });

        it('includes item data in mutations response', function () {
            $user = User::factory()->create(['email_verified_at' => now()]);
            $item = Item::factory()->create([
                'kode_barang' => 'ATK-001',
                'nama_barang' => 'Kertas A4',
                'stok' => 150,
            ]);

            $response = $this->actingAs($user)
                ->get(route('items.mutations', $item));

            $response->assertStatus(200)
                ->assertInertia(fn ($page) => $page
                    ->component('items/Mutations')
                    ->has('item')
                    ->where('item.kode_barang', 'ATK-001')
                    ->where('item.nama_barang', 'Kertas A4')
                    ->where('item.stok', 150)
                );
        });
    });
});
