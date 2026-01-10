<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NotificationLog>
 */
class NotificationLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'event_type' => fake()->randomElement(['request_created', 'approval_needed', 'reorder_alert']),
            'phone' => '+6281234567890',
            'message' => fake()->sentence(),
            'status' => fake()->randomElement(['pending', 'sent', 'failed', 'retrying']),
            'fonnte_response' => ['status' => 'success'],
            'error_message' => null,
            'retry_count' => 0,
            'sent_at' => now(),
        ];
    }
}
