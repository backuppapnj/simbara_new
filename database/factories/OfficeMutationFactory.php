<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OfficeMutation>
 */
class OfficeMutationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $stokSebelum = fake()->numberBetween(0, 100);
        $jumlah = fake()->numberBetween(1, 10);
        $jenis = fake()->randomElement(['masuk', 'keluar']);

        return [
            'supply_id' => \App\Models\OfficeSupply::factory(),
            'jenis_mutasi' => $jenis,
            'jumlah' => $jumlah,
            'stok_sebelum' => $stokSebelum,
            'stok_sesudah' => $jenis === 'masuk' ? $stokSebelum + $jumlah : $stokSebelum - $jumlah,
            'tipe' => fake()->randomElement(['pembelian', 'permintaan', 'manual', 'quick_deduct']),
            'user_id' => \App\Models\User::factory(),
            'keterangan' => fake()->optional()->sentence(),
        ];
    }
}
