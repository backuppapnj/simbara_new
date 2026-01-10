<?php

namespace Database\Factories;

use App\Models\Asset;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetHistory>
 */
class AssetHistoryFactory extends Factory
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
            'lokasi_id_lama' => null,
            'lokasi_id_baru' => null,
            'user_id' => null,
            'keterangan' => fake()->sentence(),
        ];
    }
}
