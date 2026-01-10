<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationLog extends Model
{
    /** @use HasFactory<\Database\Factories\NotificationLogFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'event_type',
        'phone',
        'message',
        'status',
        'fonnte_response',
        'error_message',
        'retry_count',
        'sent_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fonnte_response' => 'array',
            'sent_at' => 'datetime',
            'retry_count' => 'int',
        ];
    }

    /**
     * Get the user that owns the notification log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
