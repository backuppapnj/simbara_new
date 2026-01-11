<?php

use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Page;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    // Seed roles and permissions
    $this->seed(\Database\Seeders\RolesSeeder::class);
    $this->seed(\Database\Seeders\PermissionsSeeder::class);

    $this->user = User::factory()->create();
    $this->user->givePermissionTo('atk.view', 'atk.items.create', 'atk.items.edit', 'atk.items.delete');
});

test('create button exists on items index page', function () {
    actingAs($this->user)
        ->get(route('items.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Page $page) => (
            $page->component('items/Index')
                ->has('items')
                ->where('auth.user.permissions', fn ($permissions) => (
                    $permissions->contains('atk.items.create')
                ))
        ));
});

test('can create new item with valid data', function () {
    $itemData = [
        'kode_barang' => 'TEST-'.time(),
        'nama_barang' => 'Test Item '.time(),
        'satuan' => 'pcs',
        'kategori' => 'Test Category',
        'stok' => 10,
        'stok_minimal' => 5,
        'stok_maksimal' => 100,
    ];

    actingAs($this->user)
        ->post(route('items.store'), $itemData)
        ->assertRedirect(route('items.index'));

    assertDatabaseHas('items', [
        'kode_barang' => $itemData['kode_barang'],
        'nama_barang' => $itemData['nama_barang'],
    ]);
});

test('create form validation requires kode_barang', function () {
    actingAs($this->user)
        ->post(route('items.store'), [
            'nama_barang' => 'Test Item',
            'satuan' => 'pcs',
        ])
        ->assertSessionHasErrors(['kode_barang']);
});

test('create form validation requires nama_barang', function () {
    actingAs($this->user)
        ->post(route('items.store'), [
            'kode_barang' => 'TEST001',
            'satuan' => 'pcs',
        ])
        ->assertSessionHasErrors(['nama_barang']);
});

test('create form validation requires satuan', function () {
    actingAs($this->user)
        ->post(route('items.store'), [
            'kode_barang' => 'TEST001',
            'nama_barang' => 'Test Item',
        ])
        ->assertSessionHasErrors(['satuan']);
});

test('create form validation validates stock is numeric', function () {
    actingAs($this->user)
        ->post(route('items.store'), [
            'kode_barang' => 'TEST001',
            'nama_barang' => 'Test Item',
            'satuan' => 'pcs',
            'stok' => 'invalid',
        ])
        ->assertSessionHasErrors(['stok']);
});

test('create form validation validates stock min value', function () {
    actingAs($this->user)
        ->post(route('items.store'), [
            'kode_barang' => 'TEST001',
            'nama_barang' => 'Test Item',
            'satuan' => 'pcs',
            'stok' => -1,
        ])
        ->assertSessionHasErrors(['stok']);
});

test('can update existing item', function () {
    $item = Item::factory()->create([
        'kode_barang' => 'OLD001',
        'nama_barang' => 'Old Item Name',
        'satuan' => 'pcs',
    ]);

    actingAs($this->user)
        ->put(route('items.update', $item), [
            'kode_barang' => 'NEW001',
            'nama_barang' => 'Updated Item Name',
            'satuan' => 'box',
        ])
        ->assertRedirect(route('items.index'));

    assertDatabaseHas('items', [
        'id' => $item->id,
        'kode_barang' => 'NEW001',
        'nama_barang' => 'Updated Item Name',
        'satuan' => 'box',
    ]);
});

test('update form validation requires kode_barang', function () {
    $item = Item::factory()->create();

    actingAs($this->user)
        ->put(route('items.update', $item), [
            'nama_barang' => 'Test Item',
            'satuan' => 'pcs',
        ])
        ->assertSessionHasErrors(['kode_barang']);
});

test('can delete item', function () {
    $item = Item::factory()->create();

    actingAs($this->user)
        ->delete(route('items.destroy', $item))
        ->assertRedirect(route('items.index'));

    expect(Item::find($item->id))->toBeNull();
});

test('items list page displays items table', function () {
    Item::factory()->count(3)->create();

    actingAs($this->user)
        ->get(route('items.index'))
        ->assertSuccessful();
});

test('can search items by name', function () {
    Item::factory()->create(['nama_barang' => 'Kertas A4']);
    Item::factory()->create(['nama_barang' => 'Pulpen Hitam']);

    actingAs($this->user)
        ->get(route('items.index', ['search' => 'Kertas']))
        ->assertSuccessful();
});

test('can filter items by category', function () {
    Item::factory()->create(['kategori' => 'Kertas']);
    Item::factory()->create(['kategori' => 'Alat Tulis']);

    actingAs($this->user)
        ->get(route('items.index', ['kategori' => 'Kertas']))
        ->assertSuccessful();
});
