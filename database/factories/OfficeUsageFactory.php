<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OfficeUsage>
 */
class OfficeUsageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'supply_id' => \App\Models\OfficeSupply::factory(),
            'jumlah' => fake()->numberBetween(1, 10),
            'tanggal' => fake()->date(),
            'keperluan' => fake()->sentence(),
            'user_id' => \App\Models\User::factory(),
        ];
    }
}
