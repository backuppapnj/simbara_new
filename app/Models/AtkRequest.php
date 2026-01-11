<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AtkRequest extends Model
{
    use HasFactory;
    use HasUlids;
    use SoftDeletes;

    protected $fillable = [
        'no_permintaan',
        'user_id',
        'department_id',
        'tanggal',
        'status',
        'level1_approval_by',
        'level1_approval_at',
        'level2_approval_by',
        'level2_approval_at',
        'level3_approval_by',
        'level3_approval_at',
        'distributed_by',
        'distributed_at',
        'received_at',
        'keterangan',
        'alasan_penolakan',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (AtkRequest $request): void {
            if (empty($request->no_permintaan)) {
                // Use a more reliable method to generate the request number
                $request->no_permintaan = 'REQ-'.date('Ymd').'-'.str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT);
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
            'level1_approval_at' => 'datetime',
            'level2_approval_at' => 'datetime',
            'level3_approval_at' => 'datetime',
            'distributed_at' => 'datetime',
            'received_at' => 'datetime',
        ];
    }

    /**
     * Request details for this request.
     */
    public function requestDetails(): HasMany
    {
        return $this->hasMany(RequestDetail::class, 'request_id');
    }

    /**
     * The user who created the request.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The department of the request.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Level 1 approver (Operator Persediaan).
     */
    public function level1Approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'level1_approval_by');
    }

    /**
     * Level 2 approver (Kasubag Umum).
     */
    public function level2Approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'level2_approval_by');
    }

    /**
     * Level 3 approver (KPA).
     */
    public function level3Approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'level3_approval_by');
    }

    /**
     * User who distributed the items.
     */
    public function distributedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'distributed_by');
    }
}
