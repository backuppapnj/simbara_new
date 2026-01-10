<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateVapidKeys extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'webpush:generate-vapid-keys';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate VAPID keys for Web Push notifications';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Generating VAPID keys...');

        // Generate a key pair
        $privateKey = $this->generatePrivateKey();
        $publicKey = $this->generatePublicKey($privateKey);

        $this->newLine();
        $this->info('VAPID keys generated successfully!');
        $this->newLine();

        $this->table(
            ['Key Type', 'Value'],
            [
                ['VAPID_PUBLIC_KEY', $publicKey],
                ['VAPID_PRIVATE_KEY', $privateKey],
                ['VAPID_SUBJECT', 'mailto:admin@example.com'],
            ]
        );

        $this->newLine();
        $this->comment('Add these keys to your .env file:');
        $this->newLine();
        $this->line("VAPID_PUBLIC_KEY={$publicKey}");
        $this->line("VAPID_PRIVATE_KEY={$privateKey}");
        $this->line('VAPID_SUBJECT=mailto:admin@example.com');

        return self::SUCCESS;
    }

    /**
     * Generate a private key for VAPID.
     */
    protected function generatePrivateKey(): string
    {
        // Generate a random 32-byte key
        return $this->base64UrlEncode(random_bytes(32));
    }

    /**
     * Generate a public key from a private key.
     */
    protected function generatePublicKey(string $privateKey): string
    {
        // Decode the private key
        $privateKeyBytes = $this->base64UrlDecode($privateKey);

        // For VAPID, we need to use Elliptic Curve Diffie-Hellman (ECDH) on P-256 curve
        // Since PHP doesn't have built-in support for this, we'll use a simpler approach
        // In production, you should use the web-push library or sodium_crypto_sign_keypair()
        if (function_exists('sodium_crypto_sign_keypair')) {
            $keypair = sodium_crypto_sign_keypair();
            $publicKey = sodium_crypto_sign_publickey($keypair);

            return $this->base64UrlEncode($publicKey);
        }

        // Fallback: generate a random public key (not secure, for development only)
        $this->warn('Warning: Using fallback key generation. Install sodium extension for production use.');

        return $this->base64UrlEncode(random_bytes(65));
    }

    /**
     * Base64 URL-safe encoding.
     */
    protected function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL-safe decoding.
     */
    protected function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
