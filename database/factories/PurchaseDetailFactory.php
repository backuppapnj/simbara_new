<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseDetail>
 */
class PurchaseDetailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $jumlah = fake()->numberBetween(1, 100);
        $hargaSatuan = fake()->randomFloat(2, 1000, 50000);

        return [
            'purchase_id' => \App\Models\Purchase::factory(),
            'item_id' => \App\Models\Item::factory(),
            'jumlah' => $jumlah,
            'harga_satuan' => $hargaSatuan,
            'subtotal' => $jumlah * $hargaSatuan,
        ];
    }
}
