<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\NotificationSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final readonly class NotificationSettingController
{
    /**
     * Display the user's notification settings.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $settings = $user->notificationSetting ?? NotificationSetting::create([
            'user_id' => $user->id,
            'whatsapp_enabled' => true,
            'push_enabled' => true,
            'notify_reorder_alert' => true,
            'notify_approval_needed' => true,
            'notify_request_update' => false,
        ]);

        return Inertia::render('settings/Notifications', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update the user's notification settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'whatsapp_enabled' => ['sometimes', 'boolean'],
            'push_enabled' => ['sometimes', 'boolean'],
            'notify_reorder_alert' => ['sometimes', 'boolean'],
            'notify_approval_needed' => ['sometimes', 'boolean'],
            'notify_request_update' => ['sometimes', 'boolean'],
            'quiet_hours_start' => [
                'nullable',
                'date_format:H:i',
                'required_with:quiet_hours_end',
            ],
            'quiet_hours_end' => [
                'nullable',
                'date_format:H:i',
                'required_with:quiet_hours_start',
            ],
        ]);

        $user = Auth::user();

        $user->notificationSetting()->updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return redirect()
            ->back()
            ->with('success', 'Notification settings updated successfully.');
    }
}
