<?php

use App\Models\OfficeSupply;
use App\Models\OfficeUsage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

describe('Office Usage Recording', function () {
    beforeEach(function () {
        // Clear permission cache
        $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();

        // Create required permissions
        Permission::firstOrCreate(['name' => 'office.usage.log', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'office.view', 'guard_name' => 'web']);

        // Clear permission cache again after creating permissions
        $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->user = User::factory()->create(['email_verified_at' => now()]);
        $this->user->givePermissionTo(['office.usage.log', 'office.view']);
        $this->user->load('permissions');
        $this->actingAs($this->user);
        $this->supply = OfficeSupply::factory()->create(['stok' => 50]);
    });

    describe('POST /office-usages (Manual Input)', function () {
        it('creates a new usage record and updates stock', function () {
            $data = [
                'supply_id' => $this->supply->id,
                'jumlah' => 5,
                'tanggal' => '2026-01-11',
                'keperluan' => 'Untuk rapat',
            ];

            $response = $this->post(route('office-usages.store'), $data);

            $response->assertRedirect(route('office-usages.index'));

            $this->assertDatabaseHas('office_usages', [
                'supply_id' => $this->supply->id,
                'jumlah' => 5,
                'keperluan' => 'Untuk rapat',
            ]);

            $this->assertDatabaseHas('office_supplies', [
                'id' => $this->supply->id,
                'stok' => 45, // 50 - 5
            ]);

            $this->assertDatabaseHas('office_mutations', [
                'supply_id' => $this->supply->id,
                'jenis_mutasi' => 'keluar',
                'jumlah' => 5,
                'tipe' => 'manual',
            ]);
        });

        it('requires supply_id', function () {
            $data = OfficeUsage::factory()->raw(['supply_id' => '']);

            $response = $this->post(route('office-usages.store'), $data);

            $response->assertSessionHasErrors('supply_id');
        });

        it('requires jumlah', function () {
            $data = OfficeUsage::factory()->raw(['jumlah' => '']);

            $response = $this->post(route('office-usages.store'), $data);

            $response->assertSessionHasErrors('jumlah');
        });

        it('requires tanggal', function () {
            $data = OfficeUsage::factory()->raw(['tanggal' => '']);

            $response = $this->post(route('office-usages.store'), $data);

            $response->assertSessionHasErrors('tanggal');
        });

        it('validates jumlah does not exceed available stock', function () {
            $data = [
                'supply_id' => $this->supply->id,
                'jumlah' => 100, // More than available stock
                'tanggal' => '2026-01-11',
                'keperluan' => 'Test',
            ];

            $response = $this->post(route('office-usages.store'), $data);

            $response->assertSessionHasErrors('jumlah');
        });

        it('validates jumlah is positive', function () {
            $data = [
                'supply_id' => $this->supply->id,
                'jumlah' => -5,
                'tanggal' => '2026-01-11',
                'keperluan' => 'Test',
            ];

            $response = $this->post(route('office-usages.store'), $data);

            $response->assertSessionHasErrors('jumlah');
        });
    });

    describe('GET /office-usages', function () {
        it('displays usage records', function () {
            OfficeUsage::factory()->for($this->supply, 'supply')->count(3)->create();

            $response = $this->get(route('office-usages.index'));

            $response->assertStatus(200);
        });

        it('filters by date range', function () {
            OfficeUsage::factory()->for($this->supply, 'supply')->create(['tanggal' => '2026-01-10']);
            OfficeUsage::factory()->for($this->supply, 'supply')->create(['tanggal' => '2026-01-15']);

            $response = $this->get(route('office-usages.index', [
                'date_from' => '2026-01-12',
                'date_to' => '2026-01-16',
            ]));

            $response->assertStatus(200);
        });
    });
});

describe('POST /office-mutations/quick-deduct (Quick Deduct)', function () {
    beforeEach(function () {
        // Clear permission cache
        $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();

        // Create required permissions
        Permission::firstOrCreate(['name' => 'office.usage.log', 'guard_name' => 'web']);

        // Clear permission cache again after creating permissions
        $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->user = User::factory()->create(['email_verified_at' => now()]);
        $this->user->givePermissionTo('office.usage.log');
        $this->user->load('permissions');
        $this->actingAs($this->user);
        $this->supply = OfficeSupply::factory()->create(['stok' => 50]);
    });

    it('quickly deducts stock without full usage record', function () {
        $data = [
            'supply_id' => $this->supply->id,
            'jumlah' => 10,
            'keterangan' => 'Stok rusak',
        ];

        $response = $this->post(route('office-mutations.quick-deduct'), $data);

        $response->assertRedirect(route('office-supplies.index'));

        $this->assertDatabaseHas('office_supplies', [
            'id' => $this->supply->id,
            'stok' => 40, // 50 - 10
        ]);

        $this->assertDatabaseHas('office_mutations', [
            'supply_id' => $this->supply->id,
            'jenis_mutasi' => 'keluar',
            'jumlah' => 10,
            'tipe' => 'quick_deduct',
            'keterangan' => 'Stok rusak',
        ]);

        // Should NOT create office_usage record
        $this->assertDatabaseMissing('office_usages', [
            'supply_id' => $this->supply->id,
            'jumlah' => 10,
        ]);
    });

    it('requires supply_id', function () {
        $data = [
            'supply_id' => '',
            'jumlah' => 10,
            'keterangan' => 'Test',
        ];

        $response = $this->post(route('office-mutations.quick-deduct'), $data);

        $response->assertSessionHasErrors('supply_id');
    });

    it('requires jumlah', function () {
        $data = [
            'supply_id' => $this->supply->id,
            'jumlah' => '',
            'keterangan' => 'Test',
        ];

        $response = $this->post(route('office-mutations.quick-deduct'), $data);

        $response->assertSessionHasErrors('jumlah');
    });

    it('validates jumlah does not exceed available stock', function () {
        $data = [
            'supply_id' => $this->supply->id,
            'jumlah' => 100, // More than available
            'keterangan' => 'Test',
        ];

        $response = $this->post(route('office-mutations.quick-deduct'), $data);

        $response->assertSessionHasErrors('jumlah');
    });
});
