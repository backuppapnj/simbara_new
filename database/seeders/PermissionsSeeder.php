<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsSeeder extends Seeder
{
    /**
     * All permissions grouped by module.
     *
     * Format: {module}.{action}
     *
     * @var array<string, array<string, string>>
     */
    protected array $permissions = [
        'assets' => [
            'assets.view' => 'Lihat daftar aset',
            'assets.create' => 'Tambah aset baru',
            'assets.edit' => 'Edit data aset',
            'assets.delete' => 'Hapus aset',
            'assets.import' => 'Import data aset',
            'assets.export' => 'Export data aset',
            'assets.photos' => 'Kelola foto aset',
            'assets.photos.view' => 'Lihat foto aset',
            'assets.photos.upload' => 'Upload foto aset',
            'assets.photos.delete' => 'Hapus foto aset',
            'assets.maintenance.view' => 'Lihat maintenance aset',
            'assets.maintenance.create' => 'Tambah jadwal maintenance',
            'assets.maintenance.edit' => 'Edit maintenance aset',
            'assets.maintenance.delete' => 'Hapus maintenance aset',
            'assets.reports.view' => 'Lihat laporan aset',
            'assets.reports.export' => 'Export laporan aset',
        ],
        'atk' => [
            'atk.view' => 'Lihat daftar ATK',
            'atk.create' => 'Tambah item ATK baru',
            'atk.edit' => 'Edit item ATK',
            'atk.delete' => 'Hapus item ATK',
            'atk.stock.view' => 'Lihat stok ATK',
            'atk.items.create' => 'Tambah item ATK baru',
            'atk.items.edit' => 'Edit item ATK',
            'atk.items.delete' => 'Hapus item ATK',
            'atk.purchases.view' => 'Lihat pembelian ATK',
            'atk.purchases.create' => 'Tambah pembelian ATK',
            'atk.purchases.approve' => 'Setujui pembelian ATK',
            'atk.requests.view' => 'Lihat permintaan ATK',
            'atk.requests.create' => 'Buat permintaan ATK',
            'atk.requests.approve' => 'Setujui permintaan ATK',
            'atk.requests.reject' => 'Tolak permintaan ATK',
            'atk.requests.distribute' => 'Distribusikan ATK',
            'atk.reports.view' => 'Lihat laporan ATK',
            'atk.reports.export' => 'Export laporan ATK',
        ],
        'office' => [
            'office.view' => 'Lihat perlengkapan kantor',
            'office.create' => 'Tambah perlengkapan kantor',
            'office.edit' => 'Edit perlengkapan kantor',
            'office.delete' => 'Hapus perlengkapan kantor',
            'office.items.create' => 'Tambah perlengkapan kantor',
            'office.items.edit' => 'Edit perlengkapan kantor',
            'office.items.delete' => 'Hapus perlengkapan kantor',
            'office.stock.view' => 'Lihat stok perlengkapan',
            'office.usage.view' => 'Lihat penggunaan perlengkapan',
            'office.usage.log' => 'Catat penggunaan/perlengkapan',
            'office.usage.create' => 'Catat penggunaan perlengkapan',
            'office.mutations.view' => 'Lihat mutasi perlengkapan',
            'office.purchases' => 'Kelola pembelian perlengkapan',
            'office.requests.view' => 'Lihat permintaan perlengkapan',
            'office.requests.create' => 'Buat permintaan perlengkapan',
            'office.requests.approve' => 'Setujui permintaan perlengkapan',
            'office.requests.reject' => 'Tolak permintaan perlengkapan',
            'office.reports.view' => 'Lihat laporan perlengkapan',
            'office.reports.export' => 'Export laporan perlengkapan',
        ],
        'stock_opnames' => [
            'stock_opnames.view' => 'Lihat stock opname',
            'stock_opnames.create' => 'Buat stock opname',
            'stock_opnames.edit' => 'Edit stock opname',
            'stock_opnames.delete' => 'Hapus stock opname',
            'stock_opnames.submit' => 'Submit stock opname',
            'stock_opnames.approve' => 'Setujui stock opname',
            'stock_opnames.export' => 'Export stock opname',
        ],
        'users' => [
            'users.view' => 'Lihat daftar pengguna',
            'users.create' => 'Tambah pengguna baru',
            'users.edit' => 'Edit data pengguna',
            'users.delete' => 'Hapus pengguna',
            'users.activate' => 'Aktifkan pengguna',
            'users.deactivate' => 'Nonaktifkan pengguna',
        ],
        'roles' => [
            'roles.view' => 'Lihat daftar role',
            'roles.manage' => 'Kelola role dan permission',
        ],
        'permissions' => [
            'permissions.view' => 'Lihat daftar permission',
            'permissions.manage' => 'Kelola permission',
        ],
        'settings' => [
            'settings.view' => 'Lihat pengaturan',
            'settings.whatsapp' => 'Kelola pengaturan WhatsApp',
            'settings.general' => 'Kelola pengaturan umum',
        ],
    ];

    /**
     * Default role-permission mappings.
     *
     * @var array<string, array<int, string>>
     */
    protected array $rolePermissions = [
        'super_admin' => ['*'], // Wildcard for all permissions
        'kpa' => [
            '*.view',
            '*.reports.view',
            '*.reports.export',
            'atk.requests.approve',
            'office.requests.approve',
        ],
        'kasubag_umum' => [
            'assets.*',
            'atk.*',
            'office.*',
        ],
        'operator_bmn' => [
            'assets.*',
            'atk.view',
            'atk.stock.view',
            'office.view',
        ],
        'operator_persediaan' => [
            'assets.view',
            'atk.*',
            'office.*',
            'atk.requests.approve', // Level 1 approval
        ],
        'pegawai' => [
            'assets.view',
            'atk.view',
            'atk.stock.view',
            'office.view',
            'atk.requests.create',
            'office.requests.create',
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command?->newLine();
        $this->command?->info('========================================');
        $this->command?->info('Seeding Permissions...');
        $this->command?->info('========================================');

        // Create all permissions
        $this->createPermissions();

        // Sync permissions to roles
        $this->syncPermissions();

        $this->command?->newLine();
        $this->command?->info('========================================');
        $this->command?->info('Permissions Seeding Completed!');
        $this->command?->info('========================================');
        $this->command?->newLine();
    }

    /**
     * Create all permissions.
     */
    protected function createPermissions(): void
    {
        $createdCount = 0;
        $existingCount = 0;

        foreach ($this->permissions as $module => $modulePermissions) {
            foreach ($modulePermissions as $name => $description) {
                $permission = Permission::firstOrCreate(
                    ['name' => $name, 'guard_name' => 'web'],
                    ['name' => $name, 'guard_name' => 'web']
                );

                if ($permission->wasRecentlyCreated) {
                    $createdCount++;
                    $this->command?->line("  <fg=green>✓</> Created: {$name}");
                } else {
                    $existingCount++;
                    $this->command?->line("  <fg=blue>○</> Existing: {$name}");
                }
            }
        }

        $this->command?->newLine();
        $this->command?->line("  Total permissions created: <fg=green>{$createdCount}</>");
        $this->command?->line("  Total permissions existing: <fg=blue>{$existingCount}</>");
        $this->command?->line('  Total permissions: <fg=cyan>'.($createdCount + $existingCount).'</>');
    }

    /**
     * Sync permissions to roles.
     */
    protected function syncPermissions(): void
    {
        $this->command?->newLine();
        $this->command?->info('Syncing Permissions to Roles...');

        foreach ($this->rolePermissions as $roleName => $permissions) {
            $role = Role::where('name', $roleName)->first();

            if (! $role) {
                $this->command?->warn("  Role '{$roleName}' not found. Skipping.");

                continue;
            }

            if (in_array('*', $permissions)) {
                // Wildcard: give all permissions
                $allPermissions = Permission::all()->pluck('name')->toArray();
                $role->syncPermissions($allPermissions);
                $this->command?->line("  <fg=green>✓</> {$roleName}: All permissions (".count($allPermissions).')');
            } else {
                // Expand wildcard patterns (e.g., *.view)
                $expandedPermissions = $this->expandWildcards($permissions);
                $role->syncPermissions($expandedPermissions);
                $this->command?->line("  <fg=green>✓</> {$roleName}: ".count($expandedPermissions).' permissions');
            }
        }
    }

    /**
     * Expand wildcard permissions to actual permission names.
     *
     * @param  array<int, string>  $permissions
     * @return array<int, string>
     */
    protected function expandWildcards(array $permissions): array
    {
        $expanded = [];

        // Get all available permission names
        $allPermissionNames = Permission::all()->pluck('name')->toArray();

        foreach ($permissions as $permission) {
            if (str_starts_with($permission, '*.')) {
                // Wildcard for action across all modules: *.view
                $action = str_replace('*.', '', $permission);
                foreach ($allPermissionNames as $permissionName) {
                    if (str_ends_with($permissionName, '.'.$action)) {
                        $expanded[] = $permissionName;
                    }
                }
            } elseif (str_ends_with($permission, '.*')) {
                // Wildcard for all actions in a module: assets.*
                $module = str_replace('.*', '', $permission);
                foreach ($allPermissionNames as $permissionName) {
                    if (str_starts_with($permissionName, $module.'.')) {
                        $expanded[] = $permissionName;
                    }
                }
            } else {
                // Exact permission name
                if (in_array($permission, $allPermissionNames)) {
                    $expanded[] = $permission;
                }
            }
        }

        return array_unique($expanded);
    }
}
