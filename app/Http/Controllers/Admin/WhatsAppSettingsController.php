<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppSettingsController extends Controller
{
    use AuthorizesRequests;

    private const FONNTE_TOKEN_KEY = 'fonnte_api_token';

    /**
     * Display WhatsApp settings page.
     */
    public function index(): Response
    {
        $this->authorize('viewWhatsAppSettings', Setting::class);

        $token = Setting::where('key', self::FONNTE_TOKEN_KEY)->first();

        return Inertia::render('Admin/WhatsAppSettings', [
            'apiToken' => $token ? $this->maskToken($token->value) : null,
            'hasToken' => (bool) $token,
        ]);
    }

    /**
     * Update the WhatsApp API token.
     */
    public function update(Request $request): RedirectResponse
    {
        $this->authorize('updateWhatsAppSettings', Setting::class);

        $validated = $request->validate([
            'api_token' => ['required', 'string', 'min:10'],
        ]);

        Setting::updateOrCreate(
            ['key' => self::FONNTE_TOKEN_KEY],
            [
                'value' => $validated['api_token'],
                'type' => 'whatsapp_config',
            ]
        );

        return redirect()
            ->back()
            ->with('success', 'WhatsApp API token updated successfully.');
    }

    /**
     * Test send a WhatsApp message.
     */
    public function testSend(Request $request): RedirectResponse
    {
        $this->authorize('testWhatsApp', Setting::class);

        $validated = $request->validate([
            'phone' => ['required', 'regex:/^(\+62|62|0)8[1-9][0-9]{6,9}$/'],
            'message' => ['required', 'string', 'min:5', 'max:1000'],
        ]);

        $token = Setting::where('key', self::FONNTE_TOKEN_KEY)->first();

        if (! $token) {
            return redirect()
                ->back()
                ->with('error', 'WhatsApp API token not configured.');
        }

        try {
            $response = Http::withToken($token->value)
                ->post('https://api.fonnte.com/send', [
                    'target' => $this->formatPhone($validated['phone']),
                    'message' => $validated['message'],
                ]);

            $result = $response->json();

            if ($response->successful() && ($result['status'] ?? false)) {
                return redirect()
                    ->back()
                    ->with('success', 'Test message sent successfully.');
            }

            return redirect()
                ->back()
                ->with('error', 'Failed to send message: '.($result['reason'] ?? 'Unknown error'));
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Error sending message: '.$e->getMessage());
        }
    }

    /**
     * Mask the API token for display.
     */
    private function maskToken(string $token): string
    {
        if (strlen($token) <= 8) {
            return '****';
        }

        $start = substr($token, 0, 4);
        $end = substr($token, -4);

        return $start.'****'.$end;
    }

    /**
     * Format phone number to +62 format.
     */
    private function formatPhone(string $phone): string
    {
        return preg_replace('/^(0|62)/', '+62', $phone);
    }
}
