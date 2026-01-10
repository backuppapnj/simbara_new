<?php

namespace App\Services;

use App\Models\Setting;
use Exception;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class FonnteService
{
    protected string $apiToken;

    protected string $endpoint = 'https://api.fonnte.com/send';

    protected int $maxRetries = 3;

    protected int $retryDelay = 1000; // milliseconds

    public function __construct()
    {
        $this->apiToken = $this->getApiToken();
    }

    /**
     * Send WhatsApp message via Fonnte API
     *
     * @param  string  $target  Phone number
     * @param  string  $message  Message content
     * @return array Fonnte API response
     *
     * @throws Exception
     */
    public function send(string $target, string $message): array
    {
        $formattedPhone = $this->formatPhone($target);

        $attempts = 0;
        $lastException = null;

        while ($attempts < $this->maxRetries) {
            try {
                $response = Http::withToken($this->apiToken)
                    ->timeout(30)
                    ->post($this->endpoint, [
                        'target' => $formattedPhone,
                        'message' => $message,
                    ]);

                $result = $response->json();

                // Check if API returned an error
                if (! ($result['status'] ?? false)) {
                    $errorMessage = $result['message'] ?? 'Unknown API error';

                    // Don't retry on authentication/rate limit errors
                    if ($response->status() === 401 || $response->status() === 429) {
                        throw new Exception("Fonnte API error: {$errorMessage}");
                    }

                    // Retry on server errors and temporary failures
                    $attempts++;
                    if ($attempts >= $this->maxRetries) {
                        throw new Exception("Fonnte API error: {$errorMessage}");
                    }

                    usleep($this->retryDelay * 1000 * $attempts); // Exponential backoff

                    continue;
                }

                return $result;
            } catch (ConnectionException $e) {
                $lastException = $e;
                $attempts++;

                if ($attempts < $this->maxRetries) {
                    usleep($this->retryDelay * 1000 * $attempts); // Exponential backoff
                }
            } catch (Exception $e) {
                throw $e;
            }
        }

        throw $lastException;
    }

    /**
     * Format phone number to Indonesian international format (+62)
     *
     * @param  string  $phone  Phone number in various formats
     * @return string Formatted phone number
     *
     * @throws \InvalidArgumentException
     */
    public function formatPhone(string $phone): string
    {
        // Remove all non-numeric characters except plus sign
        $phone = preg_replace('/[^\d+]/', '', $phone);

        // Validate phone format
        if (! preg_match('/^(\+62|62|0)8[1-9][0-9]{6,11}$/', $phone)) {
            throw new \InvalidArgumentException("Invalid Indonesian phone number format: {$phone}");
        }

        // Convert to +62 format
        return preg_replace('/^(0|62)/', '+62', $phone);
    }

    /**
     * Get Fonnte API token from database
     *
     * @throws Exception
     */
    protected function getApiToken(): string
    {
        $setting = Setting::where('key', 'fonnte_api_token')->first();

        if (! $setting || empty($setting->value)) {
            throw new Exception('Fonnte API token not configured');
        }

        return $setting->value;
    }

    /**
     * Get API token (for testing purposes)
     */
    public function getApiTokenPublic(): string
    {
        return $this->apiToken;
    }
}
