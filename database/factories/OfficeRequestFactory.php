<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OfficeRequest>
 */
class OfficeRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'no_permintaan' => 'REQ-'.fake()->unique()->date('Ymd-His'),
            'user_id' => \App\Models\User::factory(),
            'department_id' => \App\Models\Department::factory(),
            'tanggal' => fake()->date(),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected', 'completed']),
            'keterangan' => fake()->optional()->sentence(),
            'alasan_penolakan' => fake()->optional(0.2)->sentence(),
        ];
    }
}
