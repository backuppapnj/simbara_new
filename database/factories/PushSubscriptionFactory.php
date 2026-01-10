<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PushSubscription>
 */
class PushSubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null, // Must be set when calling the factory
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/'.fake()->uuid(),
            'key' => fake()->uuid(),
            'token' => fake()->uuid(),
            'content_encoding' => 'aesgcm',
            'user_agent' => fake()->userAgent(),
            'is_active' => true,
            'last_used_at' => now(),
        ];
    }
}
