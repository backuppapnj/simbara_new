<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Asset>
 */
class AssetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $kondisi = fake()->randomElement(['1', '2', '3']);
        $urKondisi = match ($kondisi) {
            '1' => 'Baik',
            '2' => 'Rusak Ringan',
            '3' => 'Rusak Berat',
        };

        return [
            'id_aset' => fake()->unique()->randomNumber(9, true),
            'kd_brg' => fake()->numerify('##############'),
            'no_aset' => fake()->randomNumber(4, true),
            'kode_register' => fake()->unique()->regexify('[A-Z0-9]{32}'),
            'nama' => fake()->words(3, true),
            'merk' => fake()->word(),
            'tipe' => fake()->word(),
            'ur_sskel' => fake()->sentence(),
            'kd_jns_bmn' => fake()->numberBetween(1, 10),
            'kd_kondisi' => $kondisi,
            'ur_kondisi' => $urKondisi,
            'kd_status' => fake()->randomElement(['01', '02', '03', '04']),
            'ur_status' => fake()->sentence(),
            'tercatat' => fake()->randomElement(['-2', '-1', '0', '1']),
            'rph_aset' => fake()->randomNumber(8, true),
            'rph_susut' => fake()->randomNumber(6, true),
            'rph_buku' => fake()->randomNumber(8, true),
            'rph_perolehan' => fake()->randomNumber(8, true),
            'tgl_perlh' => fake()->date(),
            'tgl_rekam' => fake()->date(),
            'tgl_rekam_pertama' => fake()->date(),
            'lokasi_ruang' => fake()->word(),
            'lokasi_id' => null,
            'asl_perlh' => fake()->word(),
            'kd_satker' => fake()->regexify('[A-Z0-9]{20}'),
            'ur_satker' => fake()->company(),
            'jml_photo' => fake()->numberBetween(0, 5),
            'umur_sisa' => fake()->numberBetween(0, 20),
            'penanggung_jawab_id' => null,
        ];
    }
}
