<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

class OfficeRequest extends Model
{
    use HasFactory;
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'no_permintaan',
        'user_id',
        'department_id',
        'tanggal',
        'status',
        'approved_by',
        'approved_at',
        'completed_at',
        'keterangan',
        'alasan_penolakan',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (OfficeRequest $request): void {
            if (empty($request->id)) {
                $request->id = (string) Str::ulid();
            }
            if (empty($request->no_permintaan)) {
                $request->no_permintaan = 'REQ-'.date('Ymd').'-'.strtoupper(substr((string) Str::ulid(), -6));
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'tanggal' => 'date',
            'approved_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * Details for this request.
     */
    public function details(): HasMany
    {
        return $this->hasMany(OfficeRequestDetail::class, 'request_id');
    }

    /**
     * The user that created the request.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The department for this request.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * The user who approved the request.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
