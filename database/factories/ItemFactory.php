<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Item>
 */
class ItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kode_barang' => 'ATK-'.str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'nama_barang' => fake()->randomElement([
                'Kertas A4',
                'Pulpen Hitam',
                'Pensil Mekanik',
                'Penggaris Plastik',
                'Stapler',
                'Isi Stapler',
                'Buku Tulis',
                'Lakban Bening',
                'Gunting',
                'Spidol Whiteboard',
            ]),
            'satuan' => fake()->randomElement(['pcs', 'box', 'pack', 'rim']),
            'kategori' => fake()->randomElement(['Alat Tulis', 'Kertas', 'Perlengkapan Kantor', 'Lainnya']),
            'stok' => fake()->numberBetween(0, 100),
            'stok_minimal' => fake()->numberBetween(5, 20),
            'stok_maksimal' => fake()->numberBetween(50, 200),
            'harga_beli_terakhir' => fake()->randomFloat(2, 1000, 50000),
            'harga_rata_rata' => fake()->randomFloat(2, 1000, 50000),
            'harga_jual' => fake()->randomFloat(2, 1500, 75000),
        ];
    }
}
