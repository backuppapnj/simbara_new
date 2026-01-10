<?php

use Laravel\Fortify\Features;

describe('Fortify Configuration', function (): void {
    beforeEach(function (): void {
        $this->config = require base_path('config/fortify.php');
    });

    it('config file exists and is valid', function (): void {
        expect($this->config)->toBeArray();
        expect($this->config)->toHaveKey('features');
        expect($this->config)->toHaveKey('views');
    });

    describe('Features Configuration', function (): void {
        it('enables user registration feature', function (): void {
            $features = $this->config['features'];

            expect($features)->toContain(Features::registration());
        });

        it('enables password reset feature', function (): void {
            $features = $this->config['features'];

            expect($features)->toContain(Features::resetPasswords());
        });

        it('disables email verification feature', function (): void {
            $features = $this->config['features'];

            expect($features)->not->toContain(Features::emailVerification());
        });

        it('enables two factor authentication feature', function (): void {
            $features = $this->config['features'];

            expect($features)->toContain(Features::twoFactorAuthentication());
        });
    });

    describe('View Configuration', function (): void {
        it('disables view routes for Inertia integration', function (): void {
            expect($this->config['views'])->toBeFalse();
        });
    });

    describe('Password Reset Configuration', function (): void {
        it('has password broker configured', function (): void {
            expect($this->config['passwords'])->toBe('users');
        });

        it('has rate limiting for login', function (): void {
            expect($this->config['limiters'])->toHaveKey('login');
        });

        it('has rate limiting for two-factor', function (): void {
            expect($this->config['limiters'])->toHaveKey('two-factor');
        });
    });
});
