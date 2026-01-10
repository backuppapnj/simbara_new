<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'nama_unit' => 'Keuangan',
                'singkat' => 'KEU',
                'kepala_unit' => 'Kepala Keuangan',
            ],
            [
                'nama_unit' => 'Umum',
                'singkat' => 'UMUM',
                'kepala_unit' => 'Kepala Umum',
            ],
            [
                'nama_unit' => 'Kurikulum',
                'singkat' => 'KUR',
                'kepala_unit' => 'Kepala Kurikulum',
            ],
            [
                'nama_unit' => 'Kesiswaan',
                'singkat' => 'SIS',
                'kepala_unit' => 'Kepala Kesiswaan',
            ],
            [
                'nama_unit' => 'Sarana Prasarana',
                'singkat' => 'SAPRAS',
                'kepala_unit' => 'Kepala Sarana Prasarana',
            ],
        ];

        foreach ($departments as $department) {
            Department::firstOrCreate(
                ['nama_unit' => $department['nama_unit']],
                $department
            );
        }
    }
}
