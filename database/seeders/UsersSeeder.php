<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->createSuperAdmin();
        $this->createSampleUsers();
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
}
