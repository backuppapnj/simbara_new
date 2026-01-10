<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            'super_admin' => 'Administrator sistem (all permissions)',
            'kpa' => 'Kuasa Penggang Anggaran (View + Report + Approval L3)',
            'kasubag_umum' => 'Kepala Sub Bagian Umum (View + Report + CRUD + Approval L2)',
            'operator_bmn' => 'Operator BMN (CRUD Aset)',
            'operator_persediaan' => 'Operator Persediaan (CRUD ATK + Approval L1)',
            'pegawai' => 'Pegawai umum (View + Request)',
        ];

        foreach ($roles as $name => $description) {
            \Spatie\Permission\Models\Role::firstOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
                ['name' => $name, 'guard_name' => 'web']
            );
        }
    }
}
