<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RequestDetail>
 */
class RequestDetailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $jumlahDiminta = fake()->numberBetween(1, 20);

        return [
            'request_id' => \App\Models\AtkRequest::factory(),
            'item_id' => \App\Models\Item::factory(),
            'jumlah_diminta' => $jumlahDiminta,
            'jumlah_disetujui' => $jumlahDiminta,
            'jumlah_diberikan' => null,
        ];
    }
}
