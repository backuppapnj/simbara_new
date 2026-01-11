<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AtkRequest>
 */
class AtkRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'no_permintaan' => 'REQ-'.date('Ymd').'-'.str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'user_id' => \App\Models\User::factory(),
            'department_id' => \App\Models\Department::factory(),
            'tanggal' => fake()->date(),
            'status' => fake()->randomElement([
                'pending',
                'level1_approved',
                'level2_approved',
                'level3_approved',
                'rejected',
                'diserahkan',
                'diterima',
            ]),
            'level1_approval_by' => null,
            'level1_approval_at' => null,
            'level2_approval_by' => null,
            'level2_approval_at' => null,
            'level3_approval_by' => null,
            'level3_approval_at' => null,
            'keterangan' => fake()->optional()->sentence(),
            'alasan_penolakan' => fake()->optional()->sentence(),
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
     * Indicate that the request is level1 approved.
     */
    public function level1Approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'level1_approved',
        ]);
    }

    /**
     * Indicate that the request is level2 approved.
     */
    public function level2Approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'level2_approved',
        ]);
    }

    /**
     * Indicate that the request is level3 approved.
     */
    public function level3Approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'level3_approved',
        ]);
    }

    /**
     * Indicate that the request is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
        ]);
    }

    /**
     * Indicate that the request has been distributed.
     */
    public function diserahkan(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'diserahkan',
            'distributed_by' => \App\Models\User::factory(),
            'distributed_at' => now(),
        ]);
    }
}
