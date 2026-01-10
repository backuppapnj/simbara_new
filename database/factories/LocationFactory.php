<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama_ruangan' => fake()->word(),
            'gedung' => fake()->word(),
            'lantai' => fake()->numberBetween(1, 5),
            'kapasitas' => fake()->numberBetween(1, 100),
            'keterangan' => fake()->sentence(),
        ];
    }
}
