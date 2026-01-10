<?php

namespace Database\Factories;

use App\Models\Asset;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetMaintenance>
 */
class AssetMaintenanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'asset_id' => Asset::factory(),
            'jenis_perawatan' => fake()->word(),
            'tanggal' => fake()->date(),
            'biaya' => fake()->randomNumber(6, true),
            'pelaksana' => fake()->name(),
            'keterangan' => fake()->sentence(),
        ];
    }
}
