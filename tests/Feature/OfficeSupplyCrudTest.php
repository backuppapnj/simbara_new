<?php

use App\Models\OfficeSupply;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('OfficeSupply CRUD', function () {
    beforeEach(function () {
        $this->user = User::factory()->create(['email_verified_at' => now()]);
        $this->actingAs($this->user);
    });

    describe('GET /office-supplies', function () {
        it('returns successful response', function () {
            OfficeSupply::factory()->count(3)->create();

            $response = $this->get(route('office-supplies.index'));

            $response->assertStatus(200);
        });

        it('passes search filter to view', function () {
            OfficeSupply::factory()->create(['nama_barang' => 'Gula Pasir']);
            OfficeSupply::factory()->create(['nama_barang' => 'Teh Hitam']);

            $response = $this->get(route('office-supplies.index', ['search' => 'Gula']));

            $response->assertStatus(200);
        });

        it('passes category filter to view', function () {
            OfficeSupply::factory()->create(['kategori' => 'Consumables']);
            OfficeSupply::factory()->create(['kategori' => 'Cleaning Supplies']);

            $response = $this->get(route('office-supplies.index', ['kategori' => 'Consumables']));

            $response->assertStatus(200);
        });
    });

    describe('POST /office-supplies', function () {
        it('creates a new office supply', function () {
            $data = [
                'nama_barang' => 'Gula Pasir 1kg',
                'satuan' => 'pack',
                'kategori' => 'Consumables',
                'deskripsi' => 'Gula pasir untuk kantor',
                'stok' => 10,
                'stok_minimal' => 5,
            ];

            $response = $this->post(route('office-supplies.store'), $data);

            $response->assertRedirect(route('office-supplies.index'));
            $this->assertDatabaseHas('office_supplies', [
                'nama_barang' => 'Gula Pasir 1kg',
                'satuan' => 'pack',
                'kategori' => 'Consumables',
            ]);
        });

        it('requires nama_barang', function () {
            $data = OfficeSupply::factory()->raw(['nama_barang' => '']);

            $response = $this->post(route('office-supplies.store'), $data);

            $response->assertSessionHasErrors('nama_barang');
        });

        it('requires satuan', function () {
            $data = OfficeSupply::factory()->raw(['satuan' => '']);

            $response = $this->post(route('office-supplies.store'), $data);

            $response->assertSessionHasErrors('satuan');
        });

        it('requires kategori', function () {
            $data = OfficeSupply::factory()->raw(['kategori' => '']);

            $response = $this->post(route('office-supplies.store'), $data);

            $response->assertSessionHasErrors('kategori');
        });

        it('validates kategori is in allowed values', function () {
            $data = OfficeSupply::factory()->raw(['kategori' => 'Invalid Category']);

            $response = $this->post(route('office-supplies.store'), $data);

            $response->assertSessionHasErrors('kategori');
        });

        it('validates stok is integer', function () {
            $data = OfficeSupply::factory()->raw(['stok' => 'abc']);

            $response = $this->post(route('office-supplies.store'), $data);

            $response->assertSessionHasErrors('stok');
        });

        it('validates stok_minimal is integer', function () {
            $data = OfficeSupply::factory()->raw(['stok_minimal' => 'xyz']);

            $response = $this->post(route('office-supplies.store'), $data);

            $response->assertSessionHasErrors('stok_minimal');
        });
    });

    describe('PUT /office-supplies/{id}', function () {
        it('updates an existing office supply', function () {
            $supply = OfficeSupply::factory()->create([
                'nama_barang' => 'Gula Pasir 1kg',
            ]);

            $data = [
                'nama_barang' => 'Gula Pasir 2kg',
                'satuan' => 'pack',
                'kategori' => 'Consumables',
                'deskripsi' => 'Gula pasir 2kg untuk kantor',
                'stok' => 15,
                'stok_minimal' => 5,
            ];

            $response = $this->put(route('office-supplies.update', $supply), $data);

            $response->assertRedirect(route('office-supplies.index'));
            $this->assertDatabaseHas('office_supplies', [
                'id' => $supply->id,
                'nama_barang' => 'Gula Pasir 2kg',
            ]);
        });

        it('requires nama_barang on update', function () {
            $supply = OfficeSupply::factory()->create();

            $data = OfficeSupply::factory()->raw(['nama_barang' => '']);

            $response = $this->put(route('office-supplies.update', $supply), $data);

            $response->assertSessionHasErrors('nama_barang');
        });
    });

    describe('DELETE /office-supplies/{id}', function () {
        it('soft deletes an office supply', function () {
            $supply = OfficeSupply::factory()->create();

            $response = $this->delete(route('office-supplies.destroy', $supply));

            $response->assertRedirect(route('office-supplies.index'));
            $this->assertSoftDeleted('office_supplies', [
                'id' => $supply->id,
            ]);
        });
    });
});

describe('GET /office-supplies/{id}/mutations', function () {
    beforeEach(function () {
        $this->user = User::factory()->create(['email_verified_at' => now()]);
        $this->actingAs($this->user);
    });

    it('returns successful response', function () {
        $supply = OfficeSupply::factory()->create();

        $response = $this->get(route('office-supplies.mutations', $supply));

        $response->assertStatus(200);
    });

    it('passes filter by jenis_mutasi to view', function () {
        $supply = OfficeSupply::factory()->create();

        $response = $this->get(route('office-supplies.mutations', $supply, ['jenis' => 'masuk']));

        $response->assertStatus(200);
    });
});
