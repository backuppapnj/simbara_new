<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles before each test
    $this->seed(\Database\Seeders\RolesSeeder::class);
});

describe('UserExportController', function () {
    describe('Export - CSV Export', function () {
        it('requires authentication', function () {
            $response = $this->get(route('admin.users.export', ['format' => 'csv']));

            $response->assertRedirect(route('login'));
        });

        it('requires users.view permission', function () {
            $user = User::factory()->create();
            $user->assignRole('pegawai');

            $response = $this->actingAs($user)
                ->get(route('admin.users.export', ['format' => 'csv']));

            $response->assertForbidden();
        });

        it('allows super_admin to export users', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            // Create some test users
            User::factory()->count(5)->create();

            $response = $this->actingAs($superAdmin)
                ->get(route('admin.users.export', ['format' => 'csv']));

            $response->assertSuccessful();
            $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
            $response->assertHeader('content-disposition', 'attachment; filename=users-'.date('Y-m-d').'.csv');
        });

        it('generates CSV file with proper headers', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            $response = $this->actingAs($superAdmin)
                ->get(route('admin.users.export', ['format' => 'csv']));

            $response->assertSuccessful();
            // Verify it's a CSV download with proper filename format
            $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
            $disposition = $response->headers->get('content-disposition');
            expect($disposition)->toContain('attachment; filename=users-');
            expect($disposition)->toContain('.csv');
        });

        it('applies search filter to query', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            // Create users with different names
            User::factory()->create(['name' => 'John Doe']);
            User::factory()->create(['name' => 'Jane Smith']);
            User::factory()->create(['name' => 'Bob Johnson']);

            // Verify the query is filtered correctly
            $export = new \App\Exports\UserExport(search: 'John');
            $query = $export->query()->get();

            expect($query)->toHaveCount(2);
            expect($query->pluck('name')->toArray())->toContain('John Doe');
            expect($query->pluck('name')->toArray())->toContain('Bob Johnson');
            expect($query->pluck('name')->toArray())->not()->toContain('Jane Smith');
        });

        it('applies role filter to query', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            // Create users with different roles
            $user1 = User::factory()->create(['name' => 'User One']);
            $user1->assignRole('pegawai');

            $user2 = User::factory()->create(['name' => 'User Two']);
            $user2->assignRole('kpa');

            $user3 = User::factory()->create(['name' => 'User Three']);
            $user3->assignRole('pegawai');

            // Verify the query is filtered correctly
            $export = new \App\Exports\UserExport(role: 'pegawai');
            $query = $export->query()->get();

            expect($query)->toHaveCount(2);
            expect($query->pluck('name')->toArray())->toContain('User One');
            expect($query->pluck('name')->toArray())->toContain('User Three');
            expect($query->pluck('name')->toArray())->not()->toContain('User Two');
        });

        it('applies status filter to query', function () {
            $superAdmin = User::factory()->create(['is_active' => false]); // Make superAdmin inactive so it's not counted
            $superAdmin->assignRole('super_admin');

            // Create active and inactive users
            User::factory()->create(['name' => 'Active User', 'is_active' => true]);
            User::factory()->create(['name' => 'Inactive User', 'is_active' => false]);

            // Verify the query is filtered correctly
            $export = new \App\Exports\UserExport(isActive: true);
            $query = $export->query()->get();

            expect($query)->toHaveCount(1);
            expect($query->first()->name)->toBe('Active User');
        });

        it('handles export with multiple users', function () {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super_admin');

            // Create multiple users
            User::factory()->count(10)->create();

            $response = $this->actingAs($superAdmin)
                ->get(route('admin.users.export', ['format' => 'csv']));

            $response->assertSuccessful();
        });
    });
});
