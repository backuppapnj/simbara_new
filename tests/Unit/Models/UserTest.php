<?php

use App\Models\User;

describe('User Model', function () {
    describe('fillable attributes', function () {
        test('phone field is fillable', function () {
            $user = new User;
            expect(in_array('phone', $user->getFillable()))->toBeTrue();
        });

        test('nip field is fillable', function () {
            $user = new User;
            expect(in_array('nip', $user->getFillable()))->toBeTrue();
        });

        test('position field is fillable', function () {
            $user = new User;
            expect(in_array('position', $user->getFillable()))->toBeTrue();
        });

        test('is_active field is fillable', function () {
            $user = new User;
            expect(in_array('is_active', $user->getFillable()))->toBeTrue();
        });

        test('name field is fillable', function () {
            $user = new User;
            expect(in_array('name', $user->getFillable()))->toBeTrue();
        });

        test('email field is fillable', function () {
            $user = new User;
            expect(in_array('email', $user->getFillable()))->toBeTrue();
        });

        test('password field is fillable', function () {
            $user = new User;
            expect(in_array('password', $user->getFillable()))->toBeTrue();
        });
    });

    describe('casts configuration', function () {
        test('is_active should be cast to boolean', function () {
            $user = new User;
            $casts = $user->getCasts();
            expect($casts['is_active'])->toBe('boolean');
        });

        test('email_verified_at should be cast to datetime', function () {
            $user = new User;
            $casts = $user->getCasts();
            expect($casts['email_verified_at'])->toBe('datetime');
        });

        test('password should be cast to hashed', function () {
            $user = new User;
            $casts = $user->getCasts();
            expect($casts['password'])->toBe('hashed');
        });

        test('two_factor_confirmed_at should be cast to datetime', function () {
            $user = new User;
            $casts = $user->getCasts();
            expect($casts['two_factor_confirmed_at'])->toBe('datetime');
        });
    });
});
