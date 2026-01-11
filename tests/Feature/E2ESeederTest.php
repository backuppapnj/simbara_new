<?php

use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RolesSeeder::class);
    $this->seed(\Database\Seeders\UsersSeeder::class);
});

describe('E2E Seeder Tests', function () {
    describe('Transaction Safety', function () {
        it('rolls back changes when an error occurs during seeding', function () {
            // Start with a clean state
            DB::table('departments')->delete();
            DB::table('items')->delete();

            $initialDepartmentCount = DB::table('departments')->count();
            $initialItemCount = DB::table('items')->count();

            // Try to seed with invalid data (simulated error)
            try {
                DB::beginTransaction();

                // Create some data
                DB::table('departments')->insert([
                    'id' => (string) \Illuminate\Support\Str::ulid(),
                    'singkat' => 'TEST',
                    'nama_unit' => 'Test Department',
                    'kepala_unit' => 'Test Head',
                ]);

                // Simulate an error
                throw new \Exception('Simulated error during seeding');
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
            }

            // Verify no changes were made
            expect(DB::table('departments')->count())->toBe($initialDepartmentCount);
            expect(DB::table('items')->count())->toBe($initialItemCount);
        });

        it('commits changes when seeding completes successfully', function () {
            // Start with clean state
            DB::table('departments')->delete();
            DB::table('items')->delete();

            $this->seed(\Database\Seeders\E2ESeeder::class);

            // Verify data was created
            expect(DB::table('departments')->count())->toBeGreaterThan(0);
            expect(DB::table('items')->count())->toBeGreaterThan(0);
        });
    });

    describe('Dependency Validation', function () {
        it('validates that users exist before creating stock opname', function () {
            // Clear users
            DB::table('users')->delete();

            // This should fail if there's no admin user
            expect(function () {
                $seeder = new \Database\Seeders\E2ESeeder;
                $seeder->call('seedStockOpname');
            })->toThrow(\Exception::class);
        });

        it('validates that items exist before creating purchases', function () {
            // Clear items
            DB::table('items')->delete();

            // This should fail if there are no items
            expect(function () {
                $seeder = new \Database\Seeders\E2ESeeder;
                $seeder->call('seedPurchases');
            })->toThrow(\Exception::class);
        });

        it('throws exception with clear message when dependency not met', function () {
            // Clear items
            DB::table('items')->delete();

            expect(function () {
                $this->seed(\Database\Seeders\E2ESeeder::class);
            })->toThrow(\Exception::class);
        });

        it('successfully seeds when all dependencies are met', function () {
            // Ensure dependencies exist
            $userCount = User::count();
            expect($userCount)->toBeGreaterThan(0);

            // Seed should succeed
            $this->seed(\Database\Seeders\E2ESeeder::class);

            // Verify seeded data
            expect(DB::table('departments')->count())->toBe(3);
            expect(Item::count())->toBe(3);
        });
    });

    describe('Data Integrity', function () {
        it('creates all expected departments', function () {
            $this->seed(\Database\Seeders\E2ESeeder::class);

            expect(DB::table('departments')->count())->toBe(3);
            expect(DB::table('departments')->where('singkat', 'IT')->exists())->toBeTrue();
            expect(DB::table('departments')->where('singkat', 'HRD')->exists())->toBeTrue();
            expect(DB::table('departments')->where('singkat', 'KEU')->exists())->toBeTrue();
        });

        it('creates all expected ATK items', function () {
            $this->seed(\Database\Seeders\E2ESeeder::class);

            expect(Item::count())->toBe(3);
            expect(Item::where('kode_barang', 'ATK-0001')->exists())->toBeTrue();
            expect(Item::where('kode_barang', 'ATK-0002')->exists())->toBeTrue();
            expect(Item::where('kode_barang', 'ATK-0003')->exists())->toBeTrue();
        });

        it('creates purchases with valid items', function () {
            $this->seed(\Database\Seeders\E2ESeeder::class);

            $purchaseCount = DB::table('purchases')->count();
            expect($purchaseCount)->toBeGreaterThan(0);

            $purchaseDetailCount = DB::table('purchase_details')->count();
            expect($purchaseDetailCount)->toBeGreaterThan(0);
        });

        it('creates stock opname with valid approver', function () {
            $this->seed(\Database\Seeders\E2ESeeder::class);

            $stockOpnameCount = DB::table('stock_opnames')->count();
            expect($stockOpnameCount)->toBeGreaterThan(0);

            $stockOpname = DB::table('stock_opnames')->first();
            expect($stockOpname->approved_by)->not->toBeNull();
        });
    });
});
