<?php

use App\Models\Setting;
use Database\Seeders\FonnteSettingSeeder;

describe('FonnteSettingSeeder', function () {
    beforeEach(function () {
        // Clean up before each test
        Setting::where('key', 'fonnte_api_token')->delete();
    });

    test('creates fonnte_api_token setting if not exists', function () {
        $seeder = new FonnteSettingSeeder;
        $seeder->run();

        $setting = Setting::where('key', 'fonnte_api_token')->first();

        expect($setting)->not->toBeNull();
        expect($setting->key)->toBe('fonnte_api_token');
        expect($setting->type)->toBe('whatsapp_config');
    });

    test('does not duplicate existing setting', function () {
        // Create initial setting
        Setting::create([
            'key' => 'fonnte_api_token',
            'value' => 'initial_token',
            'type' => 'whatsapp_config',
        ]);

        $initialCount = Setting::where('key', 'fonnte_api_token')->count();

        // Run seeder
        $seeder = new FonnteSettingSeeder;
        $seeder->run();

        $finalCount = Setting::where('key', 'fonnte_api_token')->count();

        expect($finalCount)->toBe($initialCount);
        expect($finalCount)->toBe(1);
    });

    test('creates setting with empty value by default', function () {
        $seeder = new FonnteSettingSeeder;
        $seeder->run();

        $setting = Setting::where('key', 'fonnte_api_token')->first();

        expect($setting->value)->toBe('');
    });
});
