<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OfficeSupply>
 */
class OfficeSupplyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama_barang' => fake()->randomElement([
                'Gula Pasir',
                'Teh Hijau',
                'Kopi Arabika',
                'Snack Biskuit',
                'Sabun Cuci Piring',
                'Sabun Tangan',
                'Pel Lantai',
                'Kemoceng',
                'Deterjen',
                'Tisu Wajah',
                'Plastik Kremes',
                'Kertas Roll',
            ]),
            'satuan' => fake()->randomElement(['kg', 'pack', 'box', 'pcs', 'liter', 'roll']),
            'kategori' => fake()->randomElement(['Consumables', 'Cleaning Supplies', 'Operational']),
            'deskripsi' => fake()->optional()->sentence(),
            'stok' => fake()->numberBetween(0, 100),
            'stok_minimal' => fake()->numberBetween(5, 20),
        ];
    }
}
