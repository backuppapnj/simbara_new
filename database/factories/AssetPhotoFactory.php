<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetPhoto>
 */
class AssetPhotoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'asset_id' => \App\Models\Asset::factory(),
            'file_path' => 'asset-photos/'.$this->faker->uuid().'.jpg',
            'file_name' => $this->faker->word().'.jpg',
            'file_size' => $this->faker->numberBetween(1024, 5242880),
            'mime_type' => 'image/jpeg',
            'caption' => $this->faker->optional()->sentence(),
            'is_primary' => false,
        ];
    }
}
