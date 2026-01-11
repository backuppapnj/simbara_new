<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Urutan eksekusi seeder sangat penting karena ada ketergantungan:
     *
     * **DEPENDENCY CHAIN:**
     * 1. Roles (independent - foundation for RBAC)
     *    ↓
     * 2. Permissions (requires Roles - assigns permissions to roles)
     *    ↓
     * 3. Users (requires Roles + Permissions - assigns roles to users)
     *
     * **INDEPENDENT SEEDERS** (can run in parallel, no dependencies):
     * - Locations (standalone reference data)
     * - Departments (standalone reference data)
     * - FonnteSettings (standalone configuration)
     *
     * **SECONDARY DEPENDENCY:**
     * - Assets (requires Locations - foreign key constraint)
     *
     * **EXECUTION ORDER:**
     * 1. RolesSeeder - Creates all roles (super_admin, kpa, kasubag_umum, operator_bmn, operator_persediaan, pegawai)
     * 2. PermissionsSeeder - Creates permissions and syncs them to roles (requires roles to exist)
     * 3. LocationsSeeder - Creates location reference data (independent)
     * 4. DepartmentsSeeder - Creates department reference data (independent)
     * 5. FonnteSettingSeeder - Creates WhatsApp configuration (independent)
     * 6. UsersSeeder - Creates users and assigns roles (requires roles with permissions)
     * 7. AssetSeeder - Creates assets and links to locations (requires locations)
     */
    public function run(): void
    {
        $this->command->newLine();
        $this->command->info('========================================');
        $this->command->info('Starting Database Seeding...');
        $this->command->info('========================================');

        // ============================================================================
        // STEP 1: RBAC FOUNDATION - Roles & Permissions
        // ============================================================================

        // 1. Roles - HARUS PERTAMA (digunakan oleh Permissions & Users)
        // Creates: super_admin, kpa, kasubag_umum, operator_bmn, operator_persediaan, pegawai
        $this->call(RolesSeeder::class);

        // 2. Permissions - butuh Roles yang sudah ada
        // Creates all permissions and syncs them to roles using role-permission mapping
        // WARNING: Will fail if roles don't exist (uses Role::where()->first())
        $this->call(PermissionsSeeder::class);

        // ============================================================================
        // STEP 2: REFERENCE DATA (Independent, can run in parallel)
        // ============================================================================

        // 3. Locations - independent data (reference data for assets)
        $this->call(LocationsSeeder::class);

        // 4. Departments - independent data (reference data for users)
        $this->call(DepartmentsSeeder::class);

        // 5. Fonnte Settings - independent data (WhatsApp configuration)
        $this->call(FonnteSettingSeeder::class);

        // ============================================================================
        // STEP 3: USER CREATION (Requires RBAC to be fully set up)
        // ============================================================================

        // 6. Users - butuh Roles & Permissions yang sudah ada
        // Creates users from data-pegawai.json and assigns roles using syncRoles()
        // WARNING: Will fail if roles don't exist or don't have permissions
        $this->call(UsersSeeder::class);

        // ============================================================================
        // STEP 4: ASSET DATA (Requires Locations to exist)
        // ============================================================================

        // 7. Assets - butuh Locations yang sudah ada
        // Imports assets from data_simplified.json and links to locations
        // WARNING: Will fail if locations don't exist (foreign key constraint)
        $this->call(AssetSeeder::class);

        $this->command->newLine();
        $this->command->info('========================================');
        $this->command->info('Database Seeding Completed!');
        $this->command->info('========================================');
        $this->command->newLine();
    }
}
