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

    /**
     * Indicate that the request is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    /**
     * Indicate that the request is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'approved_at' => now(),
            'completed_at' => now(),
        ]);
    }

    /**
     * Indicate that the request is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'alasan_penolakan' => 'Test rejection',
        ]);
    }
}
