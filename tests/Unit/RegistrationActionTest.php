<?php

use App\Actions\Fortify\CreateNewUser;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

describe('CreateNewUser validation', function (): void {
    it('validates phone field with max 20 characters', function (): void {
        $input = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => str_repeat('1', 21), // 21 characters - should fail
            'nip' => '1234567890',
        ];

        $rules = (new CreateNewUser)->rules($input);

        expect(Validator::make($input, $rules)->fails())->toBeTrue();
    });

    it('validates nip field with max 20 characters', function (): void {
        $input = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '081234567890',
            'nip' => str_repeat('1', 21), // 21 characters - should fail
        ];

        $rules = (new CreateNewUser)->rules($input);

        expect(Validator::make($input, $rules)->fails())->toBeTrue();
    });

    it('requires phone field', function (): void {
        $input = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'nip' => '1234567890',
        ];

        $rules = (new CreateNewUser)->rules($input);

        expect(Validator::make($input, $rules)->fails())->toBeTrue();
    });

    it('requires nip field', function (): void {
        $input = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '081234567890',
        ];

        $rules = (new CreateNewUser)->rules($input);

        expect(Validator::make($input, $rules)->fails())->toBeTrue();
    });

    it('validates unique phone', function (): void {
        User::factory()->create([
            'phone' => '081234567890',
            'nip' => '1111111111',
        ]);

        $input = [
            'name' => 'Test User',
            'email' => 'test2@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '081234567890', // duplicate phone
            'nip' => '2222222222',
        ];

        $rules = (new CreateNewUser)->rules($input);

        expect(Validator::make($input, $rules)->fails())->toBeTrue();
    });

    it('validates unique nip', function (): void {
        User::factory()->create([
            'phone' => '1111111111',
            'nip' => '1234567890',
        ]);

        $input = [
            'name' => 'Test User',
            'email' => 'test2@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '2222222222',
            'nip' => '1234567890', // duplicate nip
        ];

        $rules = (new CreateNewUser)->rules($input);

        expect(Validator::make($input, $rules)->fails())->toBeTrue();
    });
});

describe('CreateNewUser user creation', function (): void {
    it('creates user with phone and nip fields', function (): void {
        $input = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '081234567890',
            'nip' => '1234567890',
        ];

        $user = (new CreateNewUser)->create($input);

        expect($user)->toBeInstanceOf(User::class);
        expect($user->name)->toBe('Test User');
        expect($user->email)->toBe('test@example.com');
        expect($user->phone)->toBe('+6281234567890');
        expect($user->nip)->toBe('1234567890');
    });
});
