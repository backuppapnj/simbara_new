<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StockOpnameDetail>
 */
class StockOpnameDetailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $stokSistem = fake()->numberBetween(0, 100);
        $stokFisik = fake()->numberBetween(0, 100);

        return [
            'stock_opname_id' => \App\Models\StockOpname::factory(),
            'item_id' => \App\Models\Item::factory(),
            'stok_sistem' => $stokSistem,
            'stok_fisik' => $stokFisik,
            'selisih' => $stokFisik - $stokSistem,
            'keterangan' => fake()->optional()->sentence(),
        ];
    }
}
