<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OfficePurchaseDetail>
 */
class OfficePurchaseDetailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $jumlah = fake()->numberBetween(1, 50);
        $hargaSatuan = fake()->randomFloat(2, 5000, 100000);

        return [
            'purchase_id' => \App\Models\OfficePurchase::factory(),
            'supply_id' => \App\Models\OfficeSupply::factory(),
            'jumlah' => $jumlah,
            'subtotal' => fake()->optional(0.7)->randomFloat(2, $jumlah * $hargaSatuan * 0.8, $jumlah * $hargaSatuan * 1.2),
        ];
    }
}
