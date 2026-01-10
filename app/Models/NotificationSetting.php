<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationSetting extends Model
{
    /** @use HasFactory<\Database\Factories\NotificationSettingFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'whatsapp_enabled',
        'push_enabled',
        'notify_reorder_alert',
        'notify_approval_needed',
        'notify_request_update',
        'quiet_hours_start',
        'quiet_hours_end',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'whatsapp_enabled' => 'boolean',
            'push_enabled' => 'boolean',
            'notify_reorder_alert' => 'boolean',
            'notify_approval_needed' => 'boolean',
            'notify_request_update' => 'boolean',
        ];
    }

    /**
     * Get the user that owns the notification settings.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
