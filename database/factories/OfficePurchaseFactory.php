<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OfficePurchase>
 */
class OfficePurchaseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'no_pembelian' => 'PO-'.fake()->unique()->date('Ymd-His'),
            'tanggal' => fake()->date(),
            'supplier' => fake()->randomElement([
                'Toko ABC',
                'CV Maju Jaya',
                'PT Sumber Rejeki',
                'UD Berkah',
                'Toko Gunung Agung',
            ]),
            'total_nilai' => fake()->randomFloat(2, 50000, 5000000),
            'keterangan' => fake()->optional()->sentence(),
        ];
    }
}
