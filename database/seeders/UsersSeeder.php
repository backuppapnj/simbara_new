<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->createUsersFromPegawaiData();
        $this->createSuperAdmin();
        $this->createSampleUsers();
        $this->createMultiRoleTestUsers();
    }

    /**
     * Create users from pegawai data JSON file.
     */
    protected function createUsersFromPegawaiData(): void
    {
        $jsonPath = base_path('docs/data-pegawai.json');

        if (! file_exists($jsonPath)) {
            $this->command?->warn('File data-pegawai.json tidak ditemukan di: '.$jsonPath);

            return;
        }

        $jsonData = json_decode(file_get_contents($jsonPath), true);

        if (! isset($jsonData['pegawai'])) {
            $this->command?->warn('Format file data-pegawai.json tidak valid. Key "pegawai" tidak ditemukan.');

            return;
        }

        $pegawaiData = $jsonData['pegawai'];
        $totalPegawai = count($pegawaiData);

        $this->command?->info("Memulai pembuatan {$totalPegawai} user dari data pegawai...");

        DB::beginTransaction();

        try {
            $createdCount = 0;
            $updatedCount = 0;
            $errorCount = 0;

            foreach ($pegawaiData as $index => $pegawai) {
                try {
                    $nip = isset($pegawai['nip']) ? $pegawai['nip'] : null;
                    $nama = isset($pegawai['nama']) ? $pegawai['nama'] : null;
                    $jabatan = isset($pegawai['jabatan']) ? $pegawai['jabatan'] : null;

                    if (! $nip || ! $nama || ! $jabatan) {
                        $this->command?->warn("Skip data #{$index}: NIP, Nama, atau Jabatan kosong.");
                        $errorCount++;

                        continue;
                    }

                    // Determine role based on jabatan
                    $role = $this->determineRoleFromJabatan($nip, $jabatan);

                    // Generate email from NIP
                    $email = $nip.'@simpa.pa-ppun.go.id';

                    // Check if user exists
                    $existingUser = User::where('email', $email)->first();

                    if ($existingUser) {
                        // Update existing user
                        $existingUser->update([
                            'name' => $nama,
                            'nip' => $nip,
                            'position' => $jabatan,
                            'is_active' => true,
                        ]);

                        // Sync role
                        $existingUser->syncRoles([$role]);

                        $updatedCount++;
                        $this->command?->line("  <fg=green>✓</> Update: {$nama} ({$email}) - Role: {$role}");
                    } else {
                        // Create new user
                        $user = User::create([
                            'name' => $nama,
                            'email' => $email,
                            'nip' => $nip,
                            'position' => $jabatan,
                            'phone' => null,
                            'password' => Hash::make('password'),
                            'is_active' => true,
                        ]);

                        // Assign role
                        $user->assignRole($role);

                        $createdCount++;
                        $this->command?->line("  <fg=green>✓</> Created: {$nama} ({$email}) - Role: {$role}");
                    }
                } catch (\Exception $e) {
                    $errorCount++;
                    $nama = isset($pegawai['nama']) ? $pegawai['nama'] : 'Unknown';
                    $this->command?->error("  ✗ Error processing {$nama}: {$e->getMessage()}");
                }
            }

            DB::commit();

            $this->command?->newLine();
            $this->command?->info('----------------------------------------');
            $this->command?->info('Seeding User dari Data Pegawai Selesai!');
            $this->command?->info('----------------------------------------');
            $this->command?->line("  Total pegawai: {$totalPegawai}");
            $this->command?->line("  <fg=green>User created:</fg=green> {$createdCount}");
            $this->command?->line("  <fg=blue>User updated:</fg=blue> {$updatedCount}");
            $this->command?->line("  <fg=red>Errors:</fg=red> {$errorCount}");
            $this->command?->info('----------------------------------------');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command?->error('Terjadi kesalahan saat seeding: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Determine role based on jabatan.
     *
     * @param  string  $nip  NIP pegawai
     * @param  string  $jabatan  Jabatan pegawai
     */
    protected function determineRoleFromJabatan(string $nip, string $jabatan): string
    {
        // Special case: MUHARDIANSYAH, S.Kom. with NIP 199107132020121003 -> superadmin
        if ($nip === '199107132020121003' && str_contains($jabatan, 'Pranata Komputer')) {
            return 'super_admin';
        }

        // Structural positions -> admin (using kasubag_umum as admin equivalent)
        $structuralPositions = [
            'Ketua',
            'Wakil Ketua',
            'Panitera',
            'Sekretaris',
            'Panitera Muda',
            'Kepala Subbagian',
        ];

        foreach ($structuralPositions as $position) {
            if (str_contains($jabatan, $position)) {
                return 'kasubag_umum'; // Using kasubag_umum as admin equivalent
            }
        }

        // Functional positions -> user (using pegawai as user equivalent)
        return 'pegawai';
    }

    /**
     * Create the default super_admin user.
     */
    protected function createSuperAdmin(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'phone' => '081234567890',
                'nip' => '123456789012345678',
                'position' => 'Administrator Sistem',
            ]
        );

        $role = Role::where('name', 'super_admin')->first();
        $user->assignRole($role);
    }

    /**
     * Create sample users for each role.
     */
    protected function createSampleUsers(): void
    {
        $sampleUsers = [
            [
                'email' => 'kpa@demo.com',
                'name' => 'KPA',
                'role' => 'kpa',
                'phone' => '081234567891',
                'nip' => '123456789012345679',
                'position' => 'Kuasa Pengguna Anggaran',
            ],
            [
                'email' => 'kasubag@demo.com',
                'name' => 'Kasubag Umum',
                'role' => 'kasubag_umum',
                'phone' => '081234567892',
                'nip' => '123456789012345680',
                'position' => 'Kepala Sub Bagian Umum',
            ],
            [
                'email' => 'operator_bmn@demo.com',
                'name' => 'Operator BMN',
                'role' => 'operator_bmn',
                'phone' => '081234567893',
                'nip' => '123456789012345681',
                'position' => 'Operator Barang Milik Negara',
            ],
            [
                'email' => 'operator_atk@demo.com',
                'name' => 'Operator Persediaan',
                'role' => 'operator_persediaan',
                'phone' => '081234567894',
                'nip' => '123456789012345682',
                'position' => 'Operator Persediaan ATK',
            ],
            [
                'email' => 'pegawai@demo.com',
                'name' => 'Pegawai',
                'role' => 'pegawai',
                'phone' => '081234567895',
                'nip' => '123456789012345683',
                'position' => 'Pegawai',
            ],
        ];

        foreach ($sampleUsers as $userData) {
            $roleName = $userData['role'];
            unset($userData['role']);

            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'password' => Hash::make('password'),
                ])
            );

            $role = Role::where('name', $roleName)->first();
            $user->assignRole($role);
        }
    }

    /**
     * Create multi-role test users for testing the multi-role feature.
     *
     * This creates users with various role combinations to test:
     * - Users with multiple roles
     * - Super admin with no other roles
     * - Different role combinations for testing permissions
     */
    protected function createMultiRoleTestUsers(): void
    {
        $this->command?->newLine();
        $this->command?->info('----------------------------------------');
        $this->command?->info('Creating Multi-Role Test Users...');
        $this->command?->info('----------------------------------------');

        // Super Admin - Pure super admin with no other roles
        // This tests that super_admin role works independently
        $superAdmin = User::firstOrCreate(
            ['email' => 'super@admin.com'],
            [
                'name' => 'Pure Super Admin',
                'password' => Hash::make('password'),
                'phone' => '081111111111',
                'nip' => '900000000000000001',
                'position' => 'Super Administrator',
            ]
        );
        $superAdmin->syncRoles(['super_admin']);
        $this->command?->line('  <fg=green>✓</> Created: Pure Super Admin (super@admin.com) - Role: super_admin ONLY');

        // Multi-role: KPA + Kasubag Umum
        // Tests user who can both approve requests (KPA) and manage general operations (kasubag_umum)
        $kpaKasubag = User::firstOrCreate(
            ['email' => 'kpa-kasubag@test.com'],
            [
                'name' => 'KPA Kasubag Umum',
                'password' => Hash::make('password'),
                'phone' => '081222222222',
                'nip' => '900000000000000002',
                'position' => 'KPA & Kasubag Umum',
            ]
        );
        $kpaKasubag->syncRoles(['kpa', 'kasubag_umum']);
        $this->command?->line('  <fg=green>✓</> Created: KPA Kasubag (kpa-kasubag@test.com) - Roles: kpa, kasubag_umum');

        // Multi-role: Operator BMN + Operator Persediaan
        // Tests user who can manage both assets and inventory
        $operatorBoth = User::firstOrCreate(
            ['email' => 'operator-both@test.com'],
            [
                'name' => 'Operator Ganda',
                'password' => Hash::make('password'),
                'phone' => '081333333333',
                'nip' => '900000000000000003',
                'position' => 'Operator BMN & Persediaan',
            ]
        );
        $operatorBoth->syncRoles(['operator_bmn', 'operator_persediaan']);
        $this->command?->line('  <fg=green>✓</> Created: Operator Both (operator-both@test.com) - Roles: operator_bmn, operator_persediaan');

        // Multi-role: Pegawai + Operator Persediaan
        // Tests regular pegawai who also has operator permissions
        $pegawaiOperator = User::firstOrCreate(
            ['email' => 'pegawai-operator@test.com'],
            [
                'name' => 'Pegawai Operator',
                'password' => Hash::make('password'),
                'phone' => '081444444444',
                'nip' => '900000000000000004',
                'position' => 'Pegawai & Operator Persediaan',
            ]
        );
        $pegawaiOperator->syncRoles(['pegawai', 'operator_persediaan']);
        $this->command?->line('  <fg=green>✓</> Created: Pegawai Operator (pegawai-operator@test.com) - Roles: pegawai, operator_persediaan');

        // Multi-role: KPA + Operator BMN
        // Tests user who can approve and manage assets
        $kpaOperatorBmn = User::firstOrCreate(
            ['email' => 'kpa-operator-bmn@test.com'],
            [
                'name' => 'KPA Operator BMN',
                'password' => Hash::make('password'),
                'phone' => '081555555555',
                'nip' => '900000000000000005',
                'position' => 'KPA & Operator BMN',
            ]
        );
        $kpaOperatorBmn->syncRoles(['kpa', 'operator_bmn']);
        $this->command?->line('  <fg=green>✓</> Created: KPA Operator BMN (kpa-operator-bmn@test.com) - Roles: kpa, operator_bmn');

        // Multi-role: All operator roles
        // Tests user with all operator permissions
        $allOperators = User::firstOrCreate(
            ['email' => 'all-operators@test.com'],
            [
                'name' => 'All Operators',
                'password' => Hash::make('password'),
                'phone' => '081666666666',
                'nip' => '900000000000000006',
                'position' => 'Multi-Operator',
            ]
        );
        $allOperators->syncRoles(['operator_bmn', 'operator_persediaan']);
        $this->command?->line('  <fg=green>✓</> Created: All Operators (all-operators@test.com) - Roles: operator_bmn, operator_persediaan');

        // Single role users for comparison
        // These are baseline users to compare against multi-role users

        // Single: KPA only
        $kpaOnly = User::firstOrCreate(
            ['email' => 'kpa-only@test.com'],
            [
                'name' => 'KPA Only',
                'password' => Hash::make('password'),
                'phone' => '081777777777',
                'nip' => '900000000000000007',
                'position' => 'KPA Only',
            ]
        );
        $kpaOnly->syncRoles(['kpa']);
        $this->command?->line('  <fg=blue>✓</> Created: KPA Only (kpa-only@test.com) - Role: kpa ONLY (baseline)');

        // Single: Kasubag Umum only
        $kasubagOnly = User::firstOrCreate(
            ['email' => 'kasubag-only@test.com'],
            [
                'name' => 'Kasubag Only',
                'password' => Hash::make('password'),
                'phone' => '081888888888',
                'nip' => '900000000000000008',
                'position' => 'Kasubag Only',
            ]
        );
        $kasubagOnly->syncRoles(['kasubag_umum']);
        $this->command?->line('  <fg=blue>✓</> Created: Kasubag Only (kasubag-only@test.com) - Role: kasubag_umum ONLY (baseline)');

        $this->command?->info('----------------------------------------');
        $this->command?->info('Multi-Role Test Users Created Successfully!');
        $this->command?->info('----------------------------------------');
        $this->command?->newLine();
    }
}
