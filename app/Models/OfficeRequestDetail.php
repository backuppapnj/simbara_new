<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Str;

class OfficeRequestDetail extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'request_id',
        'supply_id',
        'jumlah',
        'jumlah_diberikan',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (OfficeRequestDetail $detail): void {
            if (empty($detail->id)) {
                $detail->id = (string) Str::ulid();
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
        return [];
    }

    /**
     * The request that owns the detail.
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(OfficeRequest::class, 'request_id');
    }

    /**
     * The office supply for this detail.
     */
    public function supply(): BelongsTo
    {
        return $this->belongsTo(OfficeSupply::class, 'supply_id');
    }
}
