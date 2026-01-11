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
        expect($user->phone)->toBe('+6281234567890'); // Phone is auto-formatted to +62
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
        // Count: 1 (admin@demo.com) + 5 (sample users) + 8 (multi-role test users) + 29 (from pegawai data) = 43
        expect(User::count())->toBe(43);
    });

    it('hashes user passwords correctly', function (): void {
        $seeder = new UsersSeeder;
        $seeder->run();

        $user = User::where('email', 'admin@demo.com')->first();

        expect($user->password)->not->toBe('password');
        expect(password_verify('password', $user->password))->toBeTrue();
    });

    it('creates pure super admin with only super_admin role', function (): void {
        $seeder = new UsersSeeder;
        $seeder->run();

        $user = User::where('email', 'super@admin.com')->first();

        expect($user)->not->toBeNull();
        expect($user->name)->toBe('Pure Super Admin');
        expect($user->hasRole('super_admin'))->toBeTrue();
        expect($user->hasAnyRole(['kpa', 'kasubag_umum', 'operator_bmn', 'operator_persediaan', 'pegawai']))->toBeFalse();
        expect($user->roles->count())->toBe(1);
    });

    it('creates multi-role user with KPA and Kasubag Umum roles', function (): void {
        $seeder = new UsersSeeder;
        $seeder->run();

        $user = User::where('email', 'kpa-kasubag@test.com')->first();

        expect($user)->not->toBeNull();
        expect($user->name)->toBe('KPA Kasubag Umum');
        expect($user->hasRole('kpa'))->toBeTrue();
        expect($user->hasRole('kasubag_umum'))->toBeTrue();
        expect($user->roles->count())->toBe(2);
    });

    it('creates multi-role user with both operator roles', function (): void {
        $seeder = new UsersSeeder;
        $seeder->run();

        $user = User::where('email', 'operator-both@test.com')->first();

        expect($user)->not->toBeNull();
        expect($user->name)->toBe('Operator Ganda');
        expect($user->hasRole('operator_bmn'))->toBeTrue();
        expect($user->hasRole('operator_persediaan'))->toBeTrue();
        expect($user->roles->count())->toBe(2);
    });

    it('creates multi-role user with pegawai and operator roles', function (): void {
        $seeder = new UsersSeeder;
        $seeder->run();

        $user = User::where('email', 'pegawai-operator@test.com')->first();

        expect($user)->not->toBeNull();
        expect($user->name)->toBe('Pegawai Operator');
        expect($user->hasRole('pegawai'))->toBeTrue();
        expect($user->hasRole('operator_persediaan'))->toBeTrue();
        expect($user->roles->count())->toBe(2);
    });

    it('creates multi-role user with KPA and operator BMN roles', function (): void {
        $seeder = new UsersSeeder;
        $seeder->run();

        $user = User::where('email', 'kpa-operator-bmn@test.com')->first();

        expect($user)->not->toBeNull();
        expect($user->name)->toBe('KPA Operator BMN');
        expect($user->hasRole('kpa'))->toBeTrue();
        expect($user->hasRole('operator_bmn'))->toBeTrue();
        expect($user->roles->count())->toBe(2);
    });

    it('creates single-role baseline users for comparison', function (): void {
        $seeder = new UsersSeeder;
        $seeder->run();

        $kpaOnly = User::where('email', 'kpa-only@test.com')->first();
        $kasubagOnly = User::where('email', 'kasubag-only@test.com')->first();

        expect($kpaOnly)->not->toBeNull();
        expect($kpaOnly->hasRole('kpa'))->toBeTrue();
        expect($kpaOnly->roles->count())->toBe(1);

        expect($kasubagOnly)->not->toBeNull();
        expect($kasubagOnly->hasRole('kasubag_umum'))->toBeTrue();
        expect($kasubagOnly->roles->count())->toBe(1);
    });

    it('does not duplicate roles when run multiple times', function (): void {
        $seeder = new UsersSeeder;

        $seeder->run();
        $seeder->run();

        $user = User::where('email', 'kpa-kasubag@test.com')->first();

        expect($user->roles->count())->toBe(2);
        expect($user->hasRole('kpa'))->toBeTrue();
        expect($user->hasRole('kasubag_umum'))->toBeTrue();
    });

    it('counts all test users correctly including multi-role users', function (): void {
        $seeder = new UsersSeeder;
        $seeder->run();

        // Count specific test users we created
        $testUsers = [
            'super@admin.com',
            'kpa-kasubag@test.com',
            'operator-both@test.com',
            'pegawai-operator@test.com',
            'kpa-operator-bmn@test.com',
            'all-operators@test.com',
            'kpa-only@test.com',
            'kasubag-only@test.com',
        ];

        foreach ($testUsers as $email) {
            expect(User::where('email', $email)->exists())->toBeTrue("User with email {$email} should exist");
        }
    });
});
