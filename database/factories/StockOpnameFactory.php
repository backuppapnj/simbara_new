<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StockOpname>
 */
class StockOpnameFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'no_so' => 'SO-'.date('Ymd').'-'.str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'tanggal' => fake()->date(),
            'periode_bulan' => fake()->monthName(),
            'periode_tahun' => fake()->numberBetween(2024, 2026),
            'status' => fake()->randomElement(['draft', 'completed', 'approved']),
            'approved_by' => null,
            'approved_at' => null,
            'keterangan' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Indicate that the stock opname is in draft status.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }

    /**
     * Indicate that the stock opname is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }

    /**
     * Indicate that the stock opname is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
        ]);
    }
}
