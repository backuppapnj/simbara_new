<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LocationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            [
                'nama_ruangan' => 'Ruang Rapat Utama',
                'gedung' => 'Gedung A',
                'lantai' => 1,
                'kapasitas' => 30,
                'keterangan' => 'Ruang rapat utama untuk pertemuan formal',
            ],
            [
                'nama_ruangan' => 'Ruang TU Umum',
                'gedung' => 'Gedung A',
                'lantai' => 1,
                'kapasitas' => 10,
                'keterangan' => 'Ruang tata usaha untuk administrasi umum',
            ],
            [
                'nama_ruangan' => 'Ruang Arsip',
                'gedung' => 'Gedung B',
                'lantai' => 2,
                'kapasitas' => 5,
                'keterangan' => 'Ruang penyimpanan dokumen dan arsip',
            ],
            [
                'nama_ruangan' => 'Ruang Kepala Sekolah',
                'gedung' => 'Gedung A',
                'lantai' => 3,
                'kapasitas' => 8,
                'keterangan' => 'Ruang kerja kepala sekolah',
            ],
            [
                'nama_ruangan' => 'Ruang Guru',
                'gedung' => 'Gedung A',
                'lantai' => 2,
                'kapasitas' => 20,
                'keterangan' => 'Ruang berkumpul dan persiapan guru',
            ],
            [
                'nama_ruangan' => 'Ruang BK',
                'gedung' => 'Gedung A',
                'lantai' => 2,
                'kapasitas' => 6,
                'keterangan' => 'Ruang bimbingan konseling',
            ],
            [
                'nama_ruangan' => 'Ruang Lab Komputer',
                'gedung' => 'Gedung C',
                'lantai' => 1,
                'kapasitas' => 25,
                'keterangan' => 'Laboratorium komputer untuk praktikum',
            ],
            [
                'nama_ruangan' => 'Ruang Perpustakaan',
                'gedung' => 'Gedung B',
                'lantai' => 1,
                'kapasitas' => 40,
                'keterangan' => 'Ruang koleksi dan pembacaan buku',
            ],
        ];

        foreach ($locations as $location) {
            Location::firstOrCreate(
                ['nama_ruangan' => $location['nama_ruangan']],
                $location
            );
        }
    }
}
