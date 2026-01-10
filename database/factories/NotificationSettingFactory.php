<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NotificationSetting>
 */
class NotificationSettingFactory extends Factory
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
            'whatsapp_enabled' => true,
            'notify_reorder_alert' => true,
            'notify_approval_needed' => true,
            'notify_request_update' => false,
            'quiet_hours_start' => null,
            'quiet_hours_end' => null,
        ];
    }
}
