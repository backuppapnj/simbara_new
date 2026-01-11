<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OfficeRequestDetail>
 */
class OfficeRequestDetailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $jumlah = fake()->numberBetween(1, 20);

        return [
            'id' => (string) Str::ulid(),
            'request_id' => \App\Models\OfficeRequest::factory(),
            'supply_id' => \App\Models\OfficeSupply::factory(),
            'jumlah' => $jumlah,
            'jumlah_diberikan' => fake()->optional(0.5)->numberBetween(1, $jumlah),
        ];
    }
}
