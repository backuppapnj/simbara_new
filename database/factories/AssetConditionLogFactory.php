<?php

namespace Database\Factories;

use App\Models\Asset;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetConditionLog>
 */
class AssetConditionLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $kondisiLama = fake()->randomElement(['1', '2', '3']);
        $kondisiBaru = fake()->randomElement(['1', '2', '3']);
        $urKondisiLama = match ($kondisiLama) {
            '1' => 'Baik',
            '2' => 'Rusak Ringan',
            '3' => 'Rusak Berat',
        };
        $urKondisiBaru = match ($kondisiBaru) {
            '1' => 'Baik',
            '2' => 'Rusak Ringan',
            '3' => 'Rusak Berat',
        };

        return [
            'asset_id' => Asset::factory(),
            'kd_kondisi_lama' => $kondisiLama,
            'kd_kondisi_baru' => $kondisiBaru,
            'ur_kondisi_lama' => $urKondisiLama,
            'ur_kondisi_baru' => $urKondisiBaru,
            'alasan' => fake()->sentence(),
            'user_id' => null,
        ];
    }
}
