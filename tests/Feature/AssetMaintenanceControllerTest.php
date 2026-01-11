<?php

use App\Models\Asset;
use App\Models\AssetMaintenance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

describe('AssetMaintenanceController', function () {
    beforeEach(function () {
        // Create required permissions
        Permission::firstOrCreate(['name' => 'assets.maintenance.create', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'assets.maintenance.view', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'assets.maintenance.edit', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'assets.maintenance.delete', 'guard_name' => 'web']);

        // Clear permission cache
        $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
    });
    describe('Store', function () {
        it('requires authentication', function () {
            $asset = Asset::factory()->create();

            $response = $this->post(route('assets.maintenance.store', $asset->id), []);

            $response->assertRedirect(route('login'));
        });

        it('creates maintenance record successfully', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.create');
            $user->load('permissions');
            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();

            $asset = Asset::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('assets.maintenance.store', $asset->id), [
                    'jenis_perawatan' => 'Preventive',
                    'tanggal' => '2026-01-15',
                    'biaya' => 500000.00,
                    'pelaksana' => 'PT Teknisi Jaya',
                    'keterangan' => 'Perawatan rutin bulanan',
                ]);

            $response->assertStatus(302)
                ->assertSessionHasNoErrors();

            $this->assertDatabaseHas('asset_maintenances', [
                'asset_id' => $asset->id,
                'jenis_perawatan' => 'Preventive',
                'biaya' => 500000.00,
                'pelaksana' => 'PT Teknisi Jaya',
                'keterangan' => 'Perawatan rutin bulanan',
            ]);
        });

        it('validates required fields', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.create');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('assets.maintenance.store', $asset->id), []);

            $response->assertStatus(302)
                ->assertSessionHasErrors(['jenis_perawatan', 'tanggal', 'pelaksana']);
        });

        it('validates jenis_perawatan is in allowed types', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.create');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('assets.maintenance.store', $asset->id), [
                    'jenis_perawatan' => 'InvalidType',
                    'tanggal' => '2026-01-15',
                    'pelaksana' => 'PT Teknisi Jaya',
                ]);

            $response->assertStatus(302)
                ->assertSessionHasErrors(['jenis_perawatan']);
        });

        it('accepts valid maintenance types', function (string $type) {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.create');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('assets.maintenance.store', $asset->id), [
                    'jenis_perawatan' => $type,
                    'tanggal' => '2026-01-15',
                    'pelaksana' => 'PT Teknisi Jaya',
                ]);

            $response->assertStatus(302)
                ->assertSessionHasNoErrors();

            $this->assertDatabaseHas('asset_maintenances', [
                'asset_id' => $asset->id,
                'jenis_perawatan' => $type,
            ]);
        })->with(['Preventive', 'Corrective', 'Rehab']);

        it('validates biaya is numeric when provided', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.create');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('assets.maintenance.store', $asset->id), [
                    'jenis_perawatan' => 'Preventive',
                    'tanggal' => '2026-01-15',
                    'pelaksana' => 'PT Teknisi Jaya',
                    'biaya' => 'invalid',
                ]);

            $response->assertStatus(302)
                ->assertSessionHasErrors(['biaya']);
        });

        it('validates biaya is non-negative', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.create');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('assets.maintenance.store', $asset->id), [
                    'jenis_perawatan' => 'Preventive',
                    'tanggal' => '2026-01-15',
                    'pelaksana' => 'PT Teknisi Jaya',
                    'biaya' => -100,
                ]);

            $response->assertStatus(302)
                ->assertSessionHasErrors(['biaya']);
        });

        it('allows biaya to be optional', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.create');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('assets.maintenance.store', $asset->id), [
                    'jenis_perawatan' => 'Preventive',
                    'tanggal' => '2026-01-15',
                    'pelaksana' => 'PT Teknisi Jaya',
                ]);

            $response->assertStatus(302)
                ->assertSessionHasNoErrors();
        });

        it('validates keterangan max length', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.create');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('assets.maintenance.store', $asset->id), [
                    'jenis_perawatan' => 'Preventive',
                    'tanggal' => '2026-01-15',
                    'pelaksana' => 'PT Teknisi Jaya',
                    'keterangan' => str_repeat('a', 1001),
                ]);

            $response->assertStatus(302)
                ->assertSessionHasErrors(['keterangan']);
        });

        it('returns success message after creation', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.create');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();

            $response = $this->actingAs($user)
                ->post(route('assets.maintenance.store', $asset->id), [
                    'jenis_perawatan' => 'Preventive',
                    'tanggal' => '2026-01-15',
                    'biaya' => 500000.00,
                    'pelaksana' => 'PT Teknisi Jaya',
                    'keterangan' => 'Perawatan rutin bulanan',
                ]);

            $response->assertStatus(302)
                ->assertSessionHas('success', 'Perawatan aset berhasil ditambahkan');
        });
    });

    describe('Index', function () {
        it('requires authentication', function () {
            $asset = Asset::factory()->create();

            $response = $this->get(route('assets.maintenances.index', $asset->id));

            $response->assertRedirect(route('login'));
        });

        it('returns maintenances for an asset', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.view');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();
            AssetMaintenance::factory()->count(3)->create(['asset_id' => $asset->id]);

            $response = $this->actingAs($user)
                ->get(route('assets.maintenances.index', $asset->id));

            $response->assertStatus(200);

            $data = $response->json();
            expect($data['data'])->toHaveCount(3);
        });

        it('paginates maintenance results', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.view');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();
            AssetMaintenance::factory()->count(25)->create(['asset_id' => $asset->id]);

            $response = $this->actingAs($user)
                ->get(route('assets.maintenances.index', $asset->id));

            $response->assertStatus(200);

            $data = $response->json();
            expect($data['data'])->toHaveCount(20); // Default pagination
        });

        it('orders by tanggal descending', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.view');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();

            $oldMaintenance = AssetMaintenance::factory()->create([
                'asset_id' => $asset->id,
                'tanggal' => '2026-01-01',
            ]);

            $newMaintenance = AssetMaintenance::factory()->create([
                'asset_id' => $asset->id,
                'tanggal' => '2026-01-15',
            ]);

            $response = $this->actingAs($user)
                ->get(route('assets.maintenances.index', $asset->id));

            $response->assertStatus(200);

            $data = $response->json();
            expect($data['data'][0]['id'])->toBe($newMaintenance->id);
            expect($data['data'][1]['id'])->toBe($oldMaintenance->id);
        });
    });

    describe('Update', function () {
        it('requires authentication', function () {
            $asset = Asset::factory()->create();
            $maintenance = AssetMaintenance::factory()->create(['asset_id' => $asset->id]);

            $response = $this->put(route('assets.maintenances.update', [$asset->id, $maintenance->id]), []);

            $response->assertRedirect(route('login'));
        });

        it('updates maintenance record successfully', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.edit');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();
            $maintenance = AssetMaintenance::factory()->create([
                'asset_id' => $asset->id,
                'jenis_perawatan' => 'Preventive',
                'biaya' => 100000,
            ]);

            $response = $this->actingAs($user)
                ->put(route('assets.maintenances.update', [$asset->id, $maintenance->id]), [
                    'jenis_perawatan' => 'Corrective',
                    'tanggal' => '2026-01-20',
                    'biaya' => 750000.00,
                    'pelaksana' => 'PT Service Baru',
                    'keterangan' => 'Perbaikan komponen rusak',
                ]);

            $response->assertStatus(302)
                ->assertSessionHasNoErrors();

            $this->assertDatabaseHas('asset_maintenances', [
                'id' => $maintenance->id,
                'jenis_perawatan' => 'Corrective',
                'biaya' => 750000.00,
                'pelaksana' => 'PT Service Baru',
                'keterangan' => 'Perbaikan komponen rusak',
            ]);
        });

        it('returns success message after update', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.edit');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();
            $maintenance = AssetMaintenance::factory()->create(['asset_id' => $asset->id]);

            $response = $this->actingAs($user)
                ->put(route('assets.maintenances.update', [$asset->id, $maintenance->id]), [
                    'jenis_perawatan' => 'Corrective',
                    'tanggal' => '2026-01-20',
                    'pelaksana' => 'PT Service Baru',
                ]);

            $response->assertStatus(302)
                ->assertSessionHas('success', 'Perawatan aset berhasil diperbarui');
        });
    });

    describe('Destroy', function () {
        it('requires authentication', function () {
            $asset = Asset::factory()->create();
            $maintenance = AssetMaintenance::factory()->create(['asset_id' => $asset->id]);

            $response = $this->delete(route('assets.maintenances.destroy', [$asset->id, $maintenance->id]));

            $response->assertRedirect(route('login'));
        });

        it('deletes maintenance record successfully', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.delete');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();
            $maintenance = AssetMaintenance::factory()->create(['asset_id' => $asset->id]);

            $response = $this->actingAs($user)
                ->delete(route('assets.maintenances.destroy', [$asset->id, $maintenance->id]));

            $response->assertStatus(302)
                ->assertSessionHasNoErrors();

            $this->assertSoftDeleted('asset_maintenances', [
                'id' => $maintenance->id,
            ]);
        });

        it('returns success message after deletion', function () {
            $user = User::factory()->create();
            $user->givePermissionTo('assets.maintenance.delete');
            $user->load('permissions');

            $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
            $asset = Asset::factory()->create();
            $maintenance = AssetMaintenance::factory()->create(['asset_id' => $asset->id]);

            $response = $this->actingAs($user)
                ->delete(route('assets.maintenances.destroy', [$asset->id, $maintenance->id]));

            $response->assertStatus(302)
                ->assertSessionHas('success', 'Perawatan aset berhasil dihapus');
        });
    });
});
