<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class FonnteSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if setting already exists
        $existing = Setting::where('key', 'fonnte_api_token')->first();

        if (! $existing) {
            Setting::create([
                'key' => 'fonnte_api_token',
                'value' => '', // Empty by default, needs to be configured
                'type' => 'whatsapp_config',
            ]);
        }
    }
}
