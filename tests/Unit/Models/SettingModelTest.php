<?php

use App\Models\Setting;

describe('Setting Model', function () {
    describe('fillable attributes', function () {
        test('key field is fillable', function () {
            $setting = new Setting;
            expect(in_array('key', $setting->getFillable()))->toBeTrue();
        });

        test('value field is fillable', function () {
            $setting = new Setting;
            expect(in_array('value', $setting->getFillable()))->toBeTrue();
        });

        test('type field is fillable', function () {
            $setting = new Setting;
            expect(in_array('type', $setting->getFillable()))->toBeTrue();
        });
    });

    describe('casts configuration', function () {
        test('value should be cast to string', function () {
            $setting = new Setting;
            $casts = $setting->getCasts();
            expect($casts['value'])->toBe('string');
        });
    });

    describe('database interactions', function () {
        test('can create a setting', function () {
            $setting = Setting::create([
                'key' => 'test_key',
                'value' => 'test_value',
                'type' => 'test_type',
            ]);

            expect($setting->key)->toBe('test_key');
            expect($setting->value)->toBe('test_value');
            expect($setting->type)->toBe('test_type');
        });

        test('can retrieve a setting by key', function () {
            Setting::create([
                'key' => 'fonnte_api_token',
                'value' => 'test_token_123',
                'type' => 'whatsapp_config',
            ]);

            $setting = Setting::where('key', 'fonnte_api_token')->first();
            expect($setting)->not->toBeNull();
            expect($setting->value)->toBe('test_token_123');
        });

        test('can update a setting value', function () {
            $setting = Setting::create([
                'key' => 'test_key',
                'value' => 'original_value',
                'type' => 'test_type',
            ]);

            $setting->update(['value' => 'updated_value']);

            expect($setting->fresh()->value)->toBe('updated_value');
        });

        test('key must be unique', function () {
            Setting::create([
                'key' => 'unique_key',
                'value' => 'value1',
                'type' => 'test_type',
            ]);

            $this->expectException(\Illuminate\Database\QueryException::class);

            Setting::create([
                'key' => 'unique_key',
                'value' => 'value2',
                'type' => 'test_type',
            ]);
        });
    });
});
