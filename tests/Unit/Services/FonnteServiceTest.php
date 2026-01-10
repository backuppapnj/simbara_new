<?php

use App\Models\Setting;
use App\Services\FonnteService;
use Illuminate\Support\Facades\Http;

describe('FonnteService', function () {
    beforeEach(function () {
        // Create a test API token setting
        Setting::create([
            'key' => 'fonnte_api_token',
            'value' => 'test_token_12345',
            'type' => 'whatsapp_config',
        ]);
    });

    describe('formatPhone()', function () {
        test('converts 08 format to +62 format', function () {
            $service = new FonnteService;

            $result = $service->formatPhone('081234567890');
            expect($result)->toBe('+6281234567890');
        });

        test('converts 62 format to +62 format', function () {
            $service = new FonnteService;

            $result = $service->formatPhone('6281234567890');
            expect($result)->toBe('+6281234567890');
        });

        test('keeps +62 format unchanged', function () {
            $service = new FonnteService;

            $result = $service->formatPhone('+6281234567890');
            expect($result)->toBe('+6281234567890');
        });

        test('handles various Indonesian phone numbers', function () {
            $service = new FonnteService;

            expect($service->formatPhone('0812345678'))->toBe('+62812345678');
            expect($service->formatPhone('085712345678'))->toBe('+6285712345678');
            expect($service->formatPhone('089876543210'))->toBe('+6289876543210');
        });

        test('removes non-numeric characters except plus sign', function () {
            $service = new FonnteService;

            $result = $service->formatPhone('0812-3456-7890');
            expect($result)->toBe('+6281234567890');
        });

        test('throws exception for invalid phone format', function () {
            $service = new FonnteService;

            $this->expectException(\InvalidArgumentException::class);
            $service->formatPhone('invalid_phone');
        });
    });

    describe('send()', function () {
        test('sends message to Fonnte API', function () {
            Http::fake([
                'api.fonnte.com/send' => Http::response([
                    'status' => true,
                    'message' => 'Success',
                ], 200),
            ]);

            $service = new FonnteService;
            $result = $service->send('+6281234567890', 'Test message');

            expect($result)->toBeArray();
            expect($result['status'])->toBeTrue();
            expect($result['message'])->toBe('Success');

            Http::assertSent(function ($request) {
                return $request->url() === 'https://api.fonnte.com/send'
                    && $request->method() === 'POST'
                    && $request->hasHeader('Authorization', 'Bearer test_token_12345')
                    && $request['target'] === '+6281234567890'
                    && $request['message'] === 'Test message';
            });
        });

        test('formats phone number before sending', function () {
            Http::fake([
                'api.fonnte.com/send' => Http::response([
                    'status' => true,
                ], 200),
            ]);

            $service = new FonnteService;
            $service->send('081234567890', 'Test message');

            Http::assertSent(function ($request) {
                return $request['target'] === '+6281234567890';
            });
        });

        test('throws exception when API token is missing', function () {
            Setting::where('key', 'fonnte_api_token')->delete();

            $this->expectException(\Exception::class);
            $this->expectExceptionMessage('Fonnte API token not configured');

            $service = new FonnteService;
            $service->send('+6281234567890', 'Test message');
        });

        test('throws exception on API error response', function () {
            Http::fake([
                'api.fonnte.com/send' => Http::response([
                    'status' => false,
                    'message' => 'Invalid token',
                ], 401),
            ]);

            $this->expectException(\Exception::class);
            $this->expectExceptionMessage('Fonnte API error: Invalid token');

            $service = new FonnteService;
            $service->send('+6281234567890', 'Test message');
        });

        test('throws exception on network failure', function () {
            Http::fake(function () {
                throw new \Illuminate\Http\Client\ConnectionException('Connection timeout');
            });

            $this->expectException(\Illuminate\Http\Client\ConnectionException::class);

            $service = new FonnteService;
            $service->send('+6281234567890', 'Test message');
        });

        test('handles API rate limiting', function () {
            Http::fake([
                'api.fonnte.com/send' => Http::response([
                    'status' => false,
                    'message' => 'Rate limit exceeded',
                ], 429),
            ]);

            $this->expectException(\Exception::class);
            $this->expectExceptionMessage('Fonnte API error: Rate limit exceeded');

            $service = new FonnteService;
            $service->send('+6281234567890', 'Test message');
        });

        test('retries on transient failures', function () {
            $attempts = 0;

            Http::fake(function () use (&$attempts) {
                $attempts++;

                if ($attempts < 3) {
                    return Http::response([
                        'status' => false,
                        'message' => 'Temporary error',
                    ], 500);
                }

                return Http::response([
                    'status' => true,
                    'message' => 'Success',
                ], 200);
            });

            $service = new FonnteService;
            $result = $service->send('+6281234567890', 'Test message');

            expect($result['status'])->toBeTrue();
            expect($attempts)->toBe(3);
        });
    });

    describe('constructor', function () {
        test('retrieves API token from database', function () {
            Setting::where('key', 'fonnte_api_token')->update([
                'value' => 'my_custom_token',
            ]);

            $service = new FonnteService;

            expect($service->getApiTokenPublic())->toBe('my_custom_token');
        });

        test('caches API token for performance', function () {
            $service1 = new FonnteService;
            $service2 = new FonnteService;

            expect($service1->getApiTokenPublic())->toBe($service2->getApiTokenPublic());
        });
    });
});
