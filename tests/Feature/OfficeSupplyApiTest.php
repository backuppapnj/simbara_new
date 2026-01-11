<?php

use App\Models\OfficeSupply;
use App\Models\User;

test('can get single office supply as json', function () {
    // Create authenticated user
    $user = User::factory()->create();

    // Create test supply
    $supply = OfficeSupply::factory()->create([
        'nama_barang' => 'Test Paper A4',
        'kategori' => 'kertas',
        'stok' => 100,
        'satuan' => 'rim',
    ]);

    // Make authenticated request
    $response = $this->actingAs($user)->getJson("/office-supplies/{$supply->id}");

    // Assert response
    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'id',
                'nama_barang',
                'kategori',
                'stok',
                'satuan',
            ],
        ])
        ->assertJsonPath('data.id', $supply->id)
        ->assertJsonPath('data.nama_barang', 'Test Paper A4')
        ->assertJsonPath('data.stok', 100);
});

test('office supply show returns 404 for non-existent supply', function () {
    $user = User::factory()->create();
    $fakeId = '12345678901234567890123456';

    $response = $this->actingAs($user)->getJson("/office-supplies/{$fakeId}");

    $response->assertStatus(404);
});
