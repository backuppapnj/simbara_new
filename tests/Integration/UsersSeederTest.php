<?php

use App\Models\User;
use Database\Seeders\RolesSeeder;
use Database\Seeders\UsersSeeder;

describe('UsersSeeder', function (): void {
    beforeEach(function (): void {
        $this->seed(RolesSeeder::class);
    });

    it('can be instantiated', function (): void {
        $seeder = new UsersSeeder;

        expect($seeder)->toBeInstanceOf(UsersSeeder::class);
    });

    it('creates default super_admin user', function (): void {
        $seeder = new UsersSeeder;
        $seeder->run();

        $user = User::where('email', 'admin@demo.com')->first();

        expect($user)->not->toBeNull();
        expect($user->name)->toBe('Super Admin');
        expect($user->phone)->toBe('081234567890');
        expect($user->nip)->toBe('123456789012345678');
        expect($user->position)->toBe('Administrator Sistem');
        expect($user->hasRole('super_admin'))->toBeTrue();
    });

    it('creates sample users for each role', function (): void {
        $seeder = new UsersSeeder;
        $seeder->run();

        $expectedUsers = [
            ['email' => 'kpa@demo.com', 'role' => 'kpa'],
            ['email' => 'kasubag@demo.com', 'role' => 'kasubag_umum'],
            ['email' => 'operator_bmn@demo.com', 'role' => 'operator_bmn'],
            ['email' => 'operator_atk@demo.com', 'role' => 'operator_persediaan'],
            ['email' => 'pegawai@demo.com', 'role' => 'pegawai'],
        ];

        foreach ($expectedUsers as $expected) {
            $user = User::where('email', $expected['email'])->first();

            expect($user)->not->toBeNull("User with email {$expected['email']} should exist");
            expect($user->hasRole($expected['role']))->toBeTrue("User {$expected['email']} should have role {$expected['role']}");
        }
    });

    it('does not duplicate users when run multiple times', function (): void {
        $seeder = new UsersSeeder;

        $seeder->run();
        $seeder->run();

        expect(User::where('email', 'admin@demo.com')->count())->toBe(1);
        expect(User::count())->toBe(6);
    });

    it('hashes user passwords correctly', function (): void {
        $seeder = new UsersSeeder;
        $seeder->run();

        $user = User::where('email', 'admin@demo.com')->first();

        expect($user->password)->not->toBe('password');
        expect(password_verify('password', $user->password))->toBeTrue();
    });
});
