<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AuditLog>
 */
class AuditLogFactory extends Factory
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
            'actor_id' => \App\Models\User::factory(),
            'action' => fake()->randomElement(['user_created', 'user_updated', 'user_deleted', 'role_assigned', 'role_removed', 'impersonate_started', 'impersonate_stopped']),
            'changes' => [
                'before' => fake()->optional()->randomElement([
                    ['name' => fake()->name(), 'email' => fake()->email()],
                    ['role' => fake()->word()],
                ]),
                'after' => fake()->optional()->randomElement([
                    ['name' => fake()->name(), 'email' => fake()->email()],
                    ['role' => fake()->word()],
                ]),
            ],
        ];
    }
}
