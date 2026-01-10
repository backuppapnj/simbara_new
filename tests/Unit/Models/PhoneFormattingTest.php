<?php

use App\Models\User;

describe('Phone Number Formatting', function () {
    describe('phone accessor', function () {
        test('phone can be stored with +62 format', function () {
            $user = User::factory()->create(['phone' => '+6281234567890']);
            expect($user->phone)->toBe('+6281234567890');
        });

        test('phone can be stored with 62 format', function () {
            $user = User::factory()->create(['phone' => '6281234567890']);
            expect($user->phone)->toBe('+6281234567890');
        });

        test('phone can be stored with 08 format', function () {
            $user = User::factory()->create(['phone' => '081234567890']);
            expect($user->phone)->toBe('+6281234567890');
        });
    });

    describe('phone validation', function () {
        test('phone accepts valid format starting with +62', function () {
            $user = User::factory()->make(['phone' => '+6281234567890']);
            expect($user->phone)->toBe('+6281234567890');
        });

        test('phone accepts valid format starting with 62', function () {
            $user = User::factory()->make(['phone' => '6281234567890']);
            expect($user->phone)->toBe('+6281234567890');
        });

        test('phone accepts valid format starting with 0', function () {
            $user = User::factory()->make(['phone' => '081234567890']);
            expect($user->phone)->toBe('+6281234567890');
        });

        test('phone validates correct length (10-12 digits after country code)', function () {
            $user = User::factory()->make(['phone' => '08123456789']); // 10 digits
            expect($user->phone)->toBe('+628123456789');

            $user2 = User::factory()->make(['phone' => '081234567890']); // 11 digits
            expect($user2->phone)->toBe('+6281234567890');

            $user3 = User::factory()->make(['phone' => '0812345678901']); // 12 digits
            expect($user3->phone)->toBe('+62812345678901');
        });
    });

    describe('database interaction', function () {
        test('can create user with phone number', function () {
            $user = User::factory()->create(['phone' => '081234567890']);
            expect($user->phone)->toBe('+6281234567890');
            expect($user->fresh()->phone)->toBe('+6281234567890');
        });

        test('can update user phone number', function () {
            $user = User::factory()->create(['phone' => '081234567890']);
            $user->update(['phone' => '081987654321']);

            expect($user->fresh()->phone)->toBe('+6281987654321');
        });

        test('phone number is unique in database', function () {
            User::factory()->create(['phone' => '081234567890', 'email' => 'user1@test.com']);

            $this->expectException(\Illuminate\Database\QueryException::class);

            User::factory()->create(['phone' => '081234567890', 'email' => 'user2@test.com']);
        });
    });

    describe('phone field properties', function () {
        test('phone field is fillable', function () {
            $user = new User;
            expect(in_array('phone', $user->getFillable()))->toBeTrue();
        });

        test('phone is cast to string', function () {
            $user = new User;
            $casts = $user->getCasts();
            expect($casts['phone'])->toBe('string');
        });
    });
});
